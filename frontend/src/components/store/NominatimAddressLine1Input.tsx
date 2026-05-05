"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IndianMappedAddressFields, NominatimSearchHit } from "@/lib/nominatim-address";
import { mapNominatimHitToIndianAddress } from "@/lib/nominatim-address";

const DEBOUNCE_MS = 500;

export type NominatimAddressLine1InputProps = {
  value: string;
  onChange: (nextLine1: string) => void;
  /** Called when the user picks a suggestion; merge into your form state. */
  onPick: (mapped: IndianMappedAddressFields) => void;
  inputClassName?: string;
  /** Optional hint below the label (rendered by parent). This component only renders the input + dropdown. */
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
};

export function NominatimAddressLine1Input({
  value,
  onChange,
  onPick,
  inputClassName,
  disabled,
  autoComplete = "street-address",
  required,
}: NominatimAddressLine1InputProps) {
  const [suggestions, setSuggestions] = useState<NominatimSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const blurCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionAbortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBlurTimer = () => {
    if (blurCloseTimer.current) {
      clearTimeout(blurCloseTimer.current);
      blurCloseTimer.current = null;
    }
  };

  const fetchSuggestions = useCallback(async (term: string) => {
    const q = term.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    suggestionAbortRef.current?.abort();
    const controller = new AbortController();
    suggestionAbortRef.current = controller;

    setLoading(true);
    setSuggestions([]);

    try {
      const response = await fetch(`/api/nominatim/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        setSuggestions([]);
        return;
      }
      const data = (await response.json()) as NominatimSearchHit[];
      if (!controller.signal.aborted) {
        setSuggestions(Array.isArray(data) ? data : []);
        setHighlightIndex(-1);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setSuggestions([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      clearBlurTimer();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      suggestionAbortRef.current?.abort();
    };
  }, []);

  const applySuggestion = (hit: NominatimSearchHit) => {
    const mapped = mapNominatimHitToIndianAddress(hit);
    onPick(mapped);
    setSuggestions([]);
    setOpen(false);
    setHighlightIndex(-1);
    suggestionAbortRef.current?.abort();
    setLoading(false);
  };

  const defaultInputCls =
    "w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[var(--color-blue)]/10";
  const inputCls = inputClassName ? `w-full min-w-0 ${inputClassName}` : defaultInputCls;

  return (
    <div className="relative z-20 w-full min-w-0">
      <input
        type="text"
        value={value}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={inputCls}
        placeholder="House no, street, area — search as you type"
        aria-expanded={open}
        aria-controls="checkout-address-suggest-list"
        aria-activedescendant={highlightIndex >= 0 ? `checkout-address-suggest-${highlightIndex}` : undefined}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next);
          setOpen(true);
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            void fetchSuggestions(next);
          }, DEBOUNCE_MS);
        }}
        onFocus={() => {
          clearBlurTimer();
          setOpen(true);
          const q = value.trim();
          if (q.length >= 3) {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              void fetchSuggestions(q);
            }, DEBOUNCE_MS);
          }
        }}
        onBlur={() => {
          blurCloseTimer.current = setTimeout(() => {
            setOpen(false);
            setHighlightIndex(-1);
          }, 180);
        }}
        onKeyDown={(event) => {
          if (!open || suggestions.length === 0) {
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightIndex((i) => Math.max(i - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            const pick = highlightIndex >= 0 ? suggestions[highlightIndex] : suggestions[0];
            if (pick) {
              applySuggestion(pick);
            }
          } else if (event.key === "Escape") {
            setOpen(false);
            setHighlightIndex(-1);
          }
        }}
      />

      {open && (loading || suggestions.length > 0) ? (
        <ul
          id="checkout-address-suggest-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-[var(--color-border)] bg-white py-2 shadow-xl shadow-slate-900/10"
        >
          {loading ? (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-ink-soft)]">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-blue)]/25 border-t-[var(--color-blue)]"
                aria-hidden
              />
              Loading suggestions…
            </li>
          ) : null}
          {!loading &&
            suggestions.map((hit, index) => (
              <li key={`${hit.display_name}-${index}`} role="presentation">
                <button
                  type="button"
                  role="option"
                  id={`checkout-address-suggest-${index}`}
                  aria-selected={highlightIndex === index}
                  className={`w-full px-4 py-3 text-left text-sm leading-snug transition hover:bg-[var(--color-surface)] ${
                    highlightIndex === index ? "bg-[var(--color-surface)]" : ""
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applySuggestion(hit)}
                >
                  {hit.display_name}
                </button>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
