"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SurfaceCard } from "@/components/ui/surface-card";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { ProductImage } from "@/lib/types";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (!isZoomOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isZoomOpen]);

  if (images.length === 0) {
    return (
      <SurfaceCard className="flex min-h-80 items-center justify-center rounded-4xl p-6 text-center sm:min-h-105 sm:rounded-[2.4rem]">
        <p className="max-w-sm text-sm leading-7 text-[var(--color-ink-soft)]">
          Product imagery will appear here once the catalog is updated.
        </p>
      </SurfaceCard>
    );
  }

  const activeIndex = selectedIndex >= images.length ? 0 : selectedIndex;
  const activeImage = images[activeIndex] ?? images[0];
  const activeWidth = activeImage.width || 1200;
  const activeHeight = activeImage.height || 1200;

  const moveSelection = (direction: number) => {
    const nextIndex = (activeIndex + direction + images.length) % images.length;
    setSelectedIndex(nextIndex);
  };

  return (
    <>
      <SurfaceCard className="rounded-4xl p-3 sm:rounded-[2.4rem] sm:p-5" tone="elevated">
        <div className="relative overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,#fcfaf6_0%,#f3ede4_100%)]">
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="block w-full text-left"
            aria-label={`Zoom ${productName} image ${activeIndex + 1}`}
          >
            <Image
              src={resolveAssetUrl(activeImage.imageUrl)}
              alt={`${productName} image ${activeIndex + 1}`}
              width={activeWidth}
              height={activeHeight}
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="h-75 w-full object-contain p-3 sm:h-105 sm:p-5 lg:h-130"
            />
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => moveSelection(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-[var(--color-blue)] shadow-[0_12px_26px_rgba(30,41,73,0.12)] sm:left-4 sm:text-sm"
                aria-label="Show previous image"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => moveSelection(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-[var(--color-blue)] shadow-[0_12px_26px_rgba(30,41,73,0.12)] sm:right-4 sm:text-sm"
                aria-label="Show next image"
              >
                Next
              </button>
              <div className="absolute bottom-4 right-4 rounded-full bg-[var(--color-blue)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
            {images.map((image, index) => {
              const thumbWidth = image.width || 480;
              const thumbHeight = image.height || 480;

              return (
                <button
                  key={`${image.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Show ${productName} thumbnail ${index + 1}`}
                  className={`overflow-hidden rounded-[1.2rem] border bg-white p-1 transition ${
                    index === activeIndex
                      ? "border-[var(--color-orange)] shadow-[0_12px_24px_rgba(208,125,85,0.16)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <Image
                    src={resolveAssetUrl(image.imageUrl)}
                    alt={`${productName} thumbnail ${index + 1}`}
                    width={thumbWidth}
                    height={thumbHeight}
                    sizes="120px"
                    className="h-16 w-full rounded-[0.9rem] object-cover sm:h-20"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </SurfaceCard>

      {isZoomOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-3 sm:p-4" role="dialog" aria-modal="true" aria-label={`${productName} image preview`}>
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close zoomed image"
            className="absolute inset-0"
          />
          <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center justify-center">
            <div className="w-full rounded-3xl bg-white p-3 shadow-2xl sm:rounded-4xl sm:p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--color-blue)]">
                  {productName} image {activeIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="rounded-full border border-[var(--color-border)] bg-white/86 px-3 py-2 text-sm font-semibold text-[var(--color-blue)]"
                >
                  Close
                </button>
              </div>
              <div className="overflow-hidden rounded-3xl bg-white">
                <Image
                  src={resolveAssetUrl(activeImage.imageUrl)}
                  alt={`${productName} zoomed image ${activeIndex + 1}`}
                  width={activeWidth}
                  height={activeHeight}
                  sizes="100vw"
                  className="max-h-[80vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
