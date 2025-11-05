// app\home_client.js

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeClient() {
  const router = useRouter();

  // ✅ Predefined test values
  const [form, setForm] = useState({
    networkName: "",
    networkLocation: "",
    fillerName: "",
    email: "",
    phone: "",
    // networkName: "تجن",
    // networkLocation: "مازندران",
    // fillerName: "اصغر رضایی",
    // email: "asghar@ut.ac.ir",
    // phone: "09120001122",
  });

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form.email]
  );
  const phoneOk = useMemo(
    () => form.phone.replace(/[^\d]/g, "").length >= 7,
    [form.phone]
  );
  const allFilled =
    form.networkName && form.networkLocation && form.fillerName && emailOk && phoneOk;

  const start = (e) => {
    e.preventDefault();
    const meta = encodeURIComponent(JSON.stringify(form));
    router.push(`/questionnaire?meta=${meta}`);
  };

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-16">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            ارزیابی بهره‌برداری شبکه‌های آبیاری
          </h1>
          <p className="mt-4 text-slate-600">
            این پرسشنامه شامل ۳۲ سؤال درباره کارایی، عدالت، نگهداری، منابع مالی و رضایت آب‌بران
            در شبکه‌های آبیاری است که با پاسخ‌گویی به آن‌ها می‌توان وضعیت بهره‌برداری و مدیریت
            شبکه را ارزیابی کرد.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-medium text-slate-900">اطلاعات شبکه</h2>

          <form onSubmit={start} className="grid gap-4" dir="rtl">
            <Input
              label="نام شبکه"
              value={form.networkName}
              onChange={(v) => setForm((s) => ({ ...s, networkName: v }))}
              required
            />
            <Input
              label="مکان/محدوده شبکه"
              value={form.networkLocation}
              onChange={(v) => setForm((s) => ({ ...s, networkLocation: v }))}
              required
            />
            <Input
              label="نام تکمیل‌کننده"
              value={form.fillerName}
              onChange={(v) => setForm((s) => ({ ...s, fillerName: v }))}
              required
            />

            {/* ✅ Email + Phone in one line on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="email"
                label="ایمیل تماس"
                value={form.email}
                onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                hint={form.email && !emailOk ? "ایمیل نامعتبر است" : ""}
                required
              />
              <Input
                label="تلفن تماس"
                value={form.phone}
                onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
                hint={form.phone && !phoneOk ? "شماره معتبر وارد کنید" : ""}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!allFilled}
                className={[
                  "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition",
                  allFilled
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-300 text-slate-600 cursor-not-allowed",
                ].join(" ")}
              >
                شروع پرسشنامه
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, hint = "", type = "text", required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        dir="rtl"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
      />
      {hint ? <span className="mt-1 block text-xs text-red-600">{hint}</span> : null}
    </label>
  );
}
