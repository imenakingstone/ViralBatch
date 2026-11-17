import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AudioLines, ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SavedBatch = {
  id: string;
  title: string;
  language: string;
  tone: string;
  generation_mode: string;
  original_script: string;
  hooks: string[];
  captions: Record<string, string>;
  hashtags: string[];
  created_at: string;
};

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  let supabase;
  try { supabase = await createClient(); }
  catch { redirect("/login?error=setup"); }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data, error } = await supabase
    .from("batches")
    .select("id,title,language,tone,generation_mode,original_script,hooks,captions,hashtags,created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) notFound();
  const batch = data as SavedBatch;

  return <main className="history-page">
    <header className="history-top">
      <Link className="brand" href="/"><span className="brand-icon"><AudioLines size={20}/></span><span>viral<span>batch</span><sup>AI</sup></span></Link>
      <Link className="back-link" href="/batches"><ArrowLeft size={14}/> All batches</Link>
    </header>
    <section className="history-content batch-detail">
      <div className="eyebrow"><FileText size={14}/> SAVED CONTENT BATCH</div>
      <h1>{batch.title}</h1>
      <p className="history-intro"><CalendarDays size={14}/> {new Date(batch.created_at).toLocaleString()} · {batch.language} · {batch.tone} · {batch.generation_mode === "ai" ? "AI generated" : "Preview mode"}</p>
      <article className="detail-section"><h2>Original script</h2><p className="detail-script">{batch.original_script}</p></article>
      <article className="detail-section"><h2>Hook ideas</h2><ol className="detail-hooks">{(batch.hooks || []).map((hook, index) => <li key={index}>{hook}</li>)}</ol></article>
      <article className="detail-section"><h2>Platform captions</h2>{Object.entries(batch.captions || {}).map(([platform, caption]) => <div className="detail-caption" key={platform}><h3>{platform}</h3><p>{caption}</p></div>)}</article>
      <article className="detail-section"><h2>Hashtags</h2><p>{(batch.hashtags || []).join(" ")}</p></article>
    </section>
  </main>;
}
