"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import city from "@/public/city.jpg";

type Choice = { label: string; value: string };

function ChoiceGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: React.ReactNode;
  options: Choice[];
  value: string | null;
  onChange: (val: string) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[13px] font-medium text-neutral-700">{legend}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={[
                "h-9 rounded-md border text-sm transition",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// Add a payload type
export type Step1Answers = {
  withMM: "yes" | "no";
  rolesApplied: string;
  emailsSent: string;
  interviews: string;
};

export default function CongratsSurveyModal({
  open,
  onClose,
  onBack,
  onNext
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (answers: Step1Answers) => void;
}) {
  const [withMM, setWithMM] = useState<string | null>(null);
  const [rolesApplied, setRolesApplied] = useState<string | null>(null);
  const [emailsSent, setEmailsSent] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<string | null>(null);

  const allAnswered = useMemo(
    () => withMM && rolesApplied && emailsSent && interviews,
    [withMM, rolesApplied, emailsSent, interviews]
  );

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
    <div role="dialog" aria-modal="true" aria-labelledby="survey-title"
         className="fixed inset-0 z-50 flex items-start justify-center md:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      <section
        className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                   md:h-auto md:w-[min(1000px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow"
      >
        {/* header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 safe-pt md:px-6 md:rounded-t-2xl">
          <button onClick={onBack} className="text-sm text-neutral-600 hover:text-neutral-900">← Back</button>

          <div className="flex items-center gap-4">
            <p className="hidden text-sm font-medium text-neutral-700 sm:block">
              Subscription Cancellation
            </p>
            <div className="flex items-center gap-1">
              <span className="h-2 w-6 rounded-full bg-neutral-900" />
              <span className="h-2 w-6 rounded-full bg-neutral-200" />
              <span className="h-2 w-6 rounded-full bg-neutral-200" />
            </div>
            <span className="text-xs text-neutral-500">Step 1 of 3</span>
          </div>

          <button onClick={onClose} aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100">×</button>
        </div>

        {/* body */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          {/* form */}
          <div>
            <h1 id="survey-title" className="mb-4 text-2xl font-semibold tracking-tight md:text-[28px]">
              Congrats on the new role! 🎉
            </h1>

            <div className="space-y-6">
              <ChoiceGroup
                legend="Did you find this job with MigrateMate?*"
                value={withMM}
                onChange={setWithMM}
                options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]}
              />
              <ChoiceGroup
                legend={<>How many roles did you <u>apply</u> for through Migrate Mate?*</>}
                value={rolesApplied}
                onChange={setRolesApplied}
                options={[
                  { label: "0", value: "0" },
                  { label: "1–5", value: "1-5" },
                  { label: "6–20", value: "6-20" },
                  { label: "20+", value: "20+" },
                ]}
              />
              <ChoiceGroup
                legend={<>How many companies did you <u>email</u> directly?*</>}
                value={emailsSent}
                onChange={setEmailsSent}
                options={[
                  { label: "0", value: "0" },
                  { label: "1–5", value: "1-5" },
                  { label: "6–20", value: "6-20" },
                  { label: "20+", value: "20+" },
                ]}
              />
              <ChoiceGroup
                legend={<>How many different companies did you <u>interview</u> with?*</>}
                value={interviews}
                onChange={setInterviews}
                options={[
                  { label: "0", value: "0" },
                  { label: "1–2", value: "1-2" },
                  { label: "3–5", value: "3-5" },
                  { label: "5+", value: "5+" },
                ]}
              />
            </div>

            <div className="mt-6">
              <button
                disabled={!allAnswered}
                className={[
                  "w-full rounded-md px-4 py-3 text-sm font-medium",
                  allAnswered
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-400 cursor-not-allowed",
                ].join(" ")}
                onClick={() =>
                          onNext({
                            withMM: withMM as "yes" | "no",
                            rolesApplied: rolesApplied!,
                            emailsSent: emailsSent!,
                            interviews: interviews!,
                          })
                      }   // <— go to Step 2
              >
                Continue
              </button>
            </div>
          </div>

          {/* image (hidden on mobile) */}
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