import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { GoogleSignInButton } from "@/components/admin/google-sign-in-button";
import { getAdminSession } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  const configured = Boolean(process.env.NEXTAUTH_SECRET && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.ADMIN_EMAIL);
  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#eef2ff] px-4 py-10 text-slate-950"><div aria-hidden="true" className="absolute -left-24 top-10 size-80 rounded-full bg-[#8de8c6]/40 blur-3xl" /><div aria-hidden="true" className="absolute -right-20 bottom-0 size-96 rounded-full bg-[#335cff]/20 blur-3xl" /><section className="relative w-full max-w-md rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_25px_80px_rgba(30,41,59,0.14)] backdrop-blur-xl sm:p-9"><span className="grid size-12 place-items-center rounded-2xl bg-[#0c1729] text-white"><ShieldCheck aria-hidden="true" className="size-6" /></span><p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#335cff]">Private workspace</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Portfolio admin</h1><p className="mt-3 text-sm leading-6 text-slate-600">Sign in with the Google account configured as the administrator. Other accounts are rejected automatically.</p>{!configured ? <div role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">Admin sign-in is waiting for the OAuth values in <code className="font-mono text-xs">.env.local</code>. Copy <code className="font-mono text-xs">.env.example</code> and complete the Google settings.</div> : null}<div className="mt-8"><GoogleSignInButton disabled={!configured} /></div><p className="mt-6 text-center text-xs leading-5 text-slate-500">Protected with an exact email allowlist and an 8-hour session.</p></section></main>;
}
