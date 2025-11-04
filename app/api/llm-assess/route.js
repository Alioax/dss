// app/api/llm-assess/route.js
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { overallPct, categories } = await req.json();

    if (
      typeof overallPct !== "number" ||
      !Array.isArray(categories) ||
      categories.length !== 5
    ) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/anthropic/claude-3.7-sonnet";

    if (!OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 });
    }

    const summary = {
      overallPct: Number(overallPct.toFixed(2)),
      categories: categories.map((c) => ({
        label: c.label,
        scorePct: Number(c.scorePct.toFixed(2)),
      })),
    };

    const system = `
شما دستیار تخصصی DSS برای ارزیابی شبکه‌های آبیاری هستید. 
فقط بر اساس داده‌های خلاصه‌شده (درصد عملکرد کل و میانگین‌های ۵ دسته) تحلیل کنید.
خروجی را به فارسی و در سه بخش کوتاه ارائه دهید:
1) تفسیر سطح عملکرد کل (یک جمله).
2) نکات قوت/ضعف هر دسته (حداکثر 5 گلوله‌وار — از زیاد به کم).
3) 3 توصیه عملی‌ی کوتاه و مشخص (قابل اقدام در 3 ماه آینده).
از اعداد درصد ورودی استفاده کنید و از ادعاهای خارج از داده‌ها پرهیز کنید.
    `.trim();

    const user = `
داده‌های خلاصه:
- عملکرد کل: ${summary.overallPct}%
- دسته‌ها:
${summary.categories.map((c, i) => `  ${i + 1}) ${c.label}: ${c.scorePct}%`).join("\n")}
    `.trim();

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // (اختیاری) توصیه‌شده توسط OpenRouter
        "HTTP-Referer": "https://your-domain.example", 
        "X-Title": "Irrigation DSS",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `OpenRouter error: ${t}` }), { status: 502 });
    }

    const json = await resp.json();
    const text =
      json?.choices?.[0]?.message?.content?.trim() ||
      "پاسخی از مدل دریافت نشد.";

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}
