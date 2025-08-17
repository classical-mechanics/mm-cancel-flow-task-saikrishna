"use client";

import { useEffect } from "react";
import Image, {StaticImageData} from "next/image";

type Img = StaticImageData | string;

export default function OfferAcceptedModal({
  cityImg,
  open,
  onClose,
  onContinue,
  daysLeft = 7,                 // show how many days remain on current plan
  nextBillingDate = "Sep 28",   // next date when discount kicks in
  newPrice = "12.50",           // discounted monthly price
}: {
  cityImg: Img;
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  daysLeft?: number;
  nextBillingDate?: string;
  newPrice?: string;
}) {
  // esc + lock scroll
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
      aria-labelledby="offer-accepted-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      {/* Panel: sheet on mobile; centered card on desktop */}
      <section
        className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                   md:h-auto md:w-[min(980px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 border-b bg-white px-4 py-3 text-center md:px-6 md:rounded-t-2xl">
          <p className="text-sm font-medium text-neutral-600">Subscription</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
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

        {/* Content */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          {/* Left: copy */}
          <div>
            <h1 id="offer-accepted-title" className="text-[28px] font-semibold leading-[1.1] tracking-tight">
              Great choice, mate!
            </h1>

            <p className="mt-4 text-lg font-semibold leading-7">
              You’re still on the path to your dream role.{" "}
              <span className="text-violet-600 underline decoration-2 underline-offset-2">
                Let’s make it happen together!
              </span>
            </p>

            <p className="mt-4 text-sm leading-6 text-neutral-700">
              You’ve got <span className="font-medium">{daysLeft} days</span> left on your current plan.
              <br />
              Starting from <span className="font-medium">{nextBillingDate}</span>, your monthly payment will be{" "}
              <span className="font-semibold">${newPrice}</span>.
            </p>

            <p className="mt-2 text-[11px] text-neutral-500">You can cancel anytime before then.</p>

            <button
              onClick={onContinue}
              className="mt-6 w-full rounded-md bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-600"
            >
              Land your dream role
            </button>
          </div>

          {/* Right: image (desktop only) */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative h-[280px] w-full">
                <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}