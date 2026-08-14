export type VentureExportWorkspace = {
  startup: {
    idea: string;
    blueprint: {
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
        detailedActionPlan?: Array<{ phase: string; objective: string; actions: string[]; whyItMatters: string }>;
      };
    };
  };
  roadmap: Array<{ title: string; targetDate: Date | string | null; status: string | null }>;
  scenarios: Array<{ name: string; fundingAmount: string | null; valuation: string | null; runwayMonths: number | null; useOfFunds: string | null }>;
  riskRegister: Array<{ title: string; severity: string | null; likelihood: string | null; mitigationNotes: string | null }>;
  crisisResponsePlans: Array<{ title: string; triggerConditions: string | null; responseSteps: string | null; owner: string | null }>;
  notes: Array<{ title: string; topic: string | null; content: string; referenceUrl: string | null; createdAt?: Date | string | null }>;
  advisorMessages: Array<{ role: "user" | "assistant"; content: string; createdAt?: Date | string | null }>;
};

function markdownText(value: string | null | undefined, fallback = "Not specified") {
  return value?.trim() || fallback;
}

function markdownList(items: string[], emptyText: string) {
  return items.length ? items.map(item => `- ${item}`).join("\n") : `- ${emptyText}`;
}

function readableDate(value: Date | string | null | undefined) {
  if (!value) return "No target date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No target date" : date.toLocaleDateString();
}

function documentDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function ventureExportFileName(startupName: string, extension: "md" | "pdf", exportedAt = new Date()) {
  const slug = startupName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "venture";
  return `${slug}-workspace-${documentDate(exportedAt)}.${extension}`;
}

