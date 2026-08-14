import { useAuth } from "@/_core/hooks/useAuth";
import { AppNavigation } from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { startLogin, startRegistration } from "@/const";
import { ArrowRight, CheckCircle2, LoaderCircle, LogIn, UserPlus } from "lucide-react";
import React, { useEffect } from "react";
import { useLocation } from "wouter";

export function AccountAccess({ mode }: { mode: "sign-in" | "register" }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const isRegistration = mode === "register";

  useEffect(() => {
    if (!loading && isAuthenticated) setLocation("/dashboard");
  }, [isAuthenticated, loading, setLocation]);

  const action = isRegistration ? startRegistration : startLogin;
  const Icon = isRegistration ? UserPlus : LogIn;
  const title = isRegistration ? "Create your founder account" : "Welcome back";
  const description = isRegistration
    ? "Open the secure account portal to create an account, then keep your startup blueprints, venture workspaces, notes, advisor conversations, and exports private to you."
    : "Sign in to continue working on your private startup ideas, company workspaces, and venture plans.";

  return <main className="min-h-screen bg-[#f8fafc] text-slate-950"><AppNavigation /><section className="container grid min-h-[calc(100vh-72px)] place-items-center py-12"><div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.1)] lg:grid-cols-[0.85fr_1.15fr]"><aside className="bg-slate-950 p-8 text-white sm:p-12"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white"><Icon className="h-5 w-5" aria-hidden="true" /></div><p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">Autonomous AI Startup Builder</p><h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.045em]">{isRegistration ? "Build privately. Move with clarity." : "Your venture workspace is ready."}</h1><ul className="mt-8 space-y-3 text-sm leading-6 text-slate-300"><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />Keep every saved startup scoped to your account.</li><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />Return to milestones, risks, notes, and planning when you are ready.</li><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />Open your dashboard from any primary app page.</li></ul></aside><div className="p-8 sm:p-12"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">{isRegistration ? "New here?" : "Already registered?"}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-slate-950">{title}</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{description}</p><Button type="button" onClick={action} className="mt-8 rounded-full bg-slate-950 px-5 font-bold text-white hover:bg-slate-800">{isRegistration ? "Open secure account portal" : "Continue to secure sign in"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>{loading ? <div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />Checking your account…</div> : null}<p className="mt-5 text-sm text-slate-500">{isRegistration ? "Already have an account?" : "New to the builder?"} <button type="button" onClick={() => setLocation(isRegistration ? "/sign-in" : "/register")} className="font-bold text-blue-700 hover:underline">{isRegistration ? "Sign in" : "Create an account"}</button></p></div></div></section></main>;
}

export function SignInPage() {
  return <AccountAccess mode="sign-in" />;
}

export function RegisterPage() {
  return <AccountAccess mode="register" />;
}
