// app/questionnaire/page.js

"use client";

import { useMemo, useRef, useState } from "react"; // ⬅️ added useRef
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import QUESTIONS from "../data/questions";

export default function QuestionnairePage() {
  const router = useRouter();
  const params = useSearchParams();
  const metaRaw = params.get("meta") || "";
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const qRefs = useRef([]); // ⬅️ refs for question containers

  const completed = useMemo(
    () => answers.filter((a) => a !== null).length,
    [answers]
  );
  const progress = Math.round((completed / QUESTIONS.length) * 100);

  const setAnswer = (qIndex, value) =>
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = value;
      return next;
    });

  const clearAnswer = (qIndex) =>
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = null;
      return next;
    });

  function handleSubmit(e) {
    e.preventDefault();
    const payload = encodeURIComponent(JSON.stringify(answers));
    // router.push(`/results?answers=${payload}`);
    const meta = metaRaw ? `&meta=${metaRaw}` : "";
    router.push(`/results?answers=${payload}${meta}`);
  }

  function handleReset() {
    setAnswers(Array(QUESTIONS.length).fill(null));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRandomFill() {
    setAnswers(
      QUESTIONS.map((q) => {
        const pick = q.options[Math.floor(Math.random() * q.options.length)];
        return pick.value;
      })
    );
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-slate-50">
      {/* Sticky header with progress + Submit */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">پرسشنامه</h1>
            <p className="text-xs text-slate-500">
              {completed}/{QUESTIONS.length} پاسخ داده شده • {progress}%
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-36">
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>

            <button
              form="questionnaire-form"
              type="submit"
              disabled={completed !== QUESTIONS.length}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
                completed === QUESTIONS.length
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-300 text-slate-600 cursor-not-allowed",
              ].join(" ")}
              aria-disabled={completed !== QUESTIONS.length}
              title={
                completed === QUESTIONS.length
                  ? "ثبت"
                  : "لطفا ابتدا به همه سوالات پاسخ دهید"
              }
            >
              ثبت
            </button>
          </div>
        </div>
      </div>

      <form
        id="questionnaire-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl px-6 py-8"
      >
        <div className="mb-6 flex flex-row-reverse items-center gap-3">
          <Link
            // href="/"
            href={metaRaw ? `/?meta=${metaRaw}` : "/"}
            className="text-sm text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
          >
            بازگشت ←
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomFill}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              title="Randomly select one option for each question"
            >
              پر کردن تصادفی
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              پاک کردن همه
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => {
            const titleId = `q${q.id}-title`;
            const hasSelection = answers[idx] !== null;
            const qNumber = idx + 1;

            return (
              <div
                key={q.id}
                ref={(el) => (qRefs.current[idx] = el)} // ⬅️ store ref
                role="group"
                aria-labelledby={titleId}
                className="rounded-2xl border border-slate-200 bg-white scroll-mt-24" // ⬅️ offset for sticky header
              >
                {/* Question number + text */}
                <p
                  id={titleId}
                  className="px-4 pt-4 text-base font-medium text-slate-900"
                >
                  {qNumber}. {q.text}
                </p>

                <div className="p-4 sm:p-5 pt-3">
                  {/* Full-width options (one per row) */}
                  <div className="flex flex-col gap-3">
                    {q.options.map((opt, optIdx) => {
                      const id = `q${q.id}-v${opt.value}`;
                      const checked = answers[idx] === opt.value;
                      const muted = hasSelection && !checked;
                      const optNumber = optIdx + 1;

                      return (
                        <label
                          key={id}
                          htmlFor={id}
                          className={[
                            "block w-full cursor-pointer rounded-xl border p-3 text-sm whitespace-normal break-words transition",
                            checked
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-300 bg-white hover:border-slate-400",
                            muted ? "opacity-50" : "",
                          ].join(" ")}
                        >
                          <input
                            id={id}
                            type="radio"
                            name={`q-${q.id}`}
                            className="sr-only"
                            value={opt.value}
                            checked={checked}
                            onChange={() => {
                              const prev = answers[idx];
                              setAnswer(idx, opt.value);
                              // Scroll only on selection (not deselection) and not on last question
                              if (prev !== opt.value && idx < QUESTIONS.length - 1) {
                                setTimeout(() => {
                                  qRefs.current[idx + 1]?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }, 300); // ⬅️ 300ms delay
                              }
                            }}
                            onClick={(e) => {
                              // Allow deselection of the same option without scrolling
                              if (answers[idx] === opt.value) {
                                e.preventDefault();
                                clearAnswer(idx);
                              }
                            }}
                            required={answers[idx] === null}
                            aria-labelledby={titleId}
                          />
                          {/* Option number + text */}
                          <span className="font-medium">{optNumber}.</span>{" "}
                          <span className="align-middle">{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </main>
  );
}
