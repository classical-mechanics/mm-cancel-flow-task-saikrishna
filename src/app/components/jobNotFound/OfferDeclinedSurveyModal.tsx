// components/OfferDeclinedSurveyModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image, {StaticImageData} from "next/image";

type Choice = { label: string; value: string };
type Img = StaticImageData | string;

const roles: Choice[] = [
  { label: "0", value: "0" },
  { label: "1 – 5", value: "1-5" },
  { label: "6 – 20", value: "6-20" },
  { label: "20+", value: "20+" },
];
const emails: Choice[] = [
  { label: "0", value: "0" },
  { label: "1 – 5", value: "1-5" },
  { label: "6 – 20", value: "6-20" },
  { label: "20+", value: "20+" },
];
const interviews: Choice[] = [
  { label: "0", value: "0" },
  { label: "1 – 2", value: "1-2" },
  { label: "3 – 5", value: "3-5" },
  { label: "5+", value: "5+" },
];

function Segmented({
  value,
  onChange,
  choices,
  ariaLabel,
}: {
  value: string | null;
  onChange: (v: string) => void;
  choices: Choice[];
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="grid grid-cols-4 gap-2">
      {choices.map((c) => {
        const active = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            aria-pressed={active}
            className={[
              "h-9 rounded-md border px-3 text-sm font-medium transition-colors",
              active
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
            ].join(" ")}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

export default function OfferDeclinedSurveyModal({
  cityImg,
  open,
  onClose,
  onBack,
  onUpsell,
  onContinue,
}: {
  cityImg: Img;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onUpsell: () => void;
  onContinue: (answers: {
    rolesApplied: string;
    emailsSent: string;
    interviews: string;
  }) => void;
}) {
  const [rolesApplied, setRolesApplied] = useState<string | null>(null);
  const [emailsSent, setEmailsSent] = useState<string | null>(null);
  const [interviewsCount, setInterviewsCount] = useState<string | null>(null);

  const canContinue = useMemo(
    () => !!rolesApplied && !!emailsSent && !!interviewsCount,
    [rolesApplied, emailsSent, interviewsCount]
  );

  // ESC + body lock
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
      aria-labelledby="declined-title"
      aria-describedby="declined-note"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <section className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none md:h-auto md:w-[min(1020px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 safe-pt md:px-6 md:rounded-t-2xl">
          <button onClick={onBack} className="text-sm text-neutral-600 hover:text-neutral-900">
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm font-medium text-neutral-700 sm:block">Subscription Cancellation</p>
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
          {/* Left column */}
          <div>
            <h1 id="declined-title" className="text-[26px] font-semibold leading-tight tracking-tight">
              Help us understand how you
              <br className="hidden md:block" /> were using Migrate Mate.
            </h1>

            {/* NEW: red helper note */}
            <p id="declined-note" className="mt-2 text-[12px] leading-5 text-rose-600">
              Mind letting us know why you’re cancelling?
              <br className="hidden md:block" />
              It helps us understand your experience and improve the platform
              <span className="align-super text-[10px]">*</span>.
            </p>

            <div className="mt-5 space-y-6">
              <div>
                <p className="mb-2 text-[13px] font-medium text-neutral-700">
                  How many roles did you apply for through Migrate Mate?*
                </p>
                <Segmented
                  ariaLabel="Roles applied through Migrate Mate"
                  value={rolesApplied}
                  onChange={setRolesApplied}
                  choices={roles}
                />
              </div>

              <div>
                <p className="mb-2 text-[13px] font-medium text-neutral-700">
                  How many companies did you email directly?*
                </p>
                <Segmented
                  ariaLabel="Companies emailed directly"
                  value={emailsSent}
                  onChange={setEmailsSent}
                  choices={emails}
                />
              </div>

              <div>
                <p className="mb-2 text-[13px] font-medium text-neutral-700">
                  How many different companies did you interview with?*
                </p>
                <Segmented
                  ariaLabel="Companies interviewed with"
                  value={interviewsCount}
                  onChange={setInterviewsCount}
                  choices={interviews}
                />
              </div>
            </div>

            {/* Upsell & Continue */}
            <div className="mt-6 space-y-3">
              <button
                onClick={onUpsell}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Get 50% off | $12.50 <span className="text-xs opacity-90 line-through">$25</span>
              </button>

              <button
                disabled={!canContinue}
                onClick={() =>
                  canContinue &&
                  onContinue({
                    rolesApplied: rolesApplied!,
                    emailsSent: emailsSent!,
                    interviews: interviewsCount!,
                  })
                }
                className={[
                  "w-full rounded-md px-4 py-3 text-sm font-medium",
                  canContinue
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "cursor-not-allowed bg-neutral-100 text-neutral-400",
                ].join(" ")}
              >
                Continue
              </button>
            </div>
          </div>

          {/* Right: image (desktop only) */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative h-[360px] w-full">
                <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>

        <div className="safe-pb" />
      </section>
    </div>
  );
}