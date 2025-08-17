"use client";

import { CancellationFlowProvider } from "@/src/app/components/cancel-flow/CancellationFlowProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CancellationFlowProvider>{children}</CancellationFlowProvider>;
}