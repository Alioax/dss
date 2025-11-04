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

    const COHERE_API_KEY = process.env.COHERE_API_KEY;
    const COHERE_MODEL = process.env.COHERE_MODEL || "command-r-plus";

    if (!COHERE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing COHERE_API_KEY" }), { status: 500 });
    }

    const summary = {
      overallPct: Number(overallPct.toFixed(2)),
      categories: categories.map((c) => ({
        label: c.label,
        scorePct: Number(c.scorePct.toFixed(2)),
      })),
    };

    // Cohere: use `preamble` for system behavior
    const preamble = `
شما دستیار تخصصی DSS برای ارزیابی شبکه‌های آبیاری هستید.
فقط بر اساس داده‌های خلاصه‌شده (درصد عملکرد کل و میانگین‌های ۵ دسته) تحلیل کنید.
خروجی را به فارسی و در سه بخش کوتاه ارائه دهید:
1) تفسیر سطح عملکرد کل (یک جمله).
2) نکات قوت/ضعف هر دسته (حداکثر 5 مورد — از زیاد به کم).
3) 3 توصیه عملی کوتاه و مشخص (قابل اقدام در 3 ماه آینده).
از اعداد درصد ورودی استفاده کنید و از ادعاهای خارج از داده‌ها پرهیز کنید.
    `.trim();

    const user = `
داده‌های خلاصه:
- عملکرد کل: ${summary.overallPct}%
- دسته‌ها:
${summary.categories.map((c, i) => `  ${i + 1}) ${c.label}: ${c.scorePct}%`).join("\n")}
    `.trim();

    // Cohere Chat v2
    const resp = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: COHERE_MODEL,          // e.g., "command-r-plus"
        preamble,                     // system-style instructions
        messages: [{ role: "user", content: user }],
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `Cohere error: ${t}` }), { status: 502 });
    }

    const json = await resp.json();
    // Cohere v2 response shape: message.content is an array of parts with {type, text}
    const text = (json?.message?.content || [])
      .map((p) => (typeof p?.text === "string" ? p.text : ""))
      .join("")
      .trim() || "پاسخی از مدل دریافت نشد.";

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
}
