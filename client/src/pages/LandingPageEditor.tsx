import { useAuth } from "@/_core/hooks/useAuth";
import { AppNavigation } from "@/components/AppNavigation";
import { Button } from "@/components/ui/button";
import { downloadLandingPageHtml, type EditableLandingPage } from "@/lib/landingPageExport";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, ExternalLink, FilePenLine, LoaderCircle, Save } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";

type LandingPageDraft = EditableLandingPage["landingPage"];

export default function LandingPageEditor() {
  const { isAuthenticated, loading } = useAuth();
  const [, params] = useRoute("/landing/:savedBlueprintId/edit");
  const [, setLocation] = useLocation();
  const savedBlueprintId = Number(params?.savedBlueprintId);
  const savedBlueprints = trpc.blueprint.list.useQuery(undefined, { enabled: isAuthenticated && Number.isInteger(savedBlueprintId) && savedBlueprintId > 0 });
  const record = useMemo(() => savedBlueprints.data?.find(item => item.id === savedBlueprintId), [savedBlueprints.data, savedBlueprintId]);
  const [draft, setDraft] = useState<LandingPageDraft | null>(null);
  const updateLandingPage = trpc.blueprint.updateLandingPage.useMutation({ onSuccess: () => void savedBlueprints.refetch() });

  useEffect(() => {
    if (record?.blueprint.landingPage) setDraft(record.blueprint.landingPage);
  }, [record?.id, record?.blueprint.landingPage]);

  if (loading) return <main className="min-h-screen bg-slate-50"><AppNavigation /><div className="grid min-h-[calc(100vh-72px)] place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-blue-600" /></div></main>;
  if (!isAuthenticated) return <main className="min-h-screen bg-slate-50"><AppNavigation /><section className="grid min-h-[calc(100vh-72px)] place-items-center p-6"><div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><FilePenLine className="mx-auto h-8 w-8 text-blue-600" /><h1 className="mt-4 text-2xl font-black text-slate-950">Sign in to edit your landing page.</h1><p className="mt-3 text-sm leading-6 text-slate-600">Landing-page edits stay private to the saved venture in your account.</p><Button onClick={() => setLocation("/sign-in")} className="mt-6 rounded-full bg-slate-950 text-white">Sign in</Button></div></section></main>;
  if (savedBlueprints.isLoading || !draft || !record) return <main className="min-h-screen bg-slate-50"><AppNavigation /><div className="grid min-h-[calc(100vh-72px)] place-items-center"><LoaderCircle className="h-6 w-6 animate-spin text-blue-600" /></div></main>;

  function setFeature(index: number, field: "title" | "description", value: string) {
    setDraft(current => current ? { ...current, features: current.features.map((feature, featureIndex) => featureIndex === index ? { ...feature, [field]: value } : feature) } : current);
  }

  function save() {
    updateLandingPage.mutate({ savedBlueprintId, landingPage: draft! });
  }

  const exportDocument = { startupName: record.blueprint.startupName, landingPage: draft };
  return <main className="min-h-screen bg-slate-50 text-slate-950"><AppNavigation /><section className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end"><div><button type="button" onClick={() => setLocation("/dashboard")} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-700"><ArrowLeft className="h-3.5 w-3.5" />Back to dashboard</button><p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Landing page editor</p><h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">{record.blueprint.startupName}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Edit your venture’s public message, then preview or export the final standalone HTML.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => window.open(`/landing/${savedBlueprintId}/preview`, "_blank", "noopener")} className="rounded-full border-slate-200 bg-white text-xs font-bold"><ExternalLink className="h-3.5 w-3.5" />Preview</Button><Button type="button" variant="outline" onClick={() => downloadLandingPageHtml(exportDocument)} className="rounded-full border-slate-200 bg-white text-xs font-bold"><Download className="h-3.5 w-3.5" />Export HTML</Button><Button type="button" onClick={save} disabled={updateLandingPage.isPending} className="rounded-full bg-slate-950 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" />{updateLandingPage.isPending ? "Saving" : "Save changes"}</Button></div></div>
    {updateLandingPage.error ? <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{updateLandingPage.error.message}</p> : null}
    {updateLandingPage.isSuccess ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Landing-page changes saved to this venture.</p> : null}
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]"><form className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><div><label htmlFor="hero-headline" className="text-sm font-bold text-slate-900">Hero headline</label><input id="hero-headline" value={draft.heroHeadline} onChange={event => setDraft({ ...draft, heroHeadline: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label htmlFor="hero-subheadline" className="text-sm font-bold text-slate-900">Supporting copy</label><textarea id="hero-subheadline" value={draft.heroSubheadline} onChange={event => setDraft({ ...draft, heroSubheadline: event.target.value })} rows={4} className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label htmlFor="hero-cta" className="text-sm font-bold text-slate-900">Call-to-action label</label><input id="hero-cta" value={draft.ctaButtonText} onChange={event => setDraft({ ...draft, ctaButtonText: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><p className="text-sm font-bold text-slate-900">Feature sections</p><div className="mt-3 space-y-3">{draft.features.map((feature, index) => <fieldset key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><legend className="px-1 text-xs font-bold text-slate-500">Feature {index + 1}</legend><label className="sr-only" htmlFor={`feature-title-${index}`}>Feature {index + 1} title</label><input id={`feature-title-${index}`} value={feature.title} onChange={event => setFeature(index, "title", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><label className="sr-only" htmlFor={`feature-description-${index}`}>Feature {index + 1} description</label><textarea id={`feature-description-${index}`} value={feature.description} onChange={event => setFeature(index, "description", event.target.value)} rows={3} className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></fieldset>)}</div></div></form>
    <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_45px_rgba(15,23,42,0.18)]"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">Live draft</p><h2 className="mt-4 text-3xl font-black tracking-[-0.045em]">{draft.heroHeadline}</h2><p className="mt-4 text-sm leading-6 text-slate-300">{draft.heroSubheadline}</p><span className="mt-6 inline-flex rounded-full bg-blue-500 px-4 py-2 text-xs font-bold">{draft.ctaButtonText}</span><div className="mt-8 space-y-3">{draft.features.map((feature, index) => <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-bold">{feature.title}</p><p className="mt-2 text-xs leading-5 text-slate-300">{feature.description}</p></div>)}</div><p className="mt-6 text-xs leading-5 text-slate-400">Export HTML to host this standalone page anywhere. To publish this full app, use the Manus Publish control after saving a checkpoint.</p></aside></div></section></main>;
}
