import Link from "next/link";
import { redirect } from "next/navigation";
import { AudioLines, ArrowLeft, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteBatch } from "./actions";

export const dynamic = "force-dynamic";

type SavedBatch = {
  id: string;
  title: string;
  language: string;
  generation_mode: string;
  created_at: string;
};

export default async function BatchesPage() {
  let supabase;
  try { supabase = await createClient(); }
  catch { redirect("/login?error=setup"); }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("batches")
    .select("id,title,language,generation_mode,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const batches = (data || []) as SavedBatch[];

  return <main className="history-page">
    <header className="history-top"><Link className="brand" href="/"><span className="brand-icon"><AudioLines size={20}/></span><span>viral<span>batch</span><sup>AI</sup></span></Link><Link className="back-link" href="/"><ArrowLeft size={14}/> Content studio</Link></header>
    <section className="history-content">
      <div className="eyebrow"><FileText size={14}/> YOUR WORKSPACE</div>
      <h1>Your saved batches.</h1>
      <p className="history-intro">Your recent content ideas, ready whenever you are.</p>
      {error ? <div className="history-empty"><h2>We couldn't load your batches.</h2><p>Make sure the ViralBatch database migration has been applied to the connected Supabase project.</p></div> :
        batches.length ? <div className="batch-list">{batches.map(batch => <article className="batch-item" key={batch.id}><div className="batch-symbol"><Sparkles size={18}/></div><div className="batch-copy"><h2><Link href={"/batches/" + batch.id}>{batch.title}</Link></h2><p>{batch.language} · {batch.generation_mode === "ai" ? "AI generated" : "Preview mode"} · {new Date(batch.created_at).toLocaleString()}</p></div><div className="batch-controls"><span className="batch-label">SAVED</span><form action={deleteBatch}><input type="hidden" name="batchId" value={batch.id}/><button className="batch-delete" type="submit" aria-label={"Delete " + batch.title}>Delete</button></form></div></article>)}</div> :
        <div className="history-empty"><div className="history-icon"><FileText size={23}/></div><h2>Your first batch is waiting.</h2><p>Generate a batch in the content studio, then choose Save batch to keep it here.</p><Link className="history-cta" href="/">Open content studio</Link></div>}
    </section>
  </main>;
}
