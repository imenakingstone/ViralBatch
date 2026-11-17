"use client";

import { useMemo, useState } from "react";
import { AudioLines, ArrowDownToLine, ArrowRight, BadgeCheck, Check, ChevronDown, Clapperboard, Copy, FileText, Instagram, Languages, Menu, Play, Sparkles, WandSparkles, Youtube, Zap } from "lucide-react";

type Platform = "TikTok" | "Instagram Reels" | "YouTube Shorts";
type Batch = { hooks: string[]; captions: Record<Platform, string>; hashtags: string[]; mode: "ai" | "demo" };
const platforms: Platform[] = ["TikTok", "Instagram Reels", "YouTube Shorts"];
const starter = "Most creators don't need more ideas. They need a simple system to turn one good idea into a week of content. Start with one useful story, find the strongest moment, and share it in a way that feels natural on every platform.";

export default function Home() {
  const [script, setScript] = useState(starter);
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Engaging");
  const [count, setCount] = useState("5");
  const [active, setActive] = useState<Platform>("TikTok");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const words = useMemo(() => script.trim() ? script.trim().split(/\s+/).length : 0, [script]);

  async function generate() {
    if (script.trim().length < 20) { setError("Add at least 20 characters so ViralBatch has enough context."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script, language, tone, count: Number(count) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setBatch(data as Batch);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  async function copyText(value: string, key: string) {
    try { await navigator.clipboard.writeText(value); setCopied(key); window.setTimeout(() => setCopied(""), 1500); }
    catch { setError("Clipboard access was blocked. Select the text and copy it manually."); }
  }

  function exportCsv() {
    if (!batch) return;
    const rows = [["Type", "Platform", "Content"], ...batch.hooks.map((h, i) => ["Hook " + (i + 1), "All", h]), ...platforms.map(p => ["Caption", p, batch.captions[p]])];
    const csv = rows.map(row => row.map(v => '"' + v.replaceAll('"', '""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "viralbatch-content-batch.csv"; link.click(); URL.revokeObjectURL(url);
  }

  return <main className="shell">
    <aside className={menuOpen ? "sidebar sidebar-open" : "sidebar"}>
      <a className="brand" href="#"><span className="brand-icon"><AudioLines size={21}/></span><span>viral<span>batch</span><sup>AI</sup></span></a>
      <div className="workspace"><div className="workspace-avatar">V</div><div><b>Creator workspace</b><small>Preview workspace</small></div><ChevronDown size={15}/></div>
      <p className="nav-label">WORKSPACE</p>
      <nav><a className="nav-link selected" href="#studio"><WandSparkles size={17}/> Content studio <i/></a><a className="nav-link" href="#results"><FileText size={17}/> My batches</a><a className="nav-link muted" href="#roadmap"><Clapperboard size={17}/> Video tools <span>SOON</span></a></nav>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Zap size={16}/></div><b>Your creative runway</b><p>Explore the studio in preview mode. Connect an AI key to generate live content.</p><div className="plan-line"><i/></div><small>AI provider setup is the next step.</small></div><div className="user-row"><div className="user-avatar">VK</div><div><b>My workspace</b><small>Preview account</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <section className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation"><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>Content studio</b></div><div className="top-right"><span className="status"><i/> STUDIO READY</span><div className="user-avatar">VK</div></div></header>
      <div className="content" id="studio">
        <section className="hero"><div><div className="eyebrow"><Sparkles size={14}/> YOUR CONTENT, MULTIPLIED</div><h1>Make one idea go <em>further.</em></h1><p>Turn a script into a week of content, without the busywork.</p></div><div className="hero-stamp"><div><AudioLines size={25}/></div><span>CREATE ONCE<br/><b>SHARE EVERYWHERE</b></span></div></section>
        <div className="studio-grid">
          <section className="panel editor">
            <div className="panel-title"><div className="step">01</div><div><h2>Start with your idea</h2><p>Paste a script, transcript, or rough notes.</p></div><span className="editor-tag">● EDITOR</span></div>
            <label className="field-label" htmlFor="script">YOUR SCRIPT</label>
            <textarea id="script" className="script-input" value={script} onChange={e => setScript(e.target.value)} maxLength={12000} placeholder="Paste your video script or transcript here..."/>
            <div className="textarea-meta"><span>{words} words · {script.length.toLocaleString()} / 12,000 characters</span><button onClick={() => setScript("")}>Clear text</button></div>
            <div className="settings">
              <div><label className="field-label" htmlFor="language">OUTPUT LANGUAGE</label><div className="select-box"><Languages size={16}/><select id="language" value={language} onChange={e => setLanguage(e.target.value)}><option>English</option><option>Kinyarwanda</option><option>Mixed (Kinyarwanda + English)</option><option>French</option></select><ChevronDown size={14}/></div></div>
              <div><label className="field-label" htmlFor="tone">CONTENT STYLE</label><div className="select-box"><Sparkles size={16}/><select id="tone" value={tone} onChange={e => setTone(e.target.value)}>{["Engaging","Educational","Storytelling","Bold & punchy","Professional","Funny"].map(v => <option key={v}>{v}</option>)}</select><ChevronDown size={14}/></div></div>
              <div><label className="field-label" htmlFor="count">HOOK VARIATIONS</label><div className="select-box"><Zap size={16}/><select id="count" value={count} onChange={e => setCount(e.target.value)}>{["3","5","8","10"].map(v => <option key={v}>{v}</option>)}</select><ChevronDown size={14}/></div></div>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="generate" onClick={generate} disabled={loading}><WandSparkles size={18}/>{loading ? "Creating your batch..." : "Generate content batch"}<ArrowRight size={17}/></button>
            <div className="privacy"><BadgeCheck size={14}/> Scripts are sent to an AI provider only when a server API key is configured.</div>
          </section>
          <aside className="rail">
            <div className="rail-card platforms"><div className="rail-kicker">MADE FOR EVERY FEED <span>✳</span></div><h3>One story.<br/><em>Three stages.</em></h3>
              <div className="platform-row"><span className="social tiktok">♪</span><div><b>TikTok</b><small>Fast hooks & trends</small></div><Check size={15}/></div>
              <div className="platform-row"><span className="social insta"><Instagram size={17}/></span><div><b>Instagram Reels</b><small>Discoverable storytelling</small></div><Check size={15}/></div>
              <div className="platform-row"><span className="social youtube"><Youtube size={18}/></span><div><b>YouTube Shorts</b><small>Searchable & snackable</small></div><Check size={15}/></div>
            </div>
            <div className="rail-card tip"><div className="tip-icon"><Sparkles size={17}/></div><div><b>A little creative direction</b><p>Strong hooks open a curiosity loop. Lead with the surprising part, not the introduction.</p></div></div>
            <div className="rail-card roadmap" id="roadmap"><div className="roadmap-kicker">ON THE ROADMAP <span>COMING NEXT</span></div><h3>From script to screen.</h3><p>Audio transcription, smart clip suggestions and subtitle-ready exports are next in the studio.</p><div className="roadmap-bar"><i/></div><small>Text studio · First milestone</small></div>
          </aside>
        </div>
        <section className="results" id="results"><div className="results-head"><div><div className="eyebrow">02 / YOUR CONTENT BATCH</div><h2>{batch ? "Your ideas are ready." : "Your next batch starts here."}</h2><p>{batch ? "Edit any result before you copy or export it." : "Generate your first batch to see hooks and platform-ready captions here."}</p></div>{batch && <button className="export" onClick={exportCsv}><ArrowDownToLine size={16}/> Export CSV</button>}</div>
          {!batch ? <div className="empty"><div className="empty-art"><span><Sparkles size={17}/></span><span><FileText size={18}/></span><b><WandSparkles size={25}/></b><span><Play size={16}/></span></div><h3>Good ideas deserve a bigger audience.</h3><p>Your generated hooks, captions and hashtags will appear here.</p></div> : <div className="output-grid">
            <div><div className="output-subhead"><h3>Hook ideas <span>{batch.hooks.length}</span></h3><button onClick={() => copyText(batch.hooks.map((h, i) => (i + 1) + ". " + h).join("\n"), "hooks")}>{copied === "hooks" ? <Check size={14}/> : <Copy size={14}/>} {copied === "hooks" ? "Copied" : "Copy all"}</button></div>
              {batch.hooks.map((hook, i) => <div className="hook-card" key={i}><span>{String(i + 1).padStart(2, "0")}</span><textarea aria-label={"Edit hook " + (i + 1)} value={hook} onChange={e => setBatch({...batch, hooks: batch.hooks.map((v, j) => j === i ? e.target.value : v)})}/><button onClick={() => copyText(hook, "hook" + i)} aria-label="Copy hook">{copied === "hook" + i ? <Check size={15}/> : <Copy size={15}/>}</button></div>)}
            </div>
            <div><div className="output-subhead"><h3>Platform captions</h3><span className={batch.mode === "ai" ? "mode ai" : "mode"}>{batch.mode === "ai" ? "AI GENERATED" : "PREVIEW MODE"}</span></div>
              <div className="tabs">{platforms.map(p => <button key={p} className={active === p ? "tab active-tab" : "tab"} onClick={() => setActive(p)}>{p === "TikTok" ? "♪" : p === "Instagram Reels" ? <Instagram size={15}/> : <Youtube size={16}/>}<span>{p === "Instagram Reels" ? "Reels" : p === "YouTube Shorts" ? "Shorts" : p}</span></button>)}</div>
              <div className="caption-box"><textarea aria-label={active + " caption"} value={batch.captions[active]} onChange={e => setBatch({...batch, captions: {...batch.captions, [active]: e.target.value}})}/><div><small>{batch.captions[active].length} characters</small><button onClick={() => copyText(batch.captions[active], "caption")}>{copied === "caption" ? <Check size={14}/> : <Copy size={14}/>} {copied === "caption" ? "Copied" : "Copy caption"}</button></div></div>
              <div className="hashtags"><small>HASHTAGS</small><p>{batch.hashtags.map(tag => <b key={tag}>{tag}</b>)}</p></div>
            </div>
          </div>}
        </section>
        <footer className="footer"><a className="brand" href="#"><span className="brand-icon"><AudioLines size={17}/></span><span>viral<span>batch</span><sup>AI</sup></span></a><span>Made for the people making things happen.</span><span>© 2026 ViralBatch</span></footer>
      </div>
    </section>
  </main>;
}
