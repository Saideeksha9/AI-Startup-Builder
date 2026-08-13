import { Button } from "@/components/ui/button";
import { Landmark, Plus, ShieldAlert, Siren, Target, Trash2 } from "lucide-react";
import React, { FormEvent, useState } from "react";

export type WorkspaceViewData = {
  roadmap: Array<{ id: number; title: string; targetDate: Date | string | null; status: "planned" | "in_progress" | "done" | "blocked" }>;
  scenarios: Array<{ id: number; name: string; fundingAmount: string | null; valuation: string | null; runwayMonths: number | null }>;
  riskRegister: Array<{ id: number; title: string; severity: "low" | "medium" | "high" | "critical"; likelihood: "low" | "medium" | "high"; mitigationNotes: string | null }>;
  crisisResponsePlans: Array<{ id: number; title: string; triggerConditions: string | null; responseSteps: string | null; owner: string | null }>;
};

type VentureWorkspaceViewsProps = {
  data: WorkspaceViewData;
  isWorking: boolean;
  onAddMilestone: (title: string, targetDate: string) => void;
  onUpdateMilestoneStatus: (id: number, status: WorkspaceViewData["roadmap"][number]["status"]) => void;
  onDeleteMilestone: (id: number) => void;
  onAddScenario: (name: string, fundingAmount: string, valuation: string, runwayMonths: string) => void;
  onDeleteScenario: (id: number) => void;
  onAddRisk: (title: string, mitigationNotes: string) => void;
  onDeleteRisk: (id: number) => void;
  onAddCrisisPlan: (title: string, trigger: string, owner: string) => void;
  onDeleteCrisisPlan: (id: number) => void;
};

const statusTone: Record<WorkspaceViewData["roadmap"][number]["status"], string> = {
  planned: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-50 text-blue-700",
  done: "bg-emerald-50 text-emerald-700",
  blocked: "bg-rose-50 text-rose-700",
};

function formatMoney(value: string | null) {
  return value ? `$${Number(value).toLocaleString()}` : "—";
}

