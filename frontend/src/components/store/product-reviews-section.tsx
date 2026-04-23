"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { browserApi } from "@/lib/browser-api";
import type { ProductReviewSummary, ReviewEligibility } from "@/lib/types";

const filledStar = "\u2605";
const emptyStar = "\u2606";

function renderStars(rating: number) {
  return `${filledStar.repeat(rating)}${emptyStar.repeat(Math.max(0, 5 - rating))}`;
}

export function ProductReviewsSection({
  productId,
  productSlug,
  productName,
  initialSummary,
}: {
  productId: number;
  productSlug: string;
  productName: string;
  initialSummary: ProductReviewSummary | null;
}) {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<ProductReviewSummary | null>(initialSummary);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | "">("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedOrderIdRef = useRef<number | "">(selectedOrderId);

  useEffect(() => {
    selectedOrderIdRef.current = selectedOrderId;
  }, [selectedOrderId]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    browserApi
      .getReviewEligibility(token, productId)
      .then((result) => {
        if (!isActive) {
          return;
        }

        setEligibility(result);
        const nextSelectedOrderId =
          (selectedOrderIdRef.current &&
          result.eligibleOrders.some((order) => order.orderId === selectedOrderIdRef.current)
            ? selectedOrderIdRef.current
            : result.eligibleOrders[0]?.orderId) ?? "";

        setSelectedOrderId(nextSelectedOrderId);

        const nextSelectedOrder = result.eligibleOrders.find(
          (order) => order.orderId === nextSelectedOrderId,
        );

        if (nextSelectedOrder?.existingReview) {
          setRating(nextSelectedOrder.existingReview.rating);
          setFeedback(nextSelectedOrder.existingReview.comment);
        } else {
          setRating(5);
          setFeedback("");
        }
      })
      .catch((reviewError) => {
        if (!isActive) {
          return;
        }

        setEligibility(null);
        setError(
          reviewError instanceof Error
            ? reviewError.message
            : "We could not verify your delivered orders yet.",
        );
      });

    return () => {
      isActive = false;
    };
  }, [productId, token]);

  const selectedOrder = eligibility?.eligibleOrders.find((order) => order.orderId === selectedOrderId);

  const refreshSummary = async () => {
    const latestSummary = await browserApi.getProductReviews(productSlug);
    setSummary(latestSummary);
  };

  const refreshEligibility = async () => {
    if (!token) {
      return;
    }

    const latestEligibility = await browserApi.getReviewEligibility(token, productId);
    setEligibility(latestEligibility);
  };

  const handleOrderChange = (orderId: number) => {
    setSelectedOrderId(orderId);

    const nextSelectedOrder = eligibility?.eligibleOrders.find((order) => order.orderId === orderId);
    if (nextSelectedOrder?.existingReview) {
      setRating(nextSelectedOrder.existingReview.rating);
      setFeedback(nextSelectedOrder.existingReview.comment);
      return;
    }

    setRating(5);
    setFeedback("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !selectedOrderId) {
      setError("Select a delivered order before submitting your review.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await browserApi.submitProductReview(token, {
        productId,
        orderId: selectedOrderId,
        rating,
        feedback,
      });

      await Promise.all([refreshSummary(), refreshEligibility()]);
      setMessage(result.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="surface-card rounded-[2rem] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
              Customer ratings
            </p>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="display-font text-4xl font-semibold text-[var(--color-blue)]">
                  {summary && summary.reviewCount > 0
                    ? `${summary.averageRating.toFixed(1)}/5`
                    : "No ratings yet"}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">
                  {summary && summary.reviewCount > 0
                    ? `${summary.reviewCount} review${summary.reviewCount === 1 ? "" : "s"} for ${productName}`
                    : `Be the first verified buyer to review ${productName}.`}
                </p>
              </div>
              <p className="text-lg font-semibold text-[var(--color-orange)]">
                {summary && summary.reviewCount > 0 ? renderStars(Math.round(summary.averageRating)) : renderStars(0)}
              </p>
            </div>
          </div>

          {summary && summary.reviews.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {summary.reviews.map((review) => (
                <article key={review.id} className="surface-card rounded-[2rem] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[var(--color-orange)]">
                        {renderStars(review.rating)}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-[var(--color-blue)]">
                        {review.customerName}, {review.customerLocation}
                      </p>
                    </div>
                    {review.isVerifiedPurchase ? (
                      <span className="status-pill status-pill-blue">Verified buyer</span>
                    ) : null}
                  </div>
                  {review.comment.trim() ? (
                    <p className="mt-4 text-sm leading-8 text-[var(--color-ink)]">{review.comment}</p>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                      Rated {review.rating}/5 without written feedback.
                    </p>
                  )}
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                      new Date(review.updatedAtUtc),
                    )}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-card rounded-[2rem] p-6 text-sm leading-7 text-[var(--color-ink-soft)]">
              No customer reviews have been published for this product yet.
            </div>
          )}
        </div>

        <div className="surface-card rounded-[2rem] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-orange)]">
            Share your review
          </p>
          <h2 className="display-font mt-3 text-3xl font-semibold text-[var(--color-blue)]">
            Delivered orders only
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
            Reviews are limited to verified buyers after delivery. You can update your rating later for the same order if needed.
          </p>

          {authLoading || (Boolean(token) && !eligibility && !error) ? (
            <div className="mt-6 rounded-[1.6rem] bg-[var(--color-surface)] px-4 py-5 text-sm text-[var(--color-ink-soft)]">
              Checking your delivered orders...
            </div>
          ) : !isAuthenticated ? (
            <div className="mt-6 rounded-[1.6rem] bg-[var(--color-surface)] px-4 py-5 text-sm leading-7 text-[var(--color-ink-soft)]">
              Login with the account that placed the order to submit a verified review.
              <div className="mt-4">
                <Link href="/login" className="site-button site-button-primary">
                  Login to review
                </Link>
              </div>
            </div>
          ) : !eligibility?.canReview ? (
            <div className="mt-6 rounded-[1.6rem] bg-[var(--color-surface)] px-4 py-5 text-sm leading-7 text-[var(--color-ink-soft)]">
              {eligibility?.reason ?? error ?? "You can review this product after it has been delivered."}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-[var(--color-blue)]">Delivered order</span>
                <select
                  value={selectedOrderId}
                  onChange={(event) => handleOrderChange(Number(event.target.value))}
                  className="mt-2 w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                >
                  {eligibility.eligibleOrders.map((order) => (
                    <option key={order.orderId} value={order.orderId}>
                      {order.orderCode}
                      {order.existingReview ? " - update existing review" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {selectedOrder ? (
                <p className="rounded-[1.2rem] bg-[var(--color-surface)] px-4 py-3 text-sm leading-7 text-[var(--color-ink-soft)]">
                  Delivered on{" "}
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                    new Date(selectedOrder.deliveredAtUtc),
                  )}
                  {selectedOrder.existingReview ? ". Your existing review will be updated." : "."}
                </p>
              ) : null}

              <div>
                <span className="text-sm font-semibold text-[var(--color-blue)]">Star rating</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`rounded-full px-4 py-2 text-lg font-bold transition ${
                        star <= rating
                          ? "bg-[var(--color-yellow)] text-[var(--color-blue)]"
                          : "border border-[var(--color-border)] bg-white text-[var(--color-ink-soft)]"
                      }`}
                      aria-label={`Rate ${star} out of 5`}
                    >
                      {star <= rating ? filledStar : emptyStar}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-[var(--color-blue)]">
                  Feedback (optional)
                </span>
                <textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  rows={5}
                  maxLength={800}
                  placeholder="Tell other parents and gift-givers what stood out."
                  className="mt-2 w-full rounded-[1.2rem] border border-[var(--color-border)] px-4 py-3 outline-none"
                />
              </label>

              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {message ? <p className="text-sm text-[var(--color-orange)]">{message}</p> : null}

              <button
                type="submit"
                disabled={submitting || !selectedOrderId}
                className="site-button site-button-primary w-full disabled:opacity-60"
              >
                {submitting
                  ? "Saving your review..."
                  : selectedOrder?.existingReview
                    ? "Update review"
                    : "Submit review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