export function buildVentureWorkspaceMarkdown(workspace: VentureExportWorkspace, exportedAt = new Date()) {
  const blueprint = workspace.startup.blueprint;
  const actionPlan = blueprint.ventureWorkspace?.detailedActionPlan ?? [];
  const lines = [
    `# ${blueprint.startupName} — Venture Workspace`,
    "",
    `> Private workspace export generated on ${exportedAt.toLocaleDateString()}. Investment scenarios are planning assumptions, not financial advice.`,
    "",
    "## Startup blueprint",
    "",
    `**Tagline:** ${blueprint.tagline}`,
    "",
    `**Original idea:** ${workspace.startup.idea}`,
    "",
    `**Target audience:** ${blueprint.targetAudience}`,
    "",
    "### Business model",
    markdownList(blueprint.businessModel, "No business model items have been recorded."),
    "",
    "### Competitors",
    markdownList(blueprint.competitors, "No competitors have been recorded."),
    "",
    "### Marketing plan",
    markdownList(blueprint.marketingPlan, "No marketing actions have been recorded."),
    "",
    "## Generated landing page",
    "",
    `**Headline:** ${blueprint.landingPage.heroHeadline}`,
    "",
    blueprint.landingPage.heroSubheadline,
    "",
    `**Call to action:** ${blueprint.landingPage.ctaButtonText}`,
    "",
    "### Features",
    ...(blueprint.landingPage.features.length
      ? blueprint.landingPage.features.flatMap(feature => [`- **${feature.title}:** ${feature.description}`])
      : ["- No landing-page features have been recorded."]),
    "",
    "## Step-by-step launch guide",
    "",
    ...(actionPlan.length
      ? actionPlan.flatMap((phase, index) => [
        `### ${index + 1}. ${phase.phase}`,
        "",
        `**Objective:** ${phase.objective}`,
        "",
        ...phase.actions.map((action, actionIndex) => `${actionIndex + 1}. ${action}`),
        "",
        `**Why this matters:** ${phase.whyItMatters}`,
        "",
      ])
      : ["No generated launch guide is available yet.", ""]),
    "## Milestone roadmap",
    "",
    ...(workspace.roadmap.length
      ? workspace.roadmap.flatMap(milestone => [`- **${milestone.title}** — ${markdownText(milestone.status, "planned")} · ${readableDate(milestone.targetDate)}`])
      : ["- No milestones have been recorded."]),
    "",
    "## Investment scenarios",
    "",
    ...(workspace.scenarios.length
      ? workspace.scenarios.flatMap(scenario => [
        `### ${scenario.name}`,
        "",
        `- **Funding:** ${markdownText(scenario.fundingAmount)}`,
        `- **Valuation:** ${markdownText(scenario.valuation)}`,
        `- **Runway:** ${scenario.runwayMonths ?? "Not specified"} months`,
        `- **Use of funds:** ${markdownText(scenario.useOfFunds)}`,
        "",
      ])
      : ["No funding scenarios have been recorded.", ""]),
    "## Risk register",
    "",
    ...(workspace.riskRegister.length
      ? workspace.riskRegister.flatMap(risk => [
        `### ${risk.title}`,
        "",
        `- **Severity:** ${markdownText(risk.severity)}`,
        `- **Likelihood:** ${markdownText(risk.likelihood)}`,
        `- **Mitigation:** ${markdownText(risk.mitigationNotes)}`,
        "",
      ])
      : ["No risks have been recorded.", ""]),
    "## Crisis response plans",
    "",
    ...(workspace.crisisResponsePlans.length
      ? workspace.crisisResponsePlans.flatMap(plan => [
        `### ${plan.title}`,
        "",
        `- **Trigger conditions:** ${markdownText(plan.triggerConditions)}`,
        `- **Response steps:** ${markdownText(plan.responseSteps)}`,
        `- **Owner:** ${markdownText(plan.owner, "Unassigned")}`,
        "",
      ])
      : ["No crisis plans have been recorded.", ""]),
    "## Venture notes",
    "",
    ...(workspace.notes.length
      ? workspace.notes.flatMap(note => [
        `### ${note.title}`,
        "",
        `**Topic:** ${markdownText(note.topic)}`,
        "",
        note.content,
        "",
        ...(note.referenceUrl ? [`**Reference:** ${note.referenceUrl}`, ""] : []),
      ])
      : ["No venture notes have been recorded.", ""]),
    "## Venture Advisor conversation",
    "",
    ...(workspace.advisorMessages.length
      ? workspace.advisorMessages.flatMap(message => [
        `### ${message.role === "assistant" ? "Advisor" : "Founder"}${message.createdAt ? ` · ${readableDate(message.createdAt)}` : ""}`,
        "",
        message.content,
        "",
      ])
      : ["No advisor messages have been recorded for this startup.", ""]),
  ];

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function triggerDownload(content: BlobPart, filename: string, mimeType: string) {
  const href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

export function downloadVentureWorkspaceMarkdown(workspace: VentureExportWorkspace) {
  triggerDownload(
    buildVentureWorkspaceMarkdown(workspace),
    ventureExportFileName(workspace.startup.blueprint.startupName, "md"),
    "text/markdown;charset=utf-8",
  );
}

function pdfLineStyle(line: string) {
  if (line.startsWith("# ")) return { text: line.slice(2), size: 18, weight: "bold" as const, gap: 12 };
  if (line.startsWith("## ")) return { text: line.slice(3), size: 13, weight: "bold" as const, gap: 9 };
  if (line.startsWith("### ")) return { text: line.slice(4), size: 11, weight: "bold" as const, gap: 7 };
  if (line.startsWith("> ")) return { text: line.slice(2), size: 9, weight: "italic" as const, gap: 6 };
  return { text: line.replace(/^- /, "• ").replace(/\*\*/g, ""), size: 9.5, weight: "normal" as const, gap: 4 };
}

export async function downloadVentureWorkspacePdf(workspace: VentureExportWorkspace) {
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  for (const rawLine of buildVentureWorkspaceMarkdown(workspace).split("\n")) {
    if (!rawLine.trim()) {
      cursorY += 5;
      continue;
    }
    const style = pdfLineStyle(rawLine);
    document.setFont("helvetica", style.weight);
    document.setFontSize(style.size);
    const wrapped = document.splitTextToSize(style.text, contentWidth) as string[];
    const lineHeight = style.size * 1.35;
    if (cursorY + wrapped.length * lineHeight + style.gap > pageHeight - margin) {
      document.addPage();
      cursorY = margin;
    }
    document.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * lineHeight + style.gap;
  }

  document.save(ventureExportFileName(workspace.startup.blueprint.startupName, "pdf"));
}
