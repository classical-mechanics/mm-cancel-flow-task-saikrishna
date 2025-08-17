"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CountBin = "0" | "1-5" | "6-20" | "20+";
export type InterviewBin = "0" | "1-2" | "3-5" | "5+";

export type OfferDeclinedSurvey = {
  appliedViaMM?: CountBin;        // “How many roles did you apply for through MM?”
  emailedCompanies?: CountBin;    // “How many companies did you email directly?”
  interviewedCompanies?: InterviewBin; // “How many different companies did you interview with?”
};

type Ctx = {
  survey: OfferDeclinedSurvey;
  setSurvey: (s: OfferDeclinedSurvey) => void;
};

const CancellationFlowContext = createContext<Ctx | null>(null);

export function CancellationFlowProvider({ children }: { children: React.ReactNode }) {
  const [survey, setSurvey] = useState<OfferDeclinedSurvey>({});

  const value = useMemo(() => ({ survey, setSurvey }), [survey]);
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