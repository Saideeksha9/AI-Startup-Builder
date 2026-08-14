import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { ArrowRight, BarChart3, Bot, BriefcaseBusiness, CheckCircle2, Compass, Menu, ShieldCheck, Sparkles, X } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";

const menuItems = [
  { label: "Home", target: "top" },
  { label: "Existing Ideas", target: "existing-ideas" },
  { label: "Companies", target: "companies" },
  { label: "App Info", target: "app-info" },
  { label: "How It Works", target: "how-it-works" },
] as const;

export default function PublicHome() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function scrollTo(target: string) {
    setIsMenuOpen(false);
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openDashboard() {
    if (isAuthenticated) {
      setLocation("/dashboard");
      return;
    }
    startLogin();
  }

  return (
    <main id="top" className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f8fafc]/85 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between">
          <button type="button" onClick={() => scrollTo("top")} className="inline-flex items-center gap-2 text-left" aria-label="Go to home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
            <span className="hidden text-sm font-black tracking-[-0.02em] text-slate-900 sm:block">Autonomous AI Startup Builder</span>
          </button>

          <div className="flex items-center gap-2">
            {loading ? <span className="h-9 w-24 animate-pulse rounded-full bg-slate-200" aria-label="Checking account" /> : isAuthenticated ? <Button type="button" onClick={openDashboard} className="rounded-full bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800"><BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />Dashboard</Button> : <><Button type="button" variant="outline" onClick={startLogin} className="hidden rounded-full border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex">Sign in</Button><Button type="button" onClick={startLogin} className="hidden rounded-full bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800 sm:inline-flex">Create account</Button></>}
            <Button type="button" variant="outline" size="icon" onClick={() => setIsMenuOpen(open => !open)} aria-expanded={isMenuOpen} aria-controls="public-navigation" aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"} className="rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50"><span className="sr-only">Navigation</span>{isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}</Button>
          </div>
        </div>

        {isMenuOpen ? <nav id="public-navigation" aria-label="Public navigation" className="border-t border-slate-200 bg-white shadow-xl"><div className="container grid gap-1 py-4 sm:grid-cols-2">{menuItems.map(item => <button key={item.target} type="button" onClick={() => scrollTo(item.target)} className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">{item.label}</button>)}<button type="button" onClick={() => { setIsMenuOpen(false); openDashboard(); }} className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">Dashboard</button>{!isAuthenticated ? <div className="mt-2 flex gap-2 border-t border-slate-100 pt-4 sm:col-span-2"><Button type="button" variant="outline" onClick={startLogin} className="rounded-full border-slate-200 bg-white text-xs font-bold">Sign in</Button><Button type="button" onClick={startLogin} className="rounded-full bg-slate-950 text-xs font-bold text-white">Create account</Button></div> : null}</div></nav> : null}
      </header>

      <section className="relative isolate overflow-hidden border-b border-slate-200/70">
        <div className="absolute -left-24 top-12 -z-10 h-72 w-72 rounded-full bg-blue-100/80 blur-3xl" /><div className="absolute -right-24 top-0 -z-10 h-80 w-80 rounded-full bg-indigo-100/80 blur-3xl" />
        <div className="container grid gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
          <div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm"><Compass className="h-3.5 w-3.5" aria-hidden="true" />From idea to operating venture</div><h1 className="mt-6 text-5xl font-black leading-[0.96] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">Build the next move, not just the next slide.</h1><p className="mt-7 max-w-2xl text-lg font-light leading-8 text-slate-600">Autonomous AI Startup Builder helps founders turn a raw concept into a practical blueprint, then organize milestones, risks, investment scenarios, crisis planning, research notes, and step-by-step advisor guidance in one private workspace.</p><div className="mt-9 flex flex-wrap gap-3"><Button type="button" onClick={openDashboard} className="rounded-full bg-slate-950 px-5 font-bold text-white hover:bg-slate-800">{isAuthenticated ? "Open your dashboard" : "Create your account"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button><Button type="button" variant="outline" onClick={() => scrollTo("how-it-works")} className="rounded-full border-slate-200 bg-white px-5 font-bold text-slate-700 hover:bg-slate-50">See how it works</Button></div><p className="mt-4 text-xs text-slate-500">Already have an account? Choose <span className="font-bold text-slate-700">Sign in</span> to continue to your private dashboard.</p></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] sm:p-8"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-blue-700">What you can organize</p><div className="mt-6 space-y-4"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black text-slate-900">Idea → blueprint</p><p className="mt-1 text-sm leading-6 text-slate-600">Clarify the audience, business model, competitors, marketing plan, and landing-page concept.</p></div><div className="rounded-2xl bg-blue-50 p-4"><p className="text-sm font-black text-slate-900">Blueprint → workspace</p><p className="mt-1 text-sm leading-6 text-slate-600">Track milestones, planning scenarios, risks, crisis plans, notes, and detailed advisor guidance.</p></div><div className="rounded-2xl bg-indigo-50 p-4"><p className="text-sm font-black text-slate-900">Workspace → progress</p><p className="mt-1 text-sm leading-6 text-slate-600">Export the current venture as Markdown or PDF whenever you need to share or review it.</p></div></div></div>
        </div>
      </section>

      <section id="existing-ideas" className="scroll-mt-24 border-b border-slate-200 bg-white py-20"><div className="container"><div className="max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-blue-700">Existing ideas</p><h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Your ideas stay organized in one private list.</h2><p className="mt-4 text-base leading-7 text-slate-600">Every saved blueprint becomes a venture you can reopen. Use your dashboard to move between existing ideas without mixing their notes, risks, milestones, advisor conversation, or exports.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{[["Save deliberately", "Only ideas you explicitly save are added to your private venture list."], ["Open the right context", "Each venture opens its own workspace with independent records and recommendations."], ["Keep the history useful", "Return to an idea when you are ready to refine its plan or update its next action."]].map(([title, description]) => <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" /><h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>)}</div></div></section>

      <section id="companies" className="scroll-mt-24 bg-[#f8fafc] py-20"><div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"><div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-indigo-700">Companies</p><h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Give each company a practical operating space.</h2><p className="mt-4 text-base leading-7 text-slate-600">A venture workspace is the control center for one startup or company concept. It keeps planning records connected to the idea they belong to, so you can focus the next decision on the right business.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><BriefcaseBusiness className="h-6 w-6 text-blue-600" aria-hidden="true" /><h3 className="mt-5 text-lg font-black text-slate-900">One workspace per venture</h3><p className="mt-2 text-sm leading-6 text-slate-600">Separate concepts, company plans, and decisions without losing the wider picture.</p></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><Bot className="h-6 w-6 text-indigo-600" aria-hidden="true" /><h3 className="mt-5 text-lg font-black text-slate-900">Context-aware advisor</h3><p className="mt-2 text-sm leading-6 text-slate-600">Ask for detailed guidance using the records already connected to that company.</p></div></div></div></section>

      <section id="app-info" className="scroll-mt-24 border-y border-slate-200 bg-slate-950 py-20 text-white"><div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"><div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-blue-200">App info</p><h2 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl">Clear structure for the uncertain parts of building a company.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">The app combines structured startup planning with an operational workspace. It gives you a place to document assumptions, map priorities, see likely risks, and decide the next useful action.</p></div><div className="rounded-3xl border border-white/10 bg-white/5 p-6"><ShieldCheck className="h-6 w-6 text-blue-200" aria-hidden="true" /><p className="mt-5 text-sm font-bold text-white">Private by account</p><p className="mt-2 text-sm leading-6 text-slate-300">Your saved ventures and workspace records are scoped to your account. Sign in to view your dashboard and continue working.</p></div></div></section>

      <section id="how-it-works" className="scroll-mt-24 bg-white py-20"><div className="container"><div className="max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-blue-700">How it works</p><h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">A simple path from first thought to a working plan.</h2></div><ol className="mt-10 grid gap-5 lg:grid-cols-4">{[["01", "Create your account", "New founders use Create account; returning founders use Sign in."], ["02", "Generate a blueprint", "Describe an idea and get a structured plan, landing-page concept, and practical recommendations."], ["03", "Save and organize", "Choose which blueprints to save, then add records to the venture workspace."], ["04", "Use your dashboard", "Open a company, consult the advisor, and export the workspace when you need it."]].map(([step, title, description]) => <li key={step} className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><span className="text-sm font-black tracking-[0.18em] text-blue-700">{step}</span><h3 className="mt-8 text-lg font-black text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></li>)}</ol><div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-blue-50 px-6 py-5"><div><p className="font-black text-slate-900">Ready to continue?</p><p className="mt-1 text-sm text-slate-600">Open your private dashboard or start a new account.</p></div><Button type="button" onClick={openDashboard} className="rounded-full bg-slate-950 font-bold text-white hover:bg-slate-800">{isAuthenticated ? "Open dashboard" : "Sign in or create account"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></div></div></section>

      <footer className="bg-slate-950 py-8 text-slate-400"><div className="container flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>Autonomous AI Startup Builder</span><button type="button" onClick={() => scrollTo("top")} className="font-semibold text-slate-200 hover:text-white">Back to top</button></div></footer>
    </main>
  );
}
