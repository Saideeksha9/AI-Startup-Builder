import { describe, expect, it } from "vitest";
import { buildVentureWorkspaceMarkdown, ventureExportFileName } from "./ventureExport";

const workspace = {
  startup: {
    idea: "A focused workspace for clinic compliance teams.",
    blueprint: {
      startupName: "CareLoop AI",
      tagline: "Compliance clarity for lean clinics.",
      targetAudience: "Independent clinics with recurring compliance obligations.",
      businessModel: ["Tiered SaaS subscriptions for clinics."],
      competitors: ["Vanta"],
      marketingPlan: ["Interview ten clinic operations leaders."],
      landingPage: {
        heroHeadline: "Make compliance manageable.",
        heroSubheadline: "Keep every workflow and evidence trail organised.",
        ctaButtonText: "See your workflow",
        features: [{ title: "One source of truth", description: "Keep tasks and proof together." }],
      },
      ventureWorkspace: {
        detailedActionPlan: [{ phase: "Validate", objective: "Confirm a painful workflow.", actions: ["Interview ten clinic leaders."], whyItMatters: "Early evidence prevents wasted product work." }],
      },
    },
  },
  roadmap: [{ title: "Complete discovery interviews", targetDate: "2026-09-01", status: "planned" }],
  scenarios: [{ name: "Bootstrap", fundingAmount: "0", valuation: "0", runwayMonths: 6, useOfFunds: "Founder-led interviews and pilots." }],
  riskRegister: [{ title: "Slow procurement", severity: "high", likelihood: "medium", mitigationNotes: "Start with short paid pilots." }],
  crisisResponsePlans: [{ title: "Workflow outage", triggerConditions: "Customers cannot access a deadline-critical workflow.", responseSteps: "Acknowledge, activate fallback guidance, restore access, and review.", owner: "Operations lead" }],
  notes: [{ title: "Interview evidence", topic: "Customer research", content: "Teams struggle to find audit evidence.", referenceUrl: "https://example.com/research" }],
  advisorMessages: [{ role: "assistant" as const, content: "Start with the repeated pain point from discovery interviews.", createdAt: "2026-08-14" }],
};

describe("venture workspace export", () => {
  it("formats the complete startup blueprint and workspace records as Markdown", () => {
    const markdown = buildVentureWorkspaceMarkdown(workspace, new Date("2026-08-14T00:00:00.000Z"));

    expect(markdown).toContain("# CareLoop AI — Venture Workspace");
    expect(markdown).toContain("## Step-by-step launch guide");
    expect(markdown).toContain("## Milestone roadmap");
    expect(markdown).toContain("## Investment scenarios");
    expect(markdown).toContain("## Risk register");
    expect(markdown).toContain("## Crisis response plans");
    expect(markdown).toContain("## Venture notes");
    expect(markdown).toContain("## Venture Advisor conversation");
    expect(markdown).toContain("https://example.com/research");
  });

  it("creates a safe, predictable workspace export filename", () => {
    expect(ventureExportFileName("CareLoop AI!", "pdf", new Date("2026-08-14T00:00:00.000Z"))).toBe("careloop-ai-workspace-2026-08-14.pdf");
  });
});
