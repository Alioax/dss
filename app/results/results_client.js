"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResultsClient() {
  const params = useSearchParams();
  const router = useRouter();

  const parsed = useMemo(() => {
    try {
      const raw = params.get("answers");
      if (!raw) return null;
      const arr = JSON.parse(decodeURIComponent(raw));
      if (!Array.isArray(arr)) return null;
      const vals = arr.map(Number).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
      return vals.length ? vals : null;
    } catch {
      return null;
    }
  }, [params]);

  const metrics = useMemo(() => {
    if (!parsed) return null;
    const n = parsed.length;
    const sum = parsed.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const pct = ((mean - 1) / 4) * 100;
    const counts = [1, 2, 3, 4, 5].map((k) => parsed.filter((v) => v === k).length);
    return { n, sum, mean, pct, counts };
  }, [parsed]);

  if (!parsed) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">نتیجه‌ای یافت نشد</h1>
          <p className="text-sm text-slate-600">
            پارامتر <code className="font-mono">answers</code> نامعتبر است یا وجود ندارد.
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

  return (
    <main dir="rtl" className="min-h-dvh bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">نتایج ارزیابی</h1>
          <p className="text-sm text-slate-600">بر اساس پاسخ‌های شما به {metrics.n} سؤال</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card label="میانگین (۱ تا ۵)" value={metrics.mean.toFixed(2)} />
          <Card label="امتیاز نرمال‌شده (۰ تا ۱۰۰)" value={`${metrics.pct.toFixed(0)}%`} />
          <Card label="جمع کل مقادیر" value={metrics.sum} />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-medium text-slate-900 mb-4">توزیع پاسخ‌ها (۱ تا ۵)</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((k, i) => {
              const count = metrics.counts[i];
              const widthPct = metrics.n ? (count / metrics.n) * 100 : 0;
              return (
                <div key={k} className="flex items-center gap-3">
                  <div className="w-10 shrink-0 text-sm text-slate-600">گزینه {k}</div>
                  <div className="relative h-3 w-full rounded-full bg-slate-100">
                    <div
                      className="absolute inset-y-0 right-0 rounded-full bg-slate-900 transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="w-10 shrink-0 text-sm tabular-nums text-slate-700 text-center">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify({ answers: parsed, ...metrics }, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "results.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-xl border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            دانلود JSON
          </button>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
