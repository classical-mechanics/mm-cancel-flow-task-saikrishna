"use client";

import { useEffect, useMemo, useState } from "react";
import Image, {StaticImageData} from "next/image";
import { getCsrfFromDocument, sanitizeVisaLabel } from "@/src/lib/security";
import { useCancellationFlow, sanitizeCongrats, sanitizeOfferSurvey, } from "@/src/app/components/cancel-flow/CancellationFlowProvider";

type Source = "with_mm" | "no_mm";
type Img = StaticImageData | string;

export default function VisaSupportBase({
  cityImg,
  open,
  onClose,
  onBack,
  onCompleted,
  source,              // "with_mm" or "no_mm"
  heading,
  subheading,
  partnerHint,         // text shown when user selects "No"
  apiUrl = "/api/cancel/visa",
}: {
  cityImg: Img;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onCompleted?: () => void;
  source: Source;
  imageSrc?: string;
  heading: string;
  subheading: string;
  partnerHint: string;
  apiUrl?: string;
}) {
  const { congrats, survey } = useCancellationFlow();
  const [hasCompanyLawyer, setHasCompanyLawyer] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [visaRaw, setVisaRaw] = useState("");
  const [visaClean, setVisaClean] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canSubmit = useMemo(
    () => hasCompanyLawyer !== null && visaClean.length >= 2,
    [hasCompanyLawyer, visaClean]
  );

  // Sanitize as the user types
  useEffect(() => {
    setVisaClean(sanitizeVisaLabel(visaRaw));
  }, [visaRaw]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setHasCompanyLawyer(null);
      setLocked(false);
      setVisaRaw("");
      setVisaClean("");
      setErr(null);
      setBusy(false);
    }
  }, [open]);

  // Pick & lock / unlock
  function pick(value: boolean) {
    setHasCompanyLawyer(value);
    setLocked(true);
  }
  function resetPick() {
    setHasCompanyLawyer(null);
    setLocked(false);
    setErr(null);
  }

  async function handleSubmit() {
    if (!canSubmit || busy) return;
    setErr(null);
    setBusy(true);

    try {
      const csrf = getCsrfFromDocument();
      const res = await fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRF-Token": csrf } : {}),
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({
          source,
          hasCompanyLawyer,
          visaType: visaClean, // sanitized
          congratsSurvey: sanitizeCongrats(congrats),
          offerUsage: sanitizeOfferSurvey(survey),
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Request failed (${res.status})`);
      }

      // Scrub sensitive input from memory before leaving
      setVisaRaw("");
      setVisaClean("");
      setHasCompanyLawyer(null);

      // Continue flow (e.g., go to completion modal)
      if (onCompleted) onCompleted();
      else onClose();
    } catch (e: any) {
      setErr(String(e?.message || "Something went wrong"));
    } finally {
      setBusy(false);
    }
  }

  const radioOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const filteredOptions =
    locked && hasCompanyLawyer !== null
      ? radioOptions.filter((o) => o.value === hasCompanyLawyer)
      : radioOptions;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              ← Back
            </button>
            <div className="text-sm font-medium text-neutral-700">Subscription Cancellation</div>
            <div className="ml-2 flex items-center gap-1">
              <span className="h-1.5 w-6 rounded bg-green-500" />
              <span className="h-1.5 w-6 rounded bg-green-500" />
              <span className="h-1.5 w-6 rounded bg-green-500" />
              <span className="text-xs text-neutral-500">Step 3 of 3</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_420px]">
          <div>
            <h2 className="text-[22px] font-semibold leading-7 text-neutral-900">{heading}</h2>
            <p className="mt-1 text-sm text-neutral-600">{subheading}</p>

            {/* Radio */}
            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-neutral-800">
                Is your company providing an immigration lawyer to help with your visa?{" "}
                <span className="text-red-500">*</span>
              </legend>

              <div className="mt-2 space-y-2">
                {filteredOptions.map((opt) => {
                  const id = `visa_support_${opt.value ? "yes" : "no"}`;
                  const active = hasCompanyLawyer === opt.value;
                  return (
                    <div
                      key={String(opt.value)}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition
                        ${active ? "border-neutral-800 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          id={id}
                          name="visa_support"
                          type="radio"
                          className="h-4 w-4"
                          checked={active}
                          onChange={() => pick(opt.value)}
                        />
                        <label htmlFor={id} className="cursor-pointer select-none text-sm">
                          {opt.label}
                        </label>
                      </div>

                      {locked && active && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            resetPick();
                          }}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* Visa type input */}
            {hasCompanyLawyer !== null && (
              <div className="mt-4">
                <label className="text-sm font-medium text-neutral-800">
                  {hasCompanyLawyer
                    ? "What visa will you be applying for?"
                    : "Which visa would you like to apply for?"}
                  <span className="text-red-500"> *</span>
                </label>
                {!hasCompanyLawyer && (
                  <p className="mt-1 text-xs text-neutral-500">{partnerHint}</p>
                )}

                <input
                  value={visaRaw}
                  onChange={(e) => setVisaRaw(e.target.value)}
                  inputMode="text"
                  placeholder="e.g., H-1B, O-1, TN"
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-200"
                  aria-invalid={visaClean.length < 2}
                  aria-describedby="visa-hint"
                />
                <div id="visa-hint" className="mt-1 text-[11px] text-neutral-400">
                  Allowed: letters, numbers, +, -, /, parentheses; max 40 chars. We store only this
                  field and your yes/no answer.
                </div>
              </div>
            )}

            {/* Errors */}
            {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || busy}
                className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Saving…" : "Complete cancellation"}
              </button>
            </div>

            <p className="mt-2 text-[11px] text-neutral-400">
              We do not ask for passport numbers or other sensitive personal identifiers here. You can
              share those securely later if you choose to work with a lawyer.
            </p>
          </div>

          {/* Right image */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative h-[360px] w-full">
                <Image src="/city.jpg" alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}