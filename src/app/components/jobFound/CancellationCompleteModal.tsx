"use client";

import { useEffect } from "react";
import Image, {StaticImageData} from "next/image";

type Img = StaticImageData | string;

export default function CancellationCompleteModal({
  cityImg,
  open,
  onClose,
  onFinish,
}: {
  cityImg: Img
  open: boolean;
  onClose: () => void;
  onFinish: () => void;
}) {
  // esc + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="done-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <section
        className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                   md:h-auto md:w-[min(980px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6 md:rounded-t-2xl">
          <p className="text-sm font-medium text-neutral-700">Subscription Cancelled</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="h-2 w-6 rounded-full bg-emerald-500" />
              <span className="h-2 w-6 rounded-full bg-emerald-500" />
              <span className="h-2 w-6 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs text-neutral-500">Completed</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        {/* Mobile banner image */}
        <div className="md:hidden">
          <div className="relative mx-4 mt-4 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200">
            <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          <div>
            <h1 id="done-title" className="text-2xl font-semibold tracking-tight md:text-[28px]">
              All done, your cancellation’s been processed.
            </h1>

            <p className="mt-4 max-w-prose text-sm leading-6 text-neutral-700">
              We’re stoked to hear you’ve landed a job and sorted your visa.
              Big congrats from the team. 🙌
            </p>

            <button
              onClick={onFinish}
              className="mt-6 w-full rounded-md bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-600"
            >
              Finish
            </button>
          </div>

          {/* Desktop image */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative h-[240px] w-full">
                <Image src={cityImg} alt="City skyline" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}