"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { ProductImage } from "@/lib/types";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="surface-card card-shadow flex min-h-[520px] items-center justify-center rounded-[2.4rem] p-6 text-center">
        <p className="max-w-sm text-sm leading-7 text-[var(--color-ink-soft)]">
          Product imagery will appear here once the catalog is updated.
        </p>
      </div>
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
      <div className="surface-card card-shadow rounded-[2.4rem] p-5">
        <div className="relative overflow-hidden rounded-[1.8rem] bg-white">
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
              className="h-[520px] w-full object-contain"
            />
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => moveSelection(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-[var(--color-blue)] shadow-sm"
                aria-label="Show previous image"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => moveSelection(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-[var(--color-blue)] shadow-sm"
                aria-label="Show next image"
              >
                Next
              </button>
              <div className="absolute bottom-4 right-4 rounded-full bg-[var(--color-blue)]/90 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
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
                      ? "border-[var(--color-orange)] shadow-sm"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <Image
                    src={resolveAssetUrl(image.imageUrl)}
                    alt={`${productName} thumbnail ${index + 1}`}
                    width={thumbWidth}
                    height={thumbHeight}
                    sizes="120px"
                    className="h-20 w-full rounded-[0.9rem] object-cover"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {isZoomOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close zoomed image"
            className="absolute inset-0"
          />
          <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center justify-center">
            <div className="w-full rounded-[2rem] bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--color-blue)]">
                  {productName} image {activeIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="rounded-full border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-blue)]"
                >
                  Close
                </button>
              </div>
              <div className="overflow-hidden rounded-[1.5rem] bg-white">
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