export function VentureWorkspaceViews({
  data,
  isWorking,
  onAddMilestone,
  onUpdateMilestoneStatus,
  onDeleteMilestone,
  onAddScenario,
  onDeleteScenario,
  onAddRisk,
  onDeleteRisk,
  onAddCrisisPlan,
  onDeleteCrisisPlan,
}: VentureWorkspaceViewsProps) {
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

  function addMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (milestoneTitle.trim().length < 3) return;
    onAddMilestone(milestoneTitle.trim(), milestoneDate);
    setMilestoneTitle("");
    setMilestoneDate("");
  }

  function addScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (scenarioName.trim().length < 3) return;
    onAddScenario(scenarioName.trim(), scenarioFunding, scenarioValuation, scenarioRunway);
    setScenarioName("");
    setScenarioFunding("");
    setScenarioValuation("");
    setScenarioRunway("");
  }

  function addRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (riskTitle.trim().length < 3) return;
    onAddRisk(riskTitle.trim(), riskMitigation.trim());
    setRiskTitle("");
    setRiskMitigation("");
  }

  function addCrisisPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (crisisTitle.trim().length < 3) return;
    onAddCrisisPlan(crisisTitle.trim(), crisisTrigger.trim(), crisisOwner.trim());
    setCrisisTitle("");
    setCrisisTrigger("");
    setCrisisOwner("");
  }

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Roadmap timeline</h3></div>
        <ol className="mt-5 ml-2 space-y-4 border-l border-slate-200 pl-5" aria-label="Roadmap timeline">
          {data.roadmap.map(milestone => <li key={milestone.id} className="relative"><span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" /><div className="flex items-start justify-between gap-3 rounded-xl bg-white p-3"><div><p className="text-sm font-semibold text-slate-800">{milestone.title}</p><p className="mt-0.5 text-[11px] text-slate-500">{milestone.targetDate ? new Date(milestone.targetDate).toLocaleDateString() : "No target date"}</p></div><div className="flex items-center gap-1"><select value={milestone.status} onChange={event => onUpdateMilestoneStatus(milestone.id, event.target.value as WorkspaceViewData["roadmap"][number]["status"])} className={`rounded-lg border-0 px-2 py-1 text-[10px] font-bold uppercase ${statusTone[milestone.status]}`}><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="done">Done</option><option value="blocked">Blocked</option></select><Button type="button" variant="ghost" size="icon" onClick={() => onDeleteMilestone(milestone.id)} aria-label={`Delete ${milestone.title}`} className="h-7 w-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button></div></div></li>)}
          {!data.roadmap.length ? <li className="text-xs text-slate-500">No milestones yet.</li> : null}
        </ol>
        <form onSubmit={addMilestone} className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]"><input value={milestoneTitle} onChange={event => setMilestoneTitle(event.target.value)} placeholder="Add milestone" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={milestoneDate} onChange={event => setMilestoneDate(event.target.value)} type="date" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={isWorking} className="rounded-xl bg-slate-950 px-3 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add</Button></form>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-emerald-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Scenario comparison</h3></div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-full text-left text-xs"><thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Scenario</th><th className="px-3 py-2">Funding</th><th className="px-3 py-2">Valuation</th><th className="px-3 py-2">Runway</th><th className="px-2 py-2"><span className="sr-only">Delete</span></th></tr></thead><tbody>{data.scenarios.map(scenario => <tr key={scenario.id} className="border-t border-slate-100 text-slate-700"><td className="px-3 py-3 font-semibold">{scenario.name}</td><td className="px-3 py-3">{formatMoney(scenario.fundingAmount)}</td><td className="px-3 py-3">{formatMoney(scenario.valuation)}</td><td className="px-3 py-3">{scenario.runwayMonths ?? "—"} mo</td><td className="px-2 py-2"><Button type="button" variant="ghost" size="icon" onClick={() => onDeleteScenario(scenario.id)} aria-label={`Delete ${scenario.name}`} className="h-7 w-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button></td></tr>)}{!data.scenarios.length ? <tr><td colSpan={5} className="px-3 py-5 text-center text-xs text-slate-500">No funding scenarios yet.</td></tr> : null}</tbody></table></div>
        <form onSubmit={addScenario} className="mt-5 grid gap-2 sm:grid-cols-2"><input value={scenarioName} onChange={event => setScenarioName(event.target.value)} placeholder="Scenario name" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={scenarioFunding} onChange={event => setScenarioFunding(event.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="Funding amount" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={scenarioValuation} onChange={event => setScenarioValuation(event.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="Valuation" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={scenarioRunway} onChange={event => setScenarioRunway(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Runway (months)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={isWorking} className="col-span-full rounded-xl bg-slate-950 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add funding scenario</Button></form>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Risk table</h3></div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-full text-left text-xs"><thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Risk</th><th className="px-3 py-2">Severity</th><th className="px-3 py-2">Likelihood</th><th className="px-3 py-2">Mitigation</th><th className="px-2 py-2"><span className="sr-only">Delete</span></th></tr></thead><tbody>{data.riskRegister.map(risk => <tr key={risk.id} className="border-t border-slate-100 align-top text-slate-700"><td className="px-3 py-3 font-semibold">{risk.title}</td><td className="px-3 py-3"><span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">{risk.severity}</span></td><td className="px-3 py-3">{risk.likelihood}</td><td className="max-w-36 px-3 py-3 leading-5 text-slate-500">{risk.mitigationNotes ?? "—"}</td><td className="px-2 py-2"><Button type="button" variant="ghost" size="icon" onClick={() => onDeleteRisk(risk.id)} aria-label={`Delete ${risk.title}`} className="h-7 w-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button></td></tr>)}{!data.riskRegister.length ? <tr><td colSpan={5} className="px-3 py-5 text-center text-xs text-slate-500">No risks logged yet.</td></tr> : null}</tbody></table></div>
        <form onSubmit={addRisk} className="mt-5 grid gap-2"><input value={riskTitle} onChange={event => setRiskTitle(event.target.value)} placeholder="Risk title" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={riskMitigation} onChange={event => setRiskMitigation(event.target.value)} placeholder="Mitigation note (optional)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={isWorking} className="rounded-xl bg-slate-950 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add risk</Button></form>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2"><Siren className="h-4 w-4 text-amber-600" aria-hidden="true" /><h3 className="font-black text-slate-900">Crisis response plan list</h3></div>
        <ul className="mt-5 space-y-3" aria-label="Crisis response plan list">{data.crisisResponsePlans.map(plan => <li key={plan.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{plan.title}</p>{plan.triggerConditions ? <p className="mt-1 text-xs leading-5 text-slate-500">Trigger: {plan.triggerConditions}</p> : null}{plan.responseSteps ? <p className="mt-1 text-xs leading-5 text-slate-500">Response: {plan.responseSteps}</p> : null}<p className="mt-1 text-[11px] text-slate-500">Owner: {plan.owner ?? "Unassigned"}</p></div><Button type="button" variant="ghost" size="icon" onClick={() => onDeleteCrisisPlan(plan.id)} aria-label={`Delete ${plan.title}`} className="h-7 w-7 shrink-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button></div></li>)}{!data.crisisResponsePlans.length ? <li className="text-xs text-slate-500">No crisis plans yet.</li> : null}</ul>
        <form onSubmit={addCrisisPlan} className="mt-5 grid gap-2"><input value={crisisTitle} onChange={event => setCrisisTitle(event.target.value)} placeholder="Crisis plan title" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={crisisTrigger} onChange={event => setCrisisTrigger(event.target.value)} placeholder="Trigger condition" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><input value={crisisOwner} onChange={event => setCrisisOwner(event.target.value)} placeholder="Owner" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none" /><Button type="submit" disabled={isWorking} className="rounded-xl bg-slate-950 text-xs text-white"><Plus className="h-3.5 w-3.5" aria-hidden="true" />Add crisis plan</Button></form>
      </article>
    </div>
  );
}
