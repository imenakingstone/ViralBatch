import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const platforms = ["TikTok", "Instagram Reels", "YouTube Shorts"] as const;
type Platform = (typeof platforms)[number];

function demoOutput(script: string, language: string, count: number) {
  const first = script.split(/[.!?\n]/).map(s => s.trim()).find(Boolean) || script;
  const seed = first.length > 100 ? first.slice(0, 97) + "..." : first;
  const kinya = language === "Kinyarwanda" || language.startsWith("Mixed");
  const hooks = kinya
    ? ["Reka nkwereke ikintu ushobora kuba utarigeze utekerezaho.", "Ibi ni byo abantu benshi bakunze kwirengagiza — reka tubiganireho.", "Niba ushaka gutera imbere, banza wumve iri somo.", "Ikintu kimwe gishobora guhindura uko ubibona.", "Dore icyo wakora kugira ngo utangire uyu munsi.", "Ntugacikwe n'iyi nama — ishobora kugufasha.", "Hari isomo rikomeye riri muri ibi.", "Reka turebe icy'ingenzi kurusha ibindi.", "Tangirira ku byo usanganywe, ubyinoze buhoro buhoro.", "Ibi wabishyira mu bikorwa uyu munsi."]
    : ["The truth about this might change how you think: " + seed, "Stop scrolling if you've ever wondered about this.", "Here's the part most people miss: " + seed, "One simple shift can make a bigger difference than you think.", "Before you try anything else, hear this.", "I wish more people knew this sooner.", "This is your reminder to make the simple things work.", "Let's break down what actually matters.", "The biggest lesson? Start with what you already have.", "Save this idea for the next time you need it."];
  const selected = Array.from({ length: count }, (_, i) => hooks[i % hooks.length]);
  const base = kinya
    ? "Igitekerezo cyiza gikwiye gusangizwa abantu benshi. Dore isomo twakuramo: " + seed + "\n\nWowe ubibona ute? Sangiza abandi igitekerezo cyawe.\n\n#Kinyarwanda #Rwanda #ViralBatch"
    : "A good idea deserves more than one moment. Here's the takeaway: " + seed + "\n\nWhat would you add? Share your thoughts below and save this for later.\n\n#CreatorTips #ContentIdeas #ViralBatch";
  const captions = Object.fromEntries(platforms.map(p => [p, base + (p === "TikTok" ? "\n#TikTok" : p === "Instagram Reels" ? "\n#Reels #Instagram" : "\n#Shorts #YouTube")])) as Record<Platform, string>;
  return {
    hooks: selected,
    captions,
    hashtags: kinya ? ["#Kinyarwanda", "#Rwanda", "#ViralBatch", "#Kwamamaza"] : ["#ContentCreator", "#CreatorTips", "#SocialMedia", "#ViralBatch"],
    mode: "demo" as const,
    note: "Preview output only. Configure OPENAI_API_KEY on the server for live AI generation. Have a fluent Kinyarwanda speaker review local-language copy before publishing."
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Please send valid JSON." }, { status: 400 }); }

  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const script = typeof input.script === "string" ? input.script.trim().slice(0, 12000) : "";
  const language = typeof input.language === "string" ? input.language : "English";
  const tone = typeof input.tone === "string" ? input.tone.slice(0, 40) : "Engaging";
  const n = Number(input.count);
  const count = Number.isFinite(n) ? Math.min(10, Math.max(3, Math.floor(n))) : 5;

  if (script.length < 20) return NextResponse.json({ error: "Please provide at least 20 characters of script or transcript." }, { status: 400 });
  if (!["English", "Kinyarwanda", "Mixed (Kinyarwanda + English)", "French"].includes(language)) return NextResponse.json({ error: "Unsupported output language." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json(demoOutput(script, language, count));

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are ViralBatch, an expert short-form content strategist. Return only valid JSON with keys hooks (array of strings), captions (object with exact keys TikTok, Instagram Reels, YouTube Shorts), and hashtags (array of strings). Do not invent facts absent from the source. Hooks must be distinct and truthful. Captions should be platform-appropriate and editable. Respect the requested language. For Kinyarwanda, use natural idiomatic language and do not invent idioms when uncertain." },
          { role: "user", content: JSON.stringify({ script, language, tone, hookCount: count }) }
        ]
      }),
      signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) {
      console.error("AI provider error:", response.status, (await response.text()).slice(0, 300));
      return NextResponse.json({ error: "The AI provider could not complete this request. Check the server key, model access, and billing settings." }, { status: 502 });
    }
    const payload = await response.json();
    const raw = payload.choices?.[0]?.message?.content;
    if (typeof raw !== "string") throw new Error("Empty AI response");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.hooks) || !parsed.captions || typeof parsed.captions !== "object") throw new Error("Unexpected AI response shape");
    const captions = Object.fromEntries(platforms.map(p => [p, String(parsed.captions[p] || "")])) as Record<Platform, string>;
    return NextResponse.json({
      hooks: parsed.hooks.slice(0, count).map((h: unknown) => String(h).slice(0, 500)),
      captions,
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, 12).map((h: unknown) => String(h).slice(0, 60)) : [],
      mode: "ai"
    });
  } catch (error) {
    console.error("Content generation failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Content generation failed. Please try again." }, { status: 502 });
  }
}
