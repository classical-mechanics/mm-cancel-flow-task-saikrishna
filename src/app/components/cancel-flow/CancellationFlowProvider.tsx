// components/cancel-flow/CancellationFlowProvider.tsx
"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CountBin = "0" | "1-5" | "6-20" | "20+";
export type InterviewBin = "0" | "1-2" | "3-5" | "5+";

export type OfferDeclinedSurvey = {
  appliedViaMM?: CountBin;
  emailedCompanies?: CountBin;
  interviewedCompanies?: InterviewBin;
};

// Keep this flexible: only a few likely fields + withMM.
// Add more keys as your Congrats modal collects them.
export type CongratsSurvey = Partial<{
  withMM: "yes" | "no";
  jobTitle: string;
  company: string;
  city: string;
  country: string;
}>;

type Ctx = {
  survey: OfferDeclinedSurvey;
  setSurvey: (s: OfferDeclinedSurvey) => void;
  congrats: CongratsSurvey | null;
  setCongrats: (c: CongratsSurvey | null) => void;
};

/* --------- sanitizers (defensive) ---------- */
const COUNT_BINS: readonly CountBin[] = ["0", "1-5", "6-20", "20+"];
const INT_BINS: readonly InterviewBin[] = ["0", "1-2", "3-5", "5+"];

function isCount(x: any): x is CountBin {
  return COUNT_BINS.includes(x);
}
function isInterview(x: any): x is InterviewBin {
  return INT_BINS.includes(x);
}

export function sanitizeOfferSurvey(input: any): OfferDeclinedSurvey {
  if (!input || typeof input !== "object") return {};
  const out: OfferDeclinedSurvey = {};
  if (isCount(input.appliedViaMM)) out.appliedViaMM = input.appliedViaMM;
  if (isCount(input.emailedCompanies)) out.emailedCompanies = input.emailedCompanies;
  if (isInterview(input.interviewedCompanies)) out.interviewedCompanies = input.interviewedCompanies;
  return out;
}

// Basic text sanitizer: strip tags, trim, clamp length
function clean(s: unknown, max = 120) {
  return String(s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
export function sanitizeCongrats(input: any): CongratsSurvey {
  if (!input || typeof input !== "object") return {};
  const out: CongratsSurvey = {};
  if (input.withMM === "yes" || input.withMM === "no") out.withMM = input.withMM;
  if (input.jobTitle) out.jobTitle = clean(input.jobTitle);
  if (input.company) out.company = clean(input.company);
  if (input.city) out.city = clean(input.city);
  if (input.country) out.country = clean(input.country);
  return out;
}

const CancellationFlowContext = createContext<Ctx | null>(null);

export function CancellationFlowProvider({ children }: { children: React.ReactNode }) {
  const [survey, setSurvey] = useState<OfferDeclinedSurvey>({});
  const [congrats, setCongrats] = useState<CongratsSurvey | null>(null);

  const value = useMemo(() => ({ survey, setSurvey, congrats, setCongrats }), [survey, congrats]);
  return (
    <CancellationFlowContext.Provider value={value}>
      {children}
    </CancellationFlowContext.Provider>
  );
}

export function useCancellationFlow() {
  const ctx = useContext(CancellationFlowContext);
  if (!ctx) throw new Error("useCancellationFlow must be used inside CancellationFlowProvider");
  return ctx;
}