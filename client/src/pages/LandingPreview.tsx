import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Rocket } from "lucide-react";
import React, { useEffect, useState } from "react";

type LandingPreviewData = {
  startupName: string;
  landingPage: {
    heroHeadline: string;
    heroSubheadline: string;
    ctaButtonText: string;
    features: Array<{ title: string; description: string }>;
  };
};

const storageKey = "autonomous-ai-startup-landing-preview";

export default function LandingPreview() {
  const [blueprint, setBlueprint] = useState<LandingPreviewData | null>(null);
  const [ctaComplete, setCtaComplete] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) setBlueprint(JSON.parse(raw));
    } catch {
      setBlueprint(null);
    }
  }, []);

  if (!blueprint) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Rocket className="mx-auto h-8 w-8 text-blue-600" aria-hidden="true" /><h1 className="mt-4 text-2xl font-black text-black">No landing page preview is available.</h1><p className="mt-3 text-sm leading-6 text-slate-600">Return to the startup builder, generate a blueprint, then use its landing-page CTA to open this interactive preview.</p><Button type="button" onClick={() => window.close()} className="mt-6 rounded-full bg-slate-950 text-white">Close preview</Button></section></main>;
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><div className="flex items-center gap-2 text-sm font-black tracking-[-0.02em]"><Rocket className="h-4 w-4 text-blue-600" aria-hidden="true" />{blueprint.startupName}</div><Button type="button" variant="outline" onClick={() => window.close()} className="rounded-full border-slate-200 bg-white text-xs"> <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Back to builder</Button></header>
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center sm:pt-20"><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">Generated landing page preview</p><h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-[-0.055em] text-black sm:text-6xl">{blueprint.landingPage.heroHeadline}</h1><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{blueprint.landingPage.heroSubheadline}</p><Button type="button" onClick={() => setCtaComplete(true)} className="mt-9 h-12 rounded-full bg-blue-600 px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:bg-blue-700">{ctaComplete ? "Thanks — we will be in touch" : blueprint.landingPage.ctaButtonText}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>{ctaComplete ? <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />CTA interaction recorded in this preview.</p> : null}</section>
    <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-20 md:grid-cols-3">{blueprint.landingPage.features.map((feature, index) => <article key={`${feature.title}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><Lightbulb className="h-5 w-5 text-amber-500" aria-hidden="true" /><h2 className="mt-7 text-xl font-black tracking-[-0.025em] text-black">{feature.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p></article>)}</section>
  </main>;
}
