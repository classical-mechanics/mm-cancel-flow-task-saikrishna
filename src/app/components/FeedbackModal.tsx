"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import city from "@/public/city.jpg";

export default function FeedbackModal({
  open,
  onClose,
  onBack,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (feedback: string) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const min = 25;
  const ok = useMemo(() => feedback.trim().length >= min, [feedback]);

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
      aria-labelledby="fb-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      {/* Panel: mobile sheet / desktop card */}
      <section
        className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                   md:h-auto md:w-[min(1000px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 safe-pt md:px-6 md:rounded-t-2xl">
          <button onClick={onBack} className="text-sm text-neutral-600 hover:text-neutral-900">← Back</button>

          <div className="flex items-center gap-4">
            <p className="hidden text-sm font-medium text-neutral-700 sm:block">
              Subscription Cancellation
            </p>
            {/* Step pills: 2 filled, 1 remaining */}
            <div className="flex items-center gap-1">
              <span className="h-2 w-6 rounded-full bg-neutral-900" />
              <span className="h-2 w-6 rounded-full bg-neutral-900" />
              <span className="h-2 w-6 rounded-full bg-neutral-200" />
            </div>
            <span className="text-xs text-neutral-500">Step 2 of 3</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          {/* Left: copy + textarea */}
          <div>
            <h1 id="fb-title" className="mb-3 text-2xl font-semibold tracking-tight md:text-[28px]">
              What’s one thing you wish we could’ve helped you with?
            </h1>
            <p className="mb-4 max-w-prose text-sm leading-6 text-neutral-600">
              We’re always looking to improve; your thoughts can help us
              make Migrate Mate more useful for others.*
            </p>

            <div className="rounded-lg border border-neutral-300">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                className="w-full resize-none rounded-lg bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Share anything specific we could have done better..."
              />
              <div className="flex justify-end px-3 pb-2 text-[11px] text-neutral-500">
                Min {min} characters ({Math.min(feedback.trim().length, min)}/{min})
              </div>
            </div>

            <button
              disabled={!ok}
              onClick={() => onNext(feedback.trim())}
              className={[
                "mt-5 w-full rounded-md px-4 py-3 text-sm font-medium",
                ok
                  ? "bg-neutral-900 text-white hover:bg-neutral-800"
                  : "cursor-not-allowed bg-neutral-100 text-neutral-400",
              ].join(" ")}
            >
              Continue
            </button>
          </div>

          {/* Right: image (desktop only) */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative h-[360px] w-full">
                <Image src={city} alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>

        <div className="safe-pb" />
      </section>
    </div>
  );
}