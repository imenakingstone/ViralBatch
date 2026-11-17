import Link from "next/link";
import { redirect } from "next/navigation";
import { AudioLines, ArrowLeft, CheckCircle2, Circle, KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getIntegrationStatus } from "@/lib/integrations/catalog";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/login?error=setup"); }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile) redirect("/login?error=setup");

  const admin = profile.role === "admin";
  const integrations = getIntegrationStatus();
  return <main className="integration-page">
    <header className="history-top"><Link className="brand" href="/"><span className="brand-icon"><AudioLines size={20}/></span><span>viral<span>batch</span><sup>AI</sup></span></Link><Link className="back-link" href="/"><ArrowLeft size={14}/> Content studio</Link></header>
    <section className="integration-content">
      <div className="eyebrow"><ShieldCheck size={14}/> WORKSPACE CONTROL CENTER</div>
      <h1>Connected services.</h1>
      <p className="integration-intro">ViralBatch checks server-side credentials and activates capabilities when their provider is configured.</p>
      <div className="role-banner"><div><b>Your workspace role</b><small>{admin ? "You can review all provider configuration." : "You can use services enabled by your workspace administrator."}</small></div><span>{String(profile.role).toUpperCase()}</span></div>
      <div className="integration-grid">{integrations.map(item => {
        const missing = item.missing;
        const connected = item.connected;
        return <article className="integration-card" key={item.id}>
          <div className="integration-card-head"><div className="integration-symbol"><KeyRound size={19}/></div><span className={connected ? "integration-state ready" : "integration-state"}>{connected ? <CheckCircle2 size={13}/> : <Circle size={13}/>} {connected ? "CONFIGURED" : "NOT CONNECTED"}</span></div>
          <h2>{item.name}</h2><p>{item.description}</p>
          <div className="capability-list"><b>CAPABILITIES</b>{item.capabilities.map(cap => <span key={cap}>{cap}</span>)}</div>
          {admin ? <div className="integration-admin-note">{connected ? "All required environment variables are present." : "Add these server-side secrets: " + missing.join(", ")}{item.setup === "oauth" ? " OAuth authorization and callback routes are still required before publishing can work." : ""}</div> : <div className="integration-admin-note">Connection details are managed by your workspace admin.</div>}
        </article>;
      })}</div>
      <p className="integration-footnote">API keys are read only from server environment variables. They are never sent to the browser. A configured credential means the service is available for setup; OAuth-based publishing still needs account authorization and platform review.</p>
    </section>
  </main>;
}
