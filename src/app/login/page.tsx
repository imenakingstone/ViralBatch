import Link from "next/link";
import { AudioLines, ShieldCheck } from "lucide-react";
import { signIn, signUp } from "./actions";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

const messages: Record<string, string> = {
  invalid: "Enter a valid email and a password with at least 8 characters.",
  credentials: "Those sign-in details were not accepted. Check them and try again.",
  signup: "We could not create your account. The email may already be registered.",
  setup: "Account services are not configured yet. Add your Supabase project URL and publishable key.",
  confirmation: "The confirmation link is invalid or expired. Request a new sign-up email and try again.",
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return <main className="auth-page">
    <section className="auth-card">
      <Link className="brand auth-brand" href="/"><span className="brand-icon"><AudioLines size={21}/></span><span>viral<span>batch</span><sup>AI</sup></span></Link>
      <div className="auth-eyebrow"><ShieldCheck size={14}/> YOUR CREATOR WORKSPACE</div>
      <h1>Welcome to your next big idea.</h1>
      <p className="auth-intro">Sign in or create an account to keep your content batches together.</p>
      {params.error && <p className="auth-message error" role="alert">{messages[params.error] || "Something went wrong. Please try again."}</p>}
      {params.message === "check-email" && <p className="auth-message success">Check your inbox for a confirmation link to finish creating your account.</p>}
      <form action={signIn} className="auth-form">
        <h2>Sign in</h2>
        <label htmlFor="signin-email">Email address</label><input id="signin-email" name="email" type="email" autoComplete="email" required maxLength={254}/>
        <label htmlFor="signin-password">Password</label><input id="signin-password" name="password" type="password" autoComplete="current-password" minLength={8} required/>
        <button type="submit">Sign in</button>
      </form>
      <div className="auth-divider"><span>NEW TO VIRALBATCH?</span></div>
      <form action={signUp} className="auth-form signup-form">
        <label htmlFor="signup-email">Email address</label><input id="signup-email" name="email" type="email" autoComplete="email" required maxLength={254}/>
        <label htmlFor="signup-password">Create password</label><input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} required/>
        <button type="submit" className="secondary-auth">Create account</button>
      </form>
      <Link className="back-link" href="/">← Back to content studio</Link>
    </section>
  </main>;
}
