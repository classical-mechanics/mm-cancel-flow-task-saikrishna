"use client";

import { useEffect } from "react";
import Image from "next/image";
import ProfileBadge from "@/src/app/components/ProfileBadge";
import city from "@/public/city.jpg";

export default function VisaHelpPendingModal({
  open,
  onClose,
  onFinish,
}: {
  open: boolean;
  onClose: () => void;
  onFinish: () => void;
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
    <div role="dialog" aria-modal="true" aria-labelledby="pending-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      <section className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                          md:h-auto md:w-[min(980px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow">
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
          <button onClick={onClose} aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100">×</button>
        </div>

        {/* Body */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          <div>
            <h1 id="pending-title" className="text-2xl font-semibold tracking-tight md:text-[28px]">
              Your cancellation’s all sorted, mate, no more charges.
            </h1>

            <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              {/* PROFILE — uses your photo at /public/profile.jpg */}
              <ProfileBadge
                name="Mihailo Bozic"
                email="mihailo@migratemate.co"
                photoSrc="/profile.jpg"
                size={40}
              />

              <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
                <p>I’ll be reaching out soon to help with the visa side of things.</p>
                <p>
                  We’ve got your back, whether it’s questions, paperwork, or just
                  figuring out your options.
                </p>
                <p>
                  Keep an eye on your inbox, I’ll be in touch <span className="underline">shortly</span>.
                </p>
              </div>
            </div>

            <button
              onClick={onFinish}
              className="mt-6 w-full rounded-md bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-600"
            >
              Finish
            </button>
          </div>

          {/* Desktop image */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border h-full border-neutral-200">
              <div className="relative w-full h-full">
                <Image src={city} alt="City skyline" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}