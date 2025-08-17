"use client";

import { useMemo, useState, useEffect } from "react";
import Image, {StaticImageData} from "next/image";
import SubscriptionCancellationCompleteModal from "./SubscriptionCancellationCompleteModal";

type ReasonKey =
  | "too_expensive"
  | "platform_not_helpful"
  | "not_enough_jobs"
  | "decided_not_to_move"
  | "other";

type Img = StaticImageData | string;

const REASONS: { key: ReasonKey; label: string }[] = [
  { key: "too_expensive", label: "Too expensive" },
  { key: "platform_not_helpful", label: "Platform not helpful" },
  { key: "not_enough_jobs", label: "Not enough relevant jobs" },
  { key: "decided_not_to_move", label: "Decided not to move" },
  { key: "other", label: "Other" },
];

const MIN_TEXT = 25;
const MAX_TEXT = 500;
const SUBMIT_TIMEOUT_MS = 12000;
const CSRF_COOKIE = "csrfToken";

/* ---------- helpers ---------- */
function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : "";
}
function getCsrfToken(): string | null {
  const c = getCookie(CSRF_COOKIE);
  if (c) return c;
  const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
  return meta?.content || null;
}
function sanitizeText(s: unknown, max = MAX_TEXT) {
  return String(s ?? "")
    .replace(/<[^>]*>/g, "") // strip tags
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
function parsePriceToCents(s: string, max: number) {
  const cleaned = s.replace(/[^0-9.]/g, "");
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return NaN;
  const cents = Math.round(n * 100);
  return Math.min(Math.max(cents, 100), max); // clamp between $1 and max
}
function usd(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default function CancelReasonModal({
  cityImg,
  open,
  onClose,
  onBack,
  apiUrl = "/api/cancel/reason", // POST endpoint (see below)
  basePriceCents = 2500,        // $25
}: {
  cityImg: Img
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  apiUrl?: string;
  basePriceCents?: number;
  imageSrc?: string;
}) {
  const [selected, setSelected] = useState<ReasonKey | null>(null);
  const [locked, setLocked] = useState(false); // hide other options after choose
  const [priceInput, setPriceInput] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setLocked(false);
      setPriceInput("");
      setDetails("");
      setError(null);
      setSubmitting(false);
      setShowComplete(false);
    }
  }, [open]);

  const isTextReason =
    selected &&
    ["platform_not_helpful", "not_enough_jobs", "decided_not_to_move", "other"].includes(
      selected
    );

  const textSanitized = useMemo(() => sanitizeText(details), [details]);
  const textValid = isTextReason ? textSanitized.length >= MIN_TEXT : true;

  const priceCents = useMemo(() => {
    if (selected !== "too_expensive") return NaN;
    return parsePriceToCents(priceInput, basePriceCents);
  }, [priceInput, selected, basePriceCents]);

  // According to the design, “Complete cancellation” is disabled for Too expensive.
  const canComplete =
    selected === "too_expensive"
    ? Number.isFinite(priceCents) && priceCents > 0 && priceCents <= basePriceCents
    : !!selected && textValid;

  const completeBtnClass =
  selected === "platform_not_helpful" && canComplete
    ? "bg-red-600 text-white hover:bg-red-700"
    : canComplete
    ? "bg-neutral-900 text-white hover:bg-neutral-800"
    : "bg-neutral-200 text-neutral-600";

  async function handleComplete() {
    if (!selected || !canComplete || submitting) return;

    setError(null);
    setSubmitting(true);

    // Build safe payload
    const payload: {
      reason: ReasonKey;
      details?: string;
      maxPriceCents?: number;
    } = { reason: selected };

    if (selected === "too_expensive") {
      // design keeps disabled, but guard anyway
      if (!Number.isFinite(priceCents) || priceCents <= 0) {
        setError("Please enter a valid amount.");
        setSubmitting(false);
        return;
      }
      payload.maxPriceCents = priceCents;
    } else {
      if (textSanitized.length < MIN_TEXT) {
        setError(`Please enter at least ${MIN_TEXT} characters.`);
        setSubmitting(false);
        return;
      }
      payload.details = textSanitized;
    }

    // CSRF
    const csrf = getCsrfToken();
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), SUBMIT_TIMEOUT_MS);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        },
        body: JSON.stringify(payload),
        signal: ac.signal,
      }).catch((e) => {
        if (e?.name === "AbortError") throw new Error("Request timed out.");
        throw e;
      });

      clearTimeout(to);

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error((msg || `Request failed (${res.status})`).slice(0, 200));
      }

      // success → show completion modal
      setShowComplete(true);
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function pick(r: ReasonKey) {
    setSelected(r);
    setLocked(true); // hide others
  }
  function resetPick() {
    setSelected(null);
    setLocked(false);
    setPriceInput("");
    setDetails("");
    setError(null);
  }

  if (showComplete) {
    return (
      <SubscriptionCancellationCompleteModal
        cityImg={cityImg}
        open={open}
        onClose={onClose}
        onBackToJobs={onClose}
        // backToJobsHref="/jobs" // alternative
        endDate="Sep 28"
      />
    );
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-reason-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      <section className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                          md:h-auto md:w-[min(1080px,92vw)] md:rounded-2xl md:border md:border-black/10">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
          <button onClick={onBack} className="text-sm text-neutral-600 hover:text-neutral-900">← Back</button>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm font-medium text-neutral-700 sm:block">Subscription Cancellation</p>
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="h-2 w-6 rounded-full bg-neutral-900/60" />
              <span className="h-2 w-6 rounded-full bg-neutral-900/60" />
              <span className="h-2 w-6 rounded-full bg-neutral-900/60" />
            </div>
            <span className="text-xs text-neutral-500">Step 3 of 3</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        {/* Mobile image */}
        <div className="md:hidden">
          <div className="relative mx-4 mt-4 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200">
            <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-6 px-4 pb-6 pt-4 md:grid-cols-2 md:gap-10 md:px-6 md:py-6">
          <div>
            <h1 id="cancel-reason-title" className="text-[26px] font-semibold leading-tight tracking-tight">
              What’s the main reason for cancelling?
            </h1>
            <p className="mt-2 text-sm text-neutral-600">Please take a minute to let us know why:</p>

            {/* Reason radios (hide others when selected) */}
            <fieldset className="mt-3 space-y-2">
              <legend className="sr-only">Select a reason</legend>
              {(locked && selected ? REASONS.filter(r => r.key === selected) : REASONS).map((r) => {
                const active = selected === r.key;
                const id = `reason-${r.key}`;

                return (
                  <div
                    key={r.key}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition
                      ${active ? "border-neutral-800 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id={id}
                        name="reason"
                        className="h-4 w-4"
                        checked={active}
                        onChange={() => pick(r.key)}
                      />
                      {/* label only references the input; it no longer wraps the row */}
                      <label htmlFor={id} className="cursor-pointer select-none text-sm text-neutral-900">
                        {r.label}
                      </label>
                    </div>

                    {locked && active && (
                      <button
                        type="button"
                        onClick={(e) => {
                          // prevent the click from toggling the radio via the label/container
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
            </fieldset>


            {/* Dynamic inputs */}
            {selected === "too_expensive" && (
              <div className="mt-4">
                <label htmlFor="maxPrice" className="block text-sm font-medium text-neutral-800">
                  What would be the maximum you would be willing to pay?
                </label>
                <div className="mt-2 flex items-center overflow-hidden rounded-md border border-neutral-300">
                  <span className="px-3 text-neutral-500">$</span>
                  <input
                    id="maxPrice"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="e.g., 12.50"
                    className="w-full border-0 bg-transparent px-2 py-2 text-sm outline-none"
                    aria-invalid={selected === "too_expensive" && !(Number.isFinite(priceCents) && priceCents > 0)}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Must be ≤ your current price of {usd(basePriceCents)}.
                </p>
              </div>
            )}

            {isTextReason && (
              <div className="mt-4">
                <label htmlFor="details" className="block text-sm font-medium text-neutral-800">
                  {selected === "platform_not_helpful"
                    ? "What can we change to make the platform more helpful?"
                    : selected === "not_enough_jobs"
                    ? "In which way can we make the jobs more relevant?"
                    : selected === "decided_not_to_move"
                    ? "What changed for you to decide to not move?"
                    : "What would have helped you the most?"}
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={5}
                  maxLength={MAX_TEXT}
                  className={`mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2
                    ${details && !textValid ? "border-red-400 focus:ring-red-200" : "border-neutral-300 focus:ring-violet-300"}`}
                  placeholder={`Please share a bit more (min ${MIN_TEXT} characters)…`}
                />
                <div
                  className={`mt-1 text-xs ${
                    details && !textValid ? "text-red-600" : "text-neutral-500"
                  }`}
                >
                  Min {MIN_TEXT} characters ({Math.min(textSanitized.length, MAX_TEXT)}/{MAX_TEXT})
                </div>
              </div>
            )}

            {/* Inline error */}
            {error && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="mt-5 space-y-3">
              {/* Offer CTA stays active always per design */}
              <button
                type="button"
                className="w-full rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
                onClick={() => {
                  // optional: show Offer modal instead of completing
                }}
              >
                Get 50% off | {usd(Math.round(basePriceCents / 2))}
                <span className="ml-1 align-top text-[10px] text-white/80 line-through">
                  {usd(basePriceCents)}
                </span>
              </button>

              <button
                type="button"
                onClick={handleComplete}
                disabled={!canComplete || submitting}
                className={`w-full rounded-md px-4 py-3 text-sm font-semibold ${completeBtnClass}
                            disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {submitting ? "Submitting…" : "Complete cancellation"}
              </button>
            </div>
          </div>

          {/* Right image (desktop) */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200" aria-hidden="true">
              <div className="relative h-[360px] w-full">
                <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}