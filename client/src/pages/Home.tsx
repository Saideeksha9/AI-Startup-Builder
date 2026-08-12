import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Lightbulb,
  LoaderCircle,
  LogIn,
  LogOut,
  Megaphone,
  Rocket,
  Search,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import React, { FormEvent, useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const { user, loading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const savedBlueprints = trpc.blueprint.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const saveBlueprint = trpc.blueprint.save.useMutation({
    onSuccess: () => {
      void savedBlueprints.refetch();
    },
  });
  const generateBlueprint = trpc.blueprint.generate.useMutation({
    onSuccess: (generatedBlueprint, variables) => {
      if (isAuthenticated) {
        saveBlueprint.mutate({ idea: variables.idea, blueprint: generatedBlueprint });
      }
    },
  });
  const [selectedBlueprint, setSelectedBlueprint] = useState<NonNullable<typeof generateBlueprint.data> | null>(null);
  const blueprint = selectedBlueprint ?? generateBlueprint.data;
  const isLoading = generateBlueprint.isPending;
  const errorMessage = inputError ?? generateBlueprint.error?.message ?? saveBlueprint.error?.message ?? savedBlueprints.error?.message;
  const saveStatus = saveBlueprint.isPending ? "Saving" : saveBlueprint.isSuccess ? "Saved" : saveBlueprint.isError ? "Save failed" : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedIdea = idea.trim();

    if (trimmedIdea.length < 10) {
      setInputError("Please describe your startup idea in at least 10 characters.");
      return;
    }

    setInputError(null);
    setSelectedBlueprint(null);
    generateBlueprint.mutate({ idea: trimmedIdea });
  }

  function openSavedBlueprint(savedBlueprint: NonNullable<typeof savedBlueprints.data>[number]) {
    generateBlueprint.reset();
    setIdea(savedBlueprint.idea);
    setInputError(null);
    setSelectedBlueprint(savedBlueprint.blueprint);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f6f8] text-slate-950">
      <div className="pointer-events-none absolute -left-24 top-36 h-72 w-72 rounded-full bg-[#dcecff] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rotate-12 rounded-[3rem] bg-[#f6dbe4] blur-2xl" />
      <div className="pointer-events-none absolute bottom-16 left-[12%] h-24 w-24 rotate-45 rounded-3xl border border-[#c9def6] bg-[#e7f0fb]/80" />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center sm:absolute sm:right-10 sm:top-8 sm:mb-0">
            {isAuthLoading ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              </span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <span className="hidden px-2 text-xs font-semibold text-slate-600 sm:inline">{user?.name ?? "Signed in"}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={startLogin} className="h-9 rounded-full border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Sign in to save
              </Button>
            )}
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
            <Rocket className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Autonomous AI Startup Builder
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.055em] text-black sm:text-6xl">
            Turn raw ideas into
            <span className="block">clear ventures.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-7 text-slate-600 sm:text-lg">
            A focused startup blueprint, shaped by product, growth, and technical thinking.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <label htmlFor="startup-idea" className="sr-only">
              Describe your startup idea
            </label>
            <input
              id="startup-idea"
              value={idea}
              onChange={(event) => {
                setIdea(event.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Describe a startup idea..."
              maxLength={2000}
              disabled={isLoading}
              className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 rounded-full bg-black px-4 text-sm font-semibold text-white shadow-none transition hover:bg-slate-800 active:scale-[0.97] sm:px-5"
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              <span className="hidden sm:inline">Generate</span>
            </Button>
          </form>

          {errorMessage ? (
            <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </p>
          ) : null}
        </header>

        {isAuthenticated ? (
          <section aria-label="Saved blueprints" className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-black tracking-[-0.015em] text-black">Saved blueprints</h2>
                <p className="text-xs font-light text-slate-500">New generations are saved here automatically.</p>
              </div>
            </div>

            {savedBlueprints.isLoading ? (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Loading your saved blueprints...
              </div>
            ) : savedBlueprints.data?.length ? (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {savedBlueprints.data.map(savedBlueprint => (
                  <button key={savedBlueprint.id} type="button" onClick={() => openSavedBlueprint(savedBlueprint)} className="min-w-52 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <p className="truncate text-sm font-bold text-slate-800">{savedBlueprint.blueprint.startupName}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      {new Date(savedBlueprint.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">Your saved startup blueprints will appear here.</p>
            )}
          </section>
        ) : null}

        {isLoading ? (
          <section className="mx-auto mt-16 flex max-w-md flex-col items-center rounded-3xl border border-slate-200 bg-white/80 px-8 py-14 text-center shadow-sm backdrop-blur-sm">
            <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold tracking-tight text-black">Strategizing...</p>
          </section>
        ) : blueprint ? (
          <section className="mt-16 space-y-6" aria-live="polite">
            <article className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 p-7 text-white shadow-[0_20px_45px_rgba(37,99,235,0.22)] sm:p-10">
              <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-50">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Startup blueprint
                  </div>
                  <h2 className="mt-5 text-3xl font-black tracking-[-0.045em] sm:text-5xl">{blueprint.startupName}</h2>
                  <p className="mt-3 max-w-2xl text-base font-light leading-7 text-blue-50 sm:text-lg">{blueprint.tagline}</p>
                </div>
                <div className="flex items-center gap-3">
                  {isAuthenticated && saveStatus ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
                      {saveBlueprint.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : saveBlueprint.isSuccess ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}
                      {saveStatus}
                    </span>
                  ) : !isAuthenticated ? (
                    <button type="button" onClick={startLogin} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 transition hover:bg-white/20">
                      Sign in to save
                    </button>
                  ) : null}
                  <Rocket className="h-10 w-10 text-blue-100/90" aria-hidden="true" />
                </div>
              </div>
            </article>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Target className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black tracking-[-0.025em] text-black">Business Strategy</h2>
                    <p className="mt-0.5 text-sm font-light text-slate-500">Audience, model, and landscape.</p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-400">Target audience</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{blueprint.targetAudience}</p>
                </div>

                <div className="mt-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-400">Business model</p>
                  <ul className="mt-3 space-y-3">
                    {blueprint.businessModel.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7">
                  <div className="flex items-center gap-2">
                    <UsersRound className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-400">Competitors</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {blueprint.competitors.map((competitor) => (
                      <span key={competitor} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {competitor}
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7e9ef] text-[#bf4d7c]">
                    <Megaphone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black tracking-[-0.025em] text-black">Marketing Plan</h2>
                    <p className="mt-0.5 text-sm font-light text-slate-500">A practical path to first customers.</p>
                  </div>
                </div>
                <ol className="mt-8 space-y-5">
                  {blueprint.marketingPlan.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="pt-0.5 text-sm leading-6 text-slate-700">{step}</p>
                    </li>
                  ))}
                </ol>
              </article>
            </div>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff2d9] text-amber-600">
                  <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-black tracking-[-0.025em] text-black">Generated Landing Page</h2>
                  <p className="mt-0.5 text-sm font-light text-slate-500">A concise first impression for your product.</p>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#f8fafc]">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-14 text-center text-white sm:px-10 sm:py-16">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100">{blueprint.startupName}</p>
                  <h3 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-5xl">{blueprint.landingPage.heroHeadline}</h3>
                  <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-6 text-blue-50 sm:text-base">{blueprint.landingPage.heroSubheadline}</p>
                  <button type="button" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 active:scale-[0.97]">
                    {blueprint.landingPage.ctaButtonText}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
                  {blueprint.landingPage.features.map((feature, index) => (
                    <div key={`${feature.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden="true" />
                      <h4 className="mt-5 text-base font-black tracking-[-0.02em] text-black">{feature.title}</h4>
                      <p className="mt-2 text-sm font-light leading-6 text-slate-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>
        ) : (
          <section className="mx-auto mt-16 max-w-md rounded-[2rem] border border-dashed border-slate-300 bg-white/65 px-8 py-14 text-center backdrop-blur-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2d9] text-amber-600">
              <Lightbulb className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-black tracking-[-0.025em] text-black">Begin with an idea.</h2>
            <p className="mt-2 text-sm font-light leading-6 text-slate-600">Enter your early concept above to create a structured startup blueprint.</p>
          </section>
        )}
      </div>
    </main>
  );
}
