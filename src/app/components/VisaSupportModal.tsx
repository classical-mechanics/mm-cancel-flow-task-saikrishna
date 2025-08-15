"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import city from "@/public/city.jpg";

export type VisaSupportResult = {
  employerProvidesLawyer: boolean;
  visaType: string;
};

export default function VisaSupportModal({
  open,
  onClose,
  onBack,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onComplete: (result: VisaSupportResult) => void;
}) {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [visa, setVisa] = useState("");

  // Hide the opposite radio once a selection is made
  const hideOpposite = answer !== null;
  const canSubmit = !!answer && visa.trim().length > 0;

  // ESC + body scroll lock
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
      aria-labelledby="visa-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      <section className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none md:h-auto md:w-[min(1000px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 safe-pt md:px-6 md:rounded-t-2xl">
          <button onClick={onBack} className="text-sm text-neutral-600 hover:text-neutral-900">← Back</button>

          <div className="flex items-center gap-4">
            <p className="hidden text-sm font-medium text-neutral-700 sm:block">Subscription Cancellation</p>
            <div className="flex items-center gap-1">
              <span className="h-2 w-6 rounded-full bg-neutral-900" />
              <span className="h-2 w-6 rounded-full bg-neutral-900" />
              <span className="h-2 w-6 rounded-full bg-neutral-900" />
            </div>
            <span className="text-xs text-neutral-500">Step 3 of 3</span>
          </div>

          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100">×</button>
        </div>

        {/* Body */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          {/* Form */}
          <div>
            <h1 id="visa-title" className="mb-4 text-2xl font-semibold tracking-tight md:text-[28px]">
              We helped you land the job, now let’s help you secure your visa.
            </h1>

            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-neutral-700">
                Is your company providing an immigration lawyer to help with your visa?*
              </p>
              {hideOpposite && (
                <button
                  type="button"
                  onClick={() => setAnswer(null)}
                  className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-700"
                >
                  Change
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {(["yes", "no"] as const).map((opt) => {
                const hidden = hideOpposite && answer !== opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 rounded-md border border-neutral-200 bg-white p-3 ${hidden ? "hidden" : ""}`}
                  >
                    <input
                      type="radio"
                      name="visa-lawyer"
                      value={opt}
                      checked={answer === opt}
                      onChange={() => setAnswer(opt)}
                      className="h-4 w-4 accent-neutral-900"
                    />
                    <span className="text-sm capitalize">{opt}</span>
                  </label>
                );
              })}
            </div>

            {/* Variant copy + input */}
            <div className="mt-4">
              {answer === "no" && (
                <p className="mb-2 text-[13px] text-neutral-700">
                  We can connect you with one of our trusted partners.
                  Which visa would you like to apply for?*
                </p>
              )}
              {answer === "yes" && (
                <p className="mb-2 text-[13px] text-neutral-700">
                  What visa will you be applying for?*
                </p>
              )}

              <input
                type="text"
                value={visa}
                onChange={(e) => setVisa(e.target.value)}
                placeholder="e.g., H-1B, O-1, TN"
                className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
                disabled={!answer}
              />
            </div>

            {/* Divider */}
            <div className="my-5 h-px w-full bg-neutral-200" />

            <button
              disabled={!canSubmit}
              onClick={() => onComplete({ employerProvidesLawyer: answer === "yes", visaType: visa.trim() })}
              className={[
                "w-full rounded-md px-4 py-3 text-sm font-medium",
                canSubmit
                  ? "bg-neutral-900 text-white hover:bg-neutral-800"
                  : "cursor-not-allowed bg-neutral-100 text-neutral-400",
              ].join(" ")}
            >
              Complete cancellation
            </button>
          </div>

          {/* Image (desktop only) */}
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