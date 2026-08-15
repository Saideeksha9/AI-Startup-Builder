import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Circle, Sparkles, X } from "lucide-react";
import React from "react";

type StepId = "review_profile" | "save_first_venture" | "review_workspace" | "ask_advisor";

type FounderWelcomeChecklistProps = {
  completedSteps: StepId[];
  dismissed: boolean;
  profileComplete: boolean;
  savedVentureCount: number;
  onToggleStep: (step: StepId) => void;
  onOpenSettings: () => void;
  onDismiss: () => void;
};

export function FounderWelcomeChecklist({ completedSteps, dismissed, profileComplete, savedVentureCount, onToggleStep, onOpenSettings, onDismiss }: FounderWelcomeChecklistProps) {
  if (dismissed) return null;
  const isComplete = (step: StepId) => completedSteps.includes(step) || (step === "review_profile" && profileComplete) || (step === "save_first_venture" && savedVentureCount > 0);
  const completedCount = (["review_profile", "save_first_venture", "review_workspace", "ask_advisor"] as StepId[]).filter(isComplete).length;
  const steps: Array<{ id: StepId; title: string; description: string; action?: string }> = [
    { id: "review_profile", title: "Shape your founder profile", description: "Add the details and planning preferences that matter to you.", action: "Open settings" },
    { id: "save_first_venture", title: "Save your first venture", description: "Keep only the ideas you choose in a private workspace." },
    { id: "review_workspace", title: "Review a venture workspace", description: "Open the milestones, risks, scenarios, and notes for one idea." },
    { id: "ask_advisor", title: "Ask the Venture Advisor", description: "Use the floating assistant for a practical next step." },
  ];

  return <section aria-label="Founder welcome checklist" className="mx-auto mt-7 max-w-4xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white"><Sparkles className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">New founder guide</p><h2 className="mt-1 text-lg font-black tracking-[-0.025em] text-slate-950">Start with a clear first move.</h2><p className="mt-1 text-xs leading-5 text-slate-600">{completedCount} of 4 initial steps complete. Your progress is saved to this account.</p></div></div><Button type="button" variant="ghost" size="icon" onClick={onDismiss} aria-label="Hide founder checklist" className="self-end rounded-full text-slate-500 hover:bg-white sm:self-start"><X className="h-4 w-4" aria-hidden="true" /></Button></div><ol className="divide-y divide-slate-100">{steps.map(step => { const complete = isComplete(step.id); return <li key={step.id} className="flex items-center gap-3 px-5 py-4 sm:px-6"><button type="button" onClick={() => onToggleStep(step.id)} aria-label={`${complete ? "Mark incomplete" : "Mark complete"}: ${step.title}`} className="shrink-0 rounded-full text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200">{complete ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <Circle className="h-5 w-5 text-slate-300" aria-hidden="true" />}</button><div className="min-w-0 flex-1"><p className={`text-sm font-bold ${complete ? "text-slate-500 line-through" : "text-slate-800"}`}>{step.title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{step.description}</p></div>{step.action ? <Button type="button" variant="outline" onClick={onOpenSettings} className="h-8 shrink-0 rounded-full border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">{step.action}<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></Button> : null}</li>; })}</ol></section>;
}
