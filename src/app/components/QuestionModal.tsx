"use client";

import { useEffect } from "react";
import Image from "next/image";
import city from "@/public/city.jpg";

export default function QuestionModal({
  open,
  onClose,
  onYes,
  onNo,         // NEW
}: {
  open: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;      // NEW
}) {
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
    <div role="dialog" aria-modal="true" aria-labelledby="q-title"
         className="fixed inset-0 z-50 flex items-start justify-center md:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <section className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                          md:h-auto md:w-[min(980px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow">
        <div className="sticky top-0 z-20 border-b bg-white px-4 py-3 text-center md:px-8 md:rounded-t-2xl">
          <p className="text-sm font-medium text-neutral-600">Subscription Cancellation</p>
          <button onClick={onClose} aria-label="Close"
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100">×</button>
        </div>

        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-8 md:py-8">
          <div className="order-2 md:order-1">
            <h2 id="q-title" className="text-2xl font-semibold tracking-tight md:text-[28px]">
              Hey mate,<br /><span className="font-semibold">Quick one before you go.</span>
            </h2>
            <p className="mt-6 text-xl font-semibold italic">Have you found a job yet?</p>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Whatever your answer, we just want to help you take the next step.
              With visa support, or by hearing how we can do better.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={onYes}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                Yes, I’ve found a job
              </button>
              <button
                onClick={onNo}  // NEW
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                Not yet – I’m still looking
              </button>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative aspect-[16/9] md:h-[320px]">
                <Image src={city} alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}