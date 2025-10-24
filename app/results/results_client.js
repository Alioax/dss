"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import QUESTIONS from "../data/questions";

const CATEGORY_LABELS = {
  1: "وضعیت هیدرولیکی- سازه‌ای",
  2: "وضعیت عملکرد بهره‌برداری",
  3: "وضعیت اقتصادی",
  4: "وضعیت اجتماعی",
  5: "وضعیت محیط‌زیستی",
};

// NOTE: earlier we reversed question values so that 5 = best.
// Map answers to descriptive labels accordingly.
const ANSWER_LABEL = {
  5: "بسیار خوب",
  4: "خوب",
  3: "متوسط",
  2: "ضعیف",
  1: "بسیار ضعیف",
};

export default function ResultsClient() {
  const params = useSearchParams();
  const router = useRouter();

  const meta = useMemo(() => {
    try {
      const raw = params.get("meta");
      if (!raw) return null;
      const obj = JSON.parse(decodeURIComponent(raw));
      return obj && typeof obj === "object" ? obj : null;
    } catch {
      return null;
    }
  }, [params]);

  const answers = useMemo(() => {
    try {
      const raw = params.get("answers");
      if (!raw) return null;
      const arr = JSON.parse(decodeURIComponent(raw));
      if (!Array.isArray(arr)) return null;
      const vals = arr.map(Number).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
      return vals.length === QUESTIONS.length ? vals : null;
    } catch {
      return null;
    }
  }, [params]);

  const calc = useMemo(() => {
    if (!answers) return null;

    // Per-question records (higher=better)
    const perQuestions = QUESTIONS.map((q, i) => {
      const ans = answers[i];
      const norm = (ans - 1) / 4; // 0..1
      const scorePct = norm * 100; // 0..100
      return {
        id: q.id,
        title: q.title,
        category: q.category,
        weight: Number(q.weight ?? 0),
        answer: ans,
        scorePct,
      };
    });

    // Category aggregates (weighted)
    const catAgg = perQuestions.reduce((acc, r) => {
      const k = r.category;
      if (!acc[k]) acc[k] = { category: k, weightSum: 0, weightedSum: 0, count: 0 };
      acc[k].weightSum += r.weight;
      acc[k].weightedSum += r.weight * r.scorePct;
      acc[k].count += 1;
      return acc;
    }, {});

    const categories = Object.values(catAgg)
      .map((c) => ({
        category: c.category,
        label: CATEGORY_LABELS[c.category],
        scorePct:
          c.weightSum > 0
            ? c.weightedSum / c.weightSum
            : perQuestions
              .filter((r) => r.category === c.category)
              .reduce((s, r, _, arr) => s + r.scorePct / arr.length, 0),
        weightSum: c.weightSum,
        count: c.count,
      }))
      // sort best → worst
      .sort((a, b) => b.scorePct - a.scorePct);

    // Overall weighted score
    const totalWeight = perQuestions.reduce((s, r) => s + r.weight, 0);
    const overallPct =
      totalWeight > 0
        ? perQuestions.reduce((s, r) => s + r.weight * r.scorePct, 0) / totalWeight
        : perQuestions.reduce((s, r) => s + r.scorePct, 0) / perQuestions.length;

    const meanRaw = answers.reduce((a, b) => a + b, 0) / answers.length;

    return { n: answers.length, meanRaw, overallPct, perQuestions, categories };
  }, [answers]);

  if (!answers || !calc) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">نتیجه‌ای یافت نشد</h1>
          <p className="text-sm text-slate-600">
            پارامتر <code className="font-mono">answers</code> نامعتبر است یا با تعداد سؤالات هم‌خوان نیست.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/questionnaire" className="rounded-lg bg-slate-900 px-4 py-2 text-white text-sm">
              بازگشت به پرسشنامه
            </Link>
            <Link href="/" className="rounded-lg border px-4 py-2 text-sm text-slate-700">
              صفحه اصلی
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Donut constants
  const r = 80;
  const C = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, calc.overallPct));
  const offset = C * (1 - pct / 100);
  return (
    <main dir="rtl" className="min-h-dvh bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">نتایج ارزیابی</h1>
          <p className="text-sm text-slate-600">بر اساس پاسخ‌های شما به {calc.n} سؤال</p>
          {meta && (
            <div className="mt-3 text-sm text-slate-700 space-y-1">
              <div><span className="text-slate-500">شبکه:</span> {meta.networkName}</div>
              <div><span className="text-slate-500">مکان:</span> {meta.networkLocation}</div>
              <div><span className="text-slate-500">تکمیل‌کننده:</span> {meta.fillerName}</div>
              <div><span className="text-slate-500">تماس:</span> {meta.email} • {meta.phone}</div>
            </div>
          )}
        </header>

        {/* عملکرد + میانگین‌های وزنی (کنار هم در دسکتاپ) */}
        <section className="my-10 flex flex-col lg:flex-row gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Donut */}
          <div className="flex flex-col items-center justify-center lg:w-1/3 text-center">
            <h2 className="text-base font-medium text-slate-900 mb-4">عملکرد</h2>
            <div className="relative h-[220px] w-[220px]">
              <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
                <circle cx="110" cy="110" r={r} stroke="#e2e8f0" strokeWidth="20" fill="none" />
                <circle
                  cx="110" cy="110" r={r}
                  stroke="#0f172a" strokeWidth="20" fill="none"
                  strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-5xl font-bold text-slate-900">{pct.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Category weighted averages */}
          <div className="flex-1">
            <h2 className="text-base font-medium text-slate-900 mb-4">میانگین وزنی دسته‌ها</h2>
            <div className="space-y-3">
              {calc.categories.map((c) => (
                <div key={c.category} className="flex items-center gap-3">
                  <div className="w-56 shrink-0 text-sm text-slate-800">{c.label}</div>
                  <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="absolute inset-y-0 right-0 rounded-full bg-slate-900 transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, c.scorePct)).toFixed(2)}%` }}
                    />
                  </div>
                  <div className="w-12 shrink-0 text-sm tabular-nums text-slate-700 text-center">
                    {c.scorePct.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
          <h2 className="text-base font-medium text-slate-900 mb-4">جزئیات سؤالات</h2>
          <table className="min-w-full text-sm">
            <thead className="text-slate-500">
              <tr className="border-b">
                <th className="py-2 text-right pr-2">#</th>
                <th className="py-2 text-right">عنوان</th>
                <th className="py-2 text-right">دسته</th>
                <th className="py-2 text-right">وزن</th>
                <th className="py-2 text-right">پاسخ</th>
                <th className="py-2 text-right">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {calc.perQuestions.map((q) => (
                <tr key={q.id} className="border-b last:border-0">
                  <td className="py-2 pr-2 text-slate-700">{q.id}</td>
                  <td className="py-2 text-slate-900">{q.title}</td>
                  <td className="py-2 text-slate-700">{CATEGORY_LABELS[q.category]}</td>
                  <td className="py-2 text-slate-700">{q.weight.toFixed(3)}</td>
                  <td className="py-2 text-slate-700">{q.answer}</td>
                  <td className="py-2 text-slate-900 font-medium">{ANSWER_LABEL[q.answer]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            بازگشت
          </button>
          <Link
            href="/questionnaire"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            ویرایش پاسخ‌ها
          </Link>
          <Link
            href="/"
            className="rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            صفحه اصلی
          </Link>
        </div>
      </div>
    </main>
  );

}
