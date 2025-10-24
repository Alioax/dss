// app\results\page.js

import { Suspense } from "react";

export const metadata = {
  title: "نتایج ارزیابی",
  description: "خروجی پرسشنامه و معیارها",
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      {/* Client part */}
      <ResultsClient />
    </Suspense>
  );
}

function LoadingUI() {
  return (
    <main dir="rtl" className="min-h-dvh grid place-items-center bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">در حال بارگذاری نتایج…</p>
      </div>
    </main>
  );
}

// Inline import to keep file count small
import ResultsClient from "./results_client";
