import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { VentureChat } from "@/components/VentureChat";
import { VentureWorkspaceViews } from "@/components/VentureWorkspaceViews";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  LogIn,
  LogOut,
  Megaphone,
  Plus,
  Rocket,
  Search,
  ShieldAlert,
  Siren,
  Sparkles,
  Target,
  Trash2,
  UsersRound,
} from "lucide-react";
import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type StartupBlueprint = {
  startupName: string;
  tagline: string;
  targetAudience: string;
  businessModel: string[];
  competitors: string[];
  marketingPlan: string[];
  landingPage: {
    heroHeadline: string;
    heroSubheadline: string;
    ctaButtonText: string;
    features: Array<{ title: string; description: string }>;
  };
  ventureWorkspace?: {
    detailedActionPlan: Array<{ phase: string; objective: string; actions: string[]; whyItMatters: string }>;
    initialMilestones: Array<{ title: string; targetOffsetDays: number; objective: string }>;
    investmentScenarios: Array<{ name: string; fundingAmount: string; valuation: string; runwayMonths: number; useOfFunds: string }>;
    risks: Array<{ title: string; severity: "low" | "medium" | "high" | "critical"; likelihood: "low" | "medium" | "high"; mitigationNotes: string }>;
    crisisPlans: Array<{ title: string; triggerConditions: string; responseSteps: string; owner: string }>;
  };
};

type SavedStartup = {
  id: number;
  idea: string;
  createdAt: Date | string;
  interestTopicId?: number | null;
  interestOtherText?: string | null;
  blueprint: StartupBlueprint;
};

function CurrencyInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <input value={value} onChange={event => onChange(event.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder={placeholder} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />;
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [useOtherTopic, setUseOtherTopic] = useState(false);
  const [otherTopic, setOtherTopic] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [pendingSaveDetails, setPendingSaveDetails] = useState<{ idea: string; interestTopicId: number | null; interestOtherText: string | null } | null>(null);
  const [selectedSavedStartup, setSelectedSavedStartup] = useState<SavedStartup | null>(null);
  const [activeStartupId, setActiveStartupId] = useState<number | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDate, setMilestoneDate] = useState("");
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioFunding, setScenarioFunding] = useState("");
  const [scenarioValuation, setScenarioValuation] = useState("");
  const [scenarioRunway, setScenarioRunway] = useState("");
  const [riskTitle, setRiskTitle] = useState("");
  const [riskMitigation, setRiskMitigation] = useState("");
  const [crisisTitle, setCrisisTitle] = useState("");
  const [crisisTrigger, setCrisisTrigger] = useState("");
  const [crisisOwner, setCrisisOwner] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteTopic, setNoteTopic] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteReferenceUrl, setNoteReferenceUrl] = useState("");
  const notesSectionRef = useRef<HTMLElement | null>(null);

  const { user, loading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const fields = trpc.taxonomy.fields.useQuery(undefined, { staleTime: 60_000 });
  const topicQueryInput = useMemo(() => ({ fieldId: Number(fieldId) }), [fieldId]);
  const topics = trpc.taxonomy.topics.useQuery(topicQueryInput, { enabled: Boolean(fieldId), staleTime: 60_000, retry: 1 });
  const savedStartups = trpc.blueprint.list.useQuery(undefined, { enabled: isAuthenticated, retry: false, refetchOnWindowFocus: false });
  const workspace = trpc.workspace.get.useQuery({ savedBlueprintId: activeStartupId }, { enabled: Boolean(activeStartupId), refetchOnWindowFocus: false });

  const saveBlueprint = trpc.blueprint.save.useMutation({
    onSuccess: result => {
      setActiveStartupId(result.id);
      setPendingSaveDetails(null);
      void savedStartups.refetch();
    },
  });
  const generateBlueprint = trpc.blueprint.generate.useMutation();
  const generateWorkspacePlan = trpc.blueprint.generateWorkspacePlan.useMutation({
    onSuccess: generatedPlan => {
      setSelectedSavedStartup(current => current ? { ...current, blueprint: generatedPlan } : current);
      void savedStartups.refetch();
      void workspace.refetch();
    },
  });
  const addMilestone = trpc.workspace.addMilestone.useMutation({ onSuccess: () => { setMilestoneTitle(""); setMilestoneDate(""); void workspace.refetch(); } });
  const updateMilestone = trpc.workspace.updateMilestoneStatus.useMutation({ onSuccess: () => void workspace.refetch() });
  const addScenario = trpc.workspace.addInvestmentScenario.useMutation({ onSuccess: () => { setScenarioName(""); setScenarioFunding(""); setScenarioValuation(""); setScenarioRunway(""); void workspace.refetch(); } });
  const addRisk = trpc.workspace.addRisk.useMutation({ onSuccess: () => { setRiskTitle(""); setRiskMitigation(""); void workspace.refetch(); } });
  const addCrisisPlan = trpc.workspace.addCrisisPlan.useMutation({ onSuccess: () => { setCrisisTitle(""); setCrisisTrigger(""); setCrisisOwner(""); void workspace.refetch(); } });
  const deleteMilestone = trpc.workspace.deleteMilestone.useMutation({ onSuccess: () => void workspace.refetch() });
  const deleteScenario = trpc.workspace.deleteInvestmentScenario.useMutation({ onSuccess: () => void workspace.refetch() });
  const deleteRisk = trpc.workspace.deleteRisk.useMutation({ onSuccess: () => void workspace.refetch() });
  const deleteCrisisPlan = trpc.workspace.deleteCrisisPlan.useMutation({ onSuccess: () => void workspace.refetch() });
  const addNote = trpc.workspace.addNote.useMutation({ onSuccess: () => { setNoteTitle(""); setNoteTopic(""); setNoteContent(""); setNoteReferenceUrl(""); void workspace.refetch(); } });
  const deleteNote = trpc.workspace.deleteNote.useMutation({ onSuccess: () => void workspace.refetch() });

  const isLoading = generateBlueprint.isPending;
  const blueprint = selectedSavedStartup?.blueprint ?? generateBlueprint.data;
  const selectedField = fields.data?.find(field => field.id === Number(fieldId));
  const selectedTopic = topics.data?.find(topic => topic.id === Number(topicId));
  const saveStatus = saveBlueprint.isPending ? "Saving" : saveBlueprint.isSuccess ? "Saved" : saveBlueprint.isError ? "Save failed" : null;
  const detailedActionPlan = blueprint?.ventureWorkspace?.detailedActionPlan ?? [];
  const activeStartupName = selectedSavedStartup?.blueprint.startupName ?? savedStartups.data?.find(startup => startup.id === activeStartupId)?.blueprint.startupName ?? null;
  const errorMessage = inputError ?? generateBlueprint.error?.message ?? saveBlueprint.error?.message ?? savedStartups.error?.message ?? workspace.error?.message ?? (fieldId ? topics.error?.message : null);

  useEffect(() => {
    if (activeStartupId && !savedStartups.data?.some(startup => startup.id === activeStartupId)) {
      setActiveStartupId(null);
    }
  }, [activeStartupId, savedStartups.data]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedIdea = idea.trim();

    if (trimmedIdea.length < 10) {
      setInputError("Please describe your startup idea in at least 10 characters.");
      return;
    }
    if (!fieldId) {
      setInputError("Select an interest field before generating a startup blueprint.");
      return;
    }
    if (!useOtherTopic && !topicId) {
      setInputError("Select an interest topic or choose Other.");
      return;
    }
    if (useOtherTopic && otherTopic.trim().length < 2) {
      setInputError("Describe the Other interest topic in at least 2 characters.");
      return;
    }

    setInputError(null);
    setSelectedSavedStartup(null);
    setActiveStartupId(null);
    setPendingSaveDetails({
      idea: trimmedIdea,
      interestTopicId: useOtherTopic ? null : (topicId ? Number(topicId) : null),
      interestOtherText: useOtherTopic ? otherTopic.trim() : null,
    });
    generateBlueprint.mutate({
      idea: trimmedIdea,
      interestField: selectedField?.name ?? null,
      interestTopic: useOtherTopic ? "Other" : (selectedTopic?.name ?? null),
      interestOtherText: useOtherTopic ? otherTopic.trim() : null,
    });
  }

  function openSavedStartup(startup: SavedStartup) {
    generateBlueprint.reset();
    setIdea(startup.idea);
    setInputError(null);
    setSelectedSavedStartup(startup);
    setActiveStartupId(startup.id);
    setPendingSaveDetails(null);
  }

  function saveCurrentBlueprint() {
    if (!generateBlueprint.data || !pendingSaveDetails || saveBlueprint.isPending) return;
    saveBlueprint.mutate({ ...pendingSaveDetails, blueprint: generateBlueprint.data });
  }

  function openLandingPagePreview() {
    if (!blueprint) return;
    window.sessionStorage.setItem("autonomous-ai-startup-landing-preview", JSON.stringify(blueprint));
    window.open("/landing-preview", "_blank", "noopener");
  }

  function addWorkspaceMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStartupId || milestoneTitle.trim().length < 3) return;
    addMilestone.mutate({ savedBlueprintId: activeStartupId, title: milestoneTitle.trim(), targetDate: milestoneDate || null });
  }

  function addWorkspaceScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStartupId || scenarioName.trim().length < 3) return;
    addScenario.mutate({ savedBlueprintId: activeStartupId, name: scenarioName.trim(), fundingAmount: scenarioFunding || null, valuation: scenarioValuation || null, runwayMonths: scenarioRunway ? Number(scenarioRunway) : null, useOfFunds: null });
  }

  function addWorkspaceRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStartupId || riskTitle.trim().length < 3) return;
    addRisk.mutate({ savedBlueprintId: activeStartupId, title: riskTitle.trim(), severity: "medium", likelihood: "medium", mitigationNotes: riskMitigation.trim() || null });
  }

  function addWorkspaceCrisisPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStartupId || crisisTitle.trim().length < 3) return;
    addCrisisPlan.mutate({ savedBlueprintId: activeStartupId, title: crisisTitle.trim(), riskId: null, triggerConditions: crisisTrigger.trim() || null, responseSteps: null, owner: crisisOwner.trim() || null });
  }

  function addWorkspaceNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStartupId || !noteTitle.trim() || !noteContent.trim()) return;
    addNote.mutate({ savedBlueprintId: activeStartupId, title: noteTitle.trim(), topic: noteTopic.trim() || null, content: noteContent.trim(), referenceUrl: noteReferenceUrl.trim() || null });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f6f8] pb-24 text-slate-950">
      <div className="pointer-events-none absolute -left-24 top-36 h-72 w-72 rounded-full bg-[#dcecff] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rotate-12 rounded-[3rem] bg-[#f6dbe4] blur-2xl" />
      <div className="pointer-events-none absolute bottom-16 left-[12%] h-24 w-24 rotate-45 rounded-3xl border border-[#c9def6] bg-[#e7f0fb]/80" />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:px-10">
        <header className="mx-auto max-w-4xl text-center">
          <div className="mb-7 flex justify-center sm:absolute sm:right-10 sm:top-8 sm:mb-0">
            {isAuthLoading ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /></span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <span className="hidden px-2 text-xs font-semibold text-slate-600 sm:inline">{user?.name ?? "Signed in"}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"><LogOut className="h-4 w-4" aria-hidden="true" /></Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={startLogin} className="h-9 rounded-full border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><LogIn className="h-3.5 w-3.5" aria-hidden="true" />Sign in to save</Button>
            )}
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500"><Rocket className="h-4 w-4 text-blue-600" aria-hidden="true" />Autonomous AI Startup Builder</div>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.055em] text-black sm:text-6xl">Turn raw ideas into<span className="block">clear ventures.</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-7 text-slate-600 sm:text-lg">Generate the initial strategy, then manage the roadmap, risks, funding scenarios, and crisis readiness in one private workspace.</p>

          <form onSubmit={handleSubmit} className="mt-9 rounded-[2rem] border border-slate-200 bg-white p-2.5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 rounded-full bg-slate-50 p-1.5">
              <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="startup-idea" className="sr-only">Describe your startup idea</label>
              <input id="startup-idea" value={idea} onChange={event => { setIdea(event.target.value); if (inputError) setInputError(null); }} placeholder="Describe a startup idea..." maxLength={2000} disabled={isLoading} className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base" />
              <Button type="submit" disabled={isLoading} className="h-11 rounded-full bg-black px-4 text-sm font-semibold text-white shadow-none transition hover:bg-slate-800 active:scale-[0.97] sm:px-5">
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}<span className="hidden sm:inline">Generate</span>
              </Button>
            </div>
            <div className="grid gap-2 px-1 pb-1 pt-2 sm:grid-cols-[1fr_1fr_auto]">
              <select value={fieldId} onChange={event => { setFieldId(event.target.value); setTopicId(""); setUseOtherTopic(false); }} disabled={fields.isLoading} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
                <option value="">Choose field of interest</option>
                {fields.data?.map(field => <option key={field.id} value={field.id}>{field.name}</option>)}
              </select>
              <select value={useOtherTopic ? "other" : topicId} onChange={event => { const isOther = event.target.value === "other"; setUseOtherTopic(isOther); setTopicId(isOther ? "" : event.target.value); }} disabled={!fieldId || topics.isLoading} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100">
                <option value="">{!fieldId ? "Choose a field first" : topics.isLoading ? "Loading topics..." : topics.isError ? "Topics could not load" : "Choose topic"}</option>
                {topics.data?.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                <option value="other">Other</option>
              </select>
              {useOtherTopic ? <input value={otherTopic} onChange={event => setOtherTopic(event.target.value)} placeholder="Describe other topic" maxLength={240} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100" /> : <p className="flex items-center px-2 text-left text-[11px] font-light text-slate-400">Fields and topics are managed from your database.</p>}
            </div>
          </form>

          {errorMessage ? <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errorMessage}</p> : null}
        </header>

        {isAuthenticated ? (
          <section aria-label="Saved blueprints" className="mx-auto mt-7 max-w-4xl rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Bookmark className="h-4 w-4" aria-hidden="true" /></span><div><h2 className="text-sm font-black tracking-[-0.015em] text-black">Saved ventures</h2><p className="text-xs font-light text-slate-500">Save a generated blueprint when you are ready, then open its private workspace.</p></div></div>
            {savedStartups.isLoading ? <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Loading saved ventures...</div> : savedStartups.data?.length ? <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{savedStartups.data.map(startup => <button key={startup.id} type="button" onClick={() => openSavedStartup(startup as SavedStartup)} aria-pressed={activeStartupId === startup.id} className={activeStartupId === startup.id ? "min-w-52 rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-left ring-2 ring-blue-100" : "min-w-52 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60"}><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold text-slate-800">{startup.blueprint.startupName}</p>{activeStartupId === startup.id ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Open</span> : null}</div><div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Clock3 className="h-3 w-3" aria-hidden="true" />{new Date(startup.createdAt).toLocaleDateString()}</div></button>)}</div> : <p className="mt-4 text-xs text-slate-500">Your saved startup blueprints will appear here.</p>}
          </section>
        ) : null}

        {isLoading ? (
          <section className="mx-auto mt-16 flex max-w-md flex-col items-center rounded-3xl border border-slate-200 bg-white/80 px-8 py-14 text-center shadow-sm backdrop-blur-sm"><LoaderCircle className="h-7 w-7 animate-spin text-blue-600" aria-hidden="true" /><p className="mt-4 text-lg font-semibold tracking-tight text-black">Strategizing...</p></section>
        ) : blueprint ? (
          <section className="mt-12 space-y-6" aria-live="polite">
            <article className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 p-7 text-white shadow-[0_20px_45px_rgba(37,99,235,0.22)] sm:p-10"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-50"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />Startup blueprint</div><h2 className="mt-5 text-3xl font-black tracking-[-0.045em] sm:text-5xl">{blueprint.startupName}</h2><p className="mt-3 max-w-2xl text-base font-light leading-7 text-blue-50 sm:text-lg">{blueprint.tagline}</p></div><div className="flex items-center gap-3">{isAuthenticated && pendingSaveDetails ? <Button type="button" onClick={saveCurrentBlueprint} disabled={saveBlueprint.isPending} className="rounded-full bg-white px-4 text-xs font-bold text-blue-700 hover:bg-blue-50">{saveBlueprint.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}{saveBlueprint.isPending ? "Saving" : "Save to list"}</Button> : isAuthenticated && saveStatus === "Saved" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Saved</span> : !isAuthenticated ? <button type="button" onClick={startLogin} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 transition hover:bg-white/20">Sign in to save</button> : null}<Rocket className="h-10 w-10 text-blue-100/90" aria-hidden="true" /></div></div></article>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Target className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-xl font-black tracking-[-0.025em] text-black">Business Strategy</h2><p className="mt-0.5 text-sm font-light text-slate-500">Audience, model, and landscape.</p></div></div><div className="mt-8"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-400">Target audience</p><p className="mt-2 text-sm leading-6 text-slate-700">{blueprint.targetAudience}</p></div><div className="mt-7"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-400">Business model</p><ul className="mt-3 space-y-3">{blueprint.businessModel.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /></span>{item}</li>)}</ul></div><div className="mt-7"><div className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-slate-500" aria-hidden="true" /><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-400">Competitors</p></div><div className="mt-3 flex flex-wrap gap-2">{blueprint.competitors.map(competitor => <span key={competitor} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{competitor}</span>)}</div></div></article>
              <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7e9ef] text-[#bf4d7c]"><Megaphone className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-xl font-black tracking-[-0.025em] text-black">Marketing Plan</h2><p className="mt-0.5 text-sm font-light text-slate-500">A practical path to first customers.</p></div></div><ol className="mt-8 space-y-5">{blueprint.marketingPlan.map((step, index) => <li key={step} className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{String(index + 1).padStart(2, "0")}</span><p className="pt-0.5 text-sm leading-6 text-slate-700">{step}</p></li>)}</ol></article>
            </div>

            {detailedActionPlan.length ? <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-xl font-black tracking-[-0.025em] text-black">Step-by-step launch guide</h2><p className="mt-0.5 text-sm font-light text-slate-500">Proactive actions, likely consequences, and why each phase matters.</p></div></div><div className="mt-8 grid gap-4 lg:grid-cols-2">{detailedActionPlan.map((phase, index) => <section key={`${phase.phase}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Phase {index + 1} · {phase.phase}</p><h3 className="mt-2 text-base font-black text-slate-900">{phase.objective}</h3><ol className="mt-4 space-y-2">{phase.actions.map((action, actionIndex) => <li key={action} className="flex gap-2 text-sm leading-6 text-slate-700"><span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">{actionIndex + 1}</span>{action}</li>)}</ol><p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500"><span className="font-bold text-slate-700">Why this matters: </span>{phase.whyItMatters}</p></section>)}</div></article> : null}
            {activeStartupId && !detailedActionPlan.length ? <article className="rounded-[2rem] border border-blue-100 bg-blue-50/70 p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-lg font-black text-slate-900">Add the full venture plan to {activeStartupName ?? "this startup"}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">This startup was saved before automatic roadmap, risk, crisis, and scenario recommendations were available. Press the button once to generate and attach them to this saved startup only.</p></div><Button type="button" onClick={() => generateWorkspacePlan.mutate({ savedBlueprintId: activeStartupId })} disabled={generateWorkspacePlan.isPending} className="shrink-0 rounded-full bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700">{generateWorkspacePlan.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}{generateWorkspacePlan.isPending ? "Building plan..." : "Generate workspace plan"}</Button></div></article> : null}

            <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2d9] text-amber-600"><LayoutDashboard className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-xl font-black tracking-[-0.025em] text-black">Generated Landing Page</h2><p className="mt-0.5 text-sm font-light text-slate-500">An interactive preview of how visitors could first meet your product.</p></div></div><div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#f8fafc]"><div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-14 text-center text-white sm:px-10 sm:py-16"><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100">{blueprint.startupName}</p><h3 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-5xl">{blueprint.landingPage.heroHeadline}</h3><p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-6 text-blue-50 sm:text-base">{blueprint.landingPage.heroSubheadline}</p><button type="button" onClick={openLandingPagePreview} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 active:scale-[0.97]">{blueprint.landingPage.ctaButtonText}<ExternalLink className="h-4 w-4" aria-hidden="true" /></button><p className="mt-3 text-xs text-blue-100">Opens a working standalone preview in a new tab.</p></div><div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">{blueprint.landingPage.features.map((feature, index) => <div key={`${feature.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5"><Lightbulb className="h-4 w-4 text-amber-500" aria-hidden="true" /><h4 className="mt-5 text-base font-black tracking-[-0.02em] text-black">{feature.title}</h4><p className="mt-2 text-sm font-light leading-6 text-slate-600">{feature.description}</p></div>)}</div></div></article>

            {activeStartupId ? <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><Sparkles className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-xl font-black tracking-[-0.025em] text-black">Venture workspace</h2><p className="mt-0.5 text-sm font-semibold text-blue-700">Active startup: {activeStartupName ?? "Loading startup"}</p><p className="mt-0.5 text-sm font-light text-slate-500">Durable operational records for this startup. Investment scenarios are planning assumptions, not financial advice.</p></div></div><Button type="button" variant="outline" onClick={() => notesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-full border-indigo-200 bg-indigo-50 text-xs font-bold text-indigo-700 hover:bg-indigo-100"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" />Notes</Button></div>
              {workspace.isLoading ? <div className="mt-8 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />Loading private workspace...</div> : <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Milestone roadmap</h3></div><div className="mt-4 space-y-3">{workspace.data?.roadmap.map(milestone => <div key={milestone.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"><div><p className="text-sm font-semibold text-slate-800">{milestone.title}</p><p className="mt-0.5 text-[11px] text-slate-500">{milestone.targetDate ? new Date(milestone.targetDate).toLocaleDateString() : "No target date"}</p></div><select value={milestone.status} onChange={event => updateMilestone.mutate({ savedBlueprintId: activeStartupId, id: milestone.id, status: event.target.value as "planned" | "in_progress" | "done" | "blocked" })} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600"><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="done">Done</option><option value="blocked">Blocked</option></select></div>)}{!workspace.data?.roadmap.length ? <p className="text-xs text-slate-500">No milestones yet.</p> : null}</div><form onSubmit={addWorkspaceMilestone} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]"><input value={milestoneTitle} onChange={event => setMilestoneTitle(event.target.value)} placeholder="Add milestone" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={milestoneDate} onChange={event => setMilestoneDate(event.target.value)} type="date" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={addMilestone.isPending} className="rounded-xl bg-slate-950 px-3 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add</Button></form></article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-emerald-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Investment scenarios</h3></div><div className="mt-4 space-y-3">{workspace.data?.scenarios.map(scenario => <div key={scenario.id} className="rounded-xl bg-white p-3"><p className="text-sm font-semibold text-slate-800">{scenario.name}</p><p className="mt-1 text-xs text-slate-500">Funding {scenario.fundingAmount ?? "—"} · Valuation {scenario.valuation ?? "—"} · Runway {scenario.runwayMonths ?? "—"} months</p></div>)}{!workspace.data?.scenarios.length ? <p className="text-xs text-slate-500">No funding scenarios yet.</p> : null}</div><form onSubmit={addWorkspaceScenario} className="mt-4 grid gap-2 sm:grid-cols-2"><input value={scenarioName} onChange={event => setScenarioName(event.target.value)} placeholder="Scenario name" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><CurrencyInput value={scenarioFunding} onChange={setScenarioFunding} placeholder="Funding amount" /><CurrencyInput value={scenarioValuation} onChange={setScenarioValuation} placeholder="Valuation" /><input value={scenarioRunway} onChange={event => setScenarioRunway(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Runway (months)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={addScenario.isPending} className="col-span-full rounded-xl bg-slate-950 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add funding scenario</Button></form></article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Risk register</h3></div><div className="mt-4 space-y-3">{workspace.data?.riskRegister.map(risk => <div key={risk.id} className="rounded-xl bg-white p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">{risk.title}</p><span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">{risk.severity}</span></div><p className="mt-1 text-xs text-slate-500">Likelihood: {risk.likelihood}</p>{risk.mitigationNotes ? <p className="mt-2 text-xs leading-5 text-slate-600">{risk.mitigationNotes}</p> : null}</div>)}{!workspace.data?.riskRegister.length ? <p className="text-xs text-slate-500">No risks logged yet.</p> : null}</div><form onSubmit={addWorkspaceRisk} className="mt-4 grid gap-2"><input value={riskTitle} onChange={event => setRiskTitle(event.target.value)} placeholder="Risk title" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={riskMitigation} onChange={event => setRiskMitigation(event.target.value)} placeholder="Mitigation note (optional)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={addRisk.isPending} className="rounded-xl bg-slate-950 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add risk</Button></form></article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2"><Siren className="h-4 w-4 text-amber-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Crisis plans</h3></div><div className="mt-4 space-y-3">{workspace.data?.crisisResponsePlans.map(plan => <div key={plan.id} className="rounded-xl bg-white p-3"><p className="text-sm font-semibold text-slate-800">{plan.title}</p>{plan.triggerConditions ? <p className="mt-1 text-xs leading-5 text-slate-500">Trigger: {plan.triggerConditions}</p> : null}<p className="mt-1 text-[11px] text-slate-500">Owner: {plan.owner ?? "Unassigned"}</p></div>)}{!workspace.data?.crisisResponsePlans.length ? <p className="text-xs text-slate-500">No crisis plans yet.</p> : null}</div><form onSubmit={addWorkspaceCrisisPlan} className="mt-4 grid gap-2"><input value={crisisTitle} onChange={event => setCrisisTitle(event.target.value)} placeholder="Crisis plan title" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={crisisTrigger} onChange={event => setCrisisTrigger(event.target.value)} placeholder="Trigger condition" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={crisisOwner} onChange={event => setCrisisOwner(event.target.value)} placeholder="Owner" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={addCrisisPlan.isPending} className="rounded-xl bg-slate-950 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add crisis plan</Button></form></article>
                <article id="venture-notes" ref={notesSectionRef} className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 lg:col-span-2"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-indigo-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Venture notes</h3></div><p className="mt-1 text-xs text-slate-500">Save related research, decisions, topics, and source links privately with this startup.</p><div className="mt-4 space-y-3">{workspace.data?.notes?.map(note => <div key={note.id} className="rounded-xl bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{note.title}</p>{note.topic ? <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-indigo-600">{note.topic}</p> : null}</div><Button type="button" variant="ghost" size="icon" onClick={() => deleteNote.mutate({ savedBlueprintId: activeStartupId, id: note.id })} aria-label={`Delete note ${note.title}`} className="h-7 w-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button></div><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{note.content}</p>{note.referenceUrl ? <a href={note.referenceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"><ExternalLink className="h-3 w-3" aria-hidden="true" />Open reference</a> : null}</div>)}{!workspace.data?.notes?.length ? <p className="text-xs text-slate-500">No notes yet. Capture key research and decisions here.</p> : null}</div><form onSubmit={addWorkspaceNote} className="mt-4 grid gap-2"><div className="grid gap-2 sm:grid-cols-2"><input value={noteTitle} onChange={event => setNoteTitle(event.target.value)} placeholder="Note title" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={noteTopic} onChange={event => setNoteTopic(event.target.value)} placeholder="Topic (optional)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /></div><textarea value={noteContent} onChange={event => setNoteContent(event.target.value)} placeholder="Write related research, a decision, or an action to revisit..." className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={noteReferenceUrl} onChange={event => setNoteReferenceUrl(event.target.value)} type="url" placeholder="Reference link (https://..., optional)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={addNote.isPending} className="rounded-xl bg-slate-950 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Save note</Button></form></article>
              </div>}
              {workspace.data ? <VentureWorkspaceViews
                data={workspace.data}
                isWorking={addMilestone.isPending || addScenario.isPending || addRisk.isPending || addCrisisPlan.isPending || deleteMilestone.isPending || deleteScenario.isPending || deleteRisk.isPending || deleteCrisisPlan.isPending}
                onAddMilestone={(title, targetDate) => addMilestone.mutate({ savedBlueprintId: activeStartupId, title, targetDate: targetDate || null })}
                onUpdateMilestoneStatus={(id, status) => updateMilestone.mutate({ savedBlueprintId: activeStartupId, id, status })}
                onDeleteMilestone={id => deleteMilestone.mutate({ savedBlueprintId: activeStartupId, id })}
                onAddScenario={(name, fundingAmount, valuation, runwayMonths) => addScenario.mutate({ savedBlueprintId: activeStartupId, name, fundingAmount: fundingAmount || null, valuation: valuation || null, runwayMonths: runwayMonths ? Number(runwayMonths) : null, useOfFunds: null })}
                onDeleteScenario={id => deleteScenario.mutate({ savedBlueprintId: activeStartupId, id })}
                onAddRisk={(title, mitigationNotes) => addRisk.mutate({ savedBlueprintId: activeStartupId, title, severity: "medium", likelihood: "medium", mitigationNotes: mitigationNotes || null })}
                onDeleteRisk={id => deleteRisk.mutate({ savedBlueprintId: activeStartupId, id })}
                onAddCrisisPlan={(title, triggerConditions, owner) => addCrisisPlan.mutate({ savedBlueprintId: activeStartupId, title, riskId: null, triggerConditions: triggerConditions || null, responseSteps: null, owner: owner || null })}
                onDeleteCrisisPlan={id => deleteCrisisPlan.mutate({ savedBlueprintId: activeStartupId, id })}
              /> : null}
            </section> : null}
          </section>
        ) : (
          <section className="mx-auto mt-16 max-w-md rounded-[2rem] border border-dashed border-slate-300 bg-white/65 px-8 py-14 text-center backdrop-blur-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2d9] text-amber-600"><Lightbulb className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-5 text-xl font-black tracking-[-0.025em] text-black">Begin with an idea.</h2><p className="mt-2 text-sm font-light leading-6 text-slate-600">Choose a field and topic, then create a strategic startup blueprint and private workspace.</p></section>
        )}
      </div>
      {isAuthenticated ? <VentureChat startups={(savedStartups.data ?? []) as StartupOption[]} activeStartupId={activeStartupId} onWorkspaceChange={() => void workspace.refetch()} /> : null}
    </main>
  );
}

type StartupOption = { id: number; blueprint: { startupName: string } };
