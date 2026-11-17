import Link from "next/link";

export default function AuthErrorPage() {
  return <main className="auth-page"><section className="auth-card"><div className="auth-eyebrow">ACCOUNT NOTICE</div><h1>We couldn't complete that request.</h1><p className="auth-intro">Try again. If the problem continues, check the Supabase Auth settings and redirect URL configuration.</p><Link className="back-link" href="/login">Return to sign in</Link></section></main>;
}
