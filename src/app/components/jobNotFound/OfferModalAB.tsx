// components/OfferModalAB.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image, {StaticImageData} from "next/image";

type Img = StaticImageData | string;

type Variant = "A" | "B";
const COOKIE_KEY = "ab_offer_variant";

/* ------------------------- cookie helpers ------------------------- */
function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}
export function clearOfferVariantCookie() {
  deleteCookie(COOKIE_KEY);
}

/* --------------------------- utilities --------------------------- */
function rng() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] / 4294967296;
  }
  return Math.random();
}
function formatUSD(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* --------------------------- component --------------------------- */
export default function OfferModalAB({
  cityImg,
  open,
  onClose,
  onBack,
  onAccept,
  onDecline,
  basePriceCents = 2500, // 2500=$25, 2900=$29
}: {
  cityImg: Img;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onAccept: (p: { variant: Variant; basePriceCents: number; discountedPriceCents: number }) => void;
  onDecline: () => void;
  basePriceCents?: number;
}) {
  const [variant, setVariant] = useState<Variant>("A");

  // Assign / persist / override (+ ?ab=clear|reset wipes cookie first)
  useEffect(() => {
    if (!open) return;

    const url = new URL(window.location.href);
    const abParam = url.searchParams.get("ab");

    if (abParam === "clear" || abParam === "reset") {
      deleteCookie(COOKIE_KEY);
    }

    if (abParam === "A" || abParam === "B") {
      setVariant(abParam);
      setCookie(COOKIE_KEY, abParam);
      return;
    }

    const existing = getCookie(COOKIE_KEY);
    if (existing === "A" || existing === "B") {
      setVariant(existing);
      return;
    }

    const v: Variant = rng() < 0.5 ? "A" : "B";
    setVariant(v);
    setCookie(COOKIE_KEY, v);
  }, [open]);

  const discountedCents = useMemo(
    () => (variant === "A" ? Math.round(basePriceCents / 2) : Math.max(0, basePriceCents - 1000)),
    [variant, basePriceCents]
  );

  /* ---------- clear cookie on back/close (incl. backdrop) ---------- */
  const handleBack = () => {
    deleteCookie(COOKIE_KEY);
    onBack();
  };
  const handleClose = () => {
    deleteCookie(COOKIE_KEY);
    onClose();
  };
  const handleBackdrop = () => {
    deleteCookie(COOKIE_KEY);
    onClose();
  };

  const headline = "We built this to help you land the job, this makes it a little easier.";
  const subCopy = "We’ve been there and we’re here to help you.";
  const badgeTitle = variant === "A" ? "Here’s 50% off until you find a job." : "Here’s $10 off until you find a job.";
  const priceNow = formatUSD(discountedCents);
  const priceWas = formatUSD(basePriceCents);
  const cta = variant === "A" ? "Get 50% off" : "Get $10 off";

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="offer-title"
         className="fixed inset-0 z-50 flex items-start justify-center md:items-center">
      {/* backdrop click also clears cookie */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={handleBackdrop} aria-hidden="true" />

      <section className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                          md:h-auto md:w-[min(1040px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6 md:rounded-t-2xl">
          <button onClick={handleBack} className="text-sm text-neutral-600 hover:text-neutral-900">← Back</button>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm font-medium text-neutral-700 sm:block">Subscription Cancellation</p>
            <div className="flex items-center gap-1">
              <span className="h-2 w-6 rounded-full bg-neutral-900/60" />
              <span className="h-2 w-6 rounded-full bg-neutral-300" />
              <span className="h-2 w-6 rounded-full bg-neutral-300" />
            </div>
            <span className="text-xs text-neutral-500">Step 1 of 3</span>
          </div>
          {/* X button clears cookie */}
          <button onClick={handleClose} className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100">×</button>
        </div>

        {/* Mobile image */}
        <div className="md:hidden">
          <div className="relative mx-4 mt-4 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200">
            <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          <div>
            <h1 id="offer-title" className="text-[26px] font-semibold leading-tight tracking-tight">{headline}</h1>
            <p className="mt-3 text-sm text-neutral-700">{subCopy}</p>

            <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-[15px] font-semibold text-neutral-900">{badgeTitle}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-violet-700">{priceNow}</span>
                <span className="text-neutral-500 text-sm">/month</span>
                <span className="ml-2 text-sm text-neutral-400 line-through">{priceWas}</span>
              </div>
              <button
                onClick={() =>
                  onAccept({ variant, basePriceCents, discountedPriceCents: discountedCents })
                }
                className="mt-3 w-full rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                {cta}
              </button>
              <p className="mt-2 text-center text-[11px] text-neutral-500">
                You won’t be charged until your next billing date.
              </p>
            </div>

            {/* NOTE: per request, No thanks does NOT clear cookie. Change to handleClose if you want it to. */}
            <button
              onClick={onDecline}
              className="mt-4 w-full rounded-md bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
            >
              No thanks
            </button>
          </div>

          {/* Right image (desktop) */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative h-[320px] w-full">
                <Image src={cityImg} alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}