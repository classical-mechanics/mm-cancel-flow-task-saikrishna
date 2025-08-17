"use client";

import { useEffect } from "react";
import Image from "next/image";
import city from "@/public/city.jpg";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags?: string[];
  snippet?: string;
  contactUrl?: string; // e.g. company careers link
  logoUrl?: string;    // optional company logo
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700">
      {children}
    </span>
  );
}

function JobCard({
  job,
  onSave,
  onApply,
}: {
  job: Job;
  onSave: (job: Job) => void;
  onApply: (job: Job) => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* Header: logo + title/company/location + tags */}
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
          {job.logoUrl ? (
            <Image src={job.logoUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-neutral-500">Logo</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-5">{job.title}</div>
          <div className="mt-0.5 text-sm text-neutral-600">
            {job.company} · {job.location}
          </div>

          {!!job.tags?.length && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.tags!.map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Salary */}
      {job.salary && (
        <div className="mt-3 text-sm text-neutral-800">
          <span className="font-medium">{job.salary}</span>
        </div>
      )}

      {/* Snippet */}
      {job.snippet && (
        <p className="mt-2 text-sm leading-6 text-neutral-700">
          {job.snippet}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => onSave(job)}
          className="h-8 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Save job
        </button>
        <button
          onClick={() => onApply(job)}
          className="h-8 rounded-md bg-violet-600 px-3 text-sm font-medium text-white hover:bg-violet-700"
        >
          Apply
        </button>
      </div>

      {/* Contact */}
      {job.contactUrl && (
        <div className="mt-3 border-t border-neutral-200 pt-2 text-[12px] text-neutral-600">
          Company site contact:{" "}
          <a
            href={job.contactUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-1 underline-offset-2"
          >
            {job.contactUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default function OfferAcceptedJobsModal({
  open,
  onClose,
  onContinue,
  jobs = [
    {
      id: "1",
      title: "Automation Controls Engineer",
      company: "Kiewit Corporation",
      location: "Morgantown, WV (Hybrid)",
      salary: "$90,000 – $110,000",
      tags: ["Full time", "Hybrid", "Bachelors", "On-site"],
      snippet:
        "Design, implement, and maintain automation and control systems for large-scale infrastructure projects. Collaborate with cross-functional teams and ensure regulatory compliance.",
      contactUrl: "https://careers.example.com",
    } as Job,
  ],
}: {
  open: boolean;
  onClose: () => void;
  onContinue: () => void; // “Land your dream role”
  jobs?: Job[];
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
      aria-labelledby="jobs-title"
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <section
        className="relative z-10 h-dvh w-full overflow-y-auto bg-white rounded-none
                   md:h-auto md:w-[min(1000px,92vw)] md:rounded-2xl md:border md:border-black/10 md:card-shadow"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 border-b bg-white px-4 py-3 text-center md:px-6 md:rounded-t-2xl">
          <p className="text-sm font-medium text-neutral-700">Subscription</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-6 pt-4 md:grid md:grid-cols-2 md:gap-8 md:px-6 md:py-6">
          {/* Left: copy + jobs */}
          <div>
            <h1 id="jobs-title" className="text-[26px] font-semibold leading-[1.15]">
              Awesome — we’ve pulled together
              <br />a few roles that seem like a great fit for you.
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Take a look and see what sparks your interest.
            </p>

            <div className="mt-4 space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={(j) => console.log("save", j)}
                  onApply={(j) => console.log("apply", j)}
                />
              ))}
            </div>

            <button
              onClick={onContinue}
              className="mt-5 w-full rounded-md bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-700"
            >
              Land your dream role
            </button>
          </div>

          {/* Right: image (desktop only) */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="relative h-[320px] w-full">
                <Image src={city} alt="City skyline" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}