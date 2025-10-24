// app/questionnaire/page.js
import { Suspense } from "react";
import QuestionnaireClient from "./questionnaire_client";

export const metadata = {
  title: "پرسشنامه",
  description: "پاسخ‌گویی به ۳۲ سؤال ارزیابی شبکه آبیاری",
};

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <QuestionnaireClient />
    </Suspense>
  );
}

function LoadingUI() {
  return (
    <main dir="rtl" className="min-h-dvh grid place-items-center bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">در حال بارگذاری پرسشنامه…</p>
      </div>
    </main>
  );
}
