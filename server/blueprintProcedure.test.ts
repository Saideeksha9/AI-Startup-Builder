import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
import { blueprintRouter } from "./routers/blueprint";

const validBlueprint = {
  startupName: "CareLoop",
  tagline: "Simpler compliance for independent clinics.",
  targetAudience: "Operations leaders at independent outpatient clinics handling recurring compliance work with lean teams.",
  businessModel: [
    "Tiered monthly SaaS subscriptions priced by clinic location.",
    "Usage-based add-ons for automated evidence collection.",
    "Annual implementation packages for multi-site clinic groups.",
  ],
  competitors: ["Vanta", "Drata", "MedTrainer"],
  marketingPlan: [
    "Interview clinic administrators to validate the highest-friction compliance workflow.",
    "Publish compliance workflow templates in healthcare operations communities.",
    "Partner with specialised healthcare IT consultants for qualified referrals.",
    "Run targeted demos for regional clinic networks using a time-saved calculator.",
  ],
  landingPage: {
    heroHeadline: "Make clinic compliance work feel manageable.",
    heroSubheadline: "CareLoop organises tasks, evidence, and deadlines so lean clinic teams can stay audit-ready without endless spreadsheets.",
    ctaButtonText: "See your workflow",
    features: [
      {
        title: "One source of truth",
        description: "Keep every policy, task, owner, and proof point in a single organised workspace.",
      },
      {
        title: "Deadline clarity",
        description: "Turn recurring requirements into visible, accountable workflows that teams can complete on time.",
      },
      {
        title: "Audit-ready evidence",
        description: "Collect and retrieve the documentation you need without rebuilding the trail from scratch.",
      },
    ],
  },
  ventureWorkspace: {
    detailedActionPlan: [
      { phase: "Validate", objective: "Confirm that clinic teams will pay for a simpler recurring compliance workflow.", actions: ["Interview ten clinic operations leaders about recurring compliance work.", "Test a focused pilot offer with qualified independent clinics."], whyItMatters: "This avoids building a workflow that does not address a painful and urgent customer problem." },
      { phase: "Pilot", objective: "Run a measured pilot with early clinic partners before widening scope.", actions: ["Recruit two clinics with active compliance deadlines.", "Track time saved and workflow completion during the pilot."], whyItMatters: "Measured pilot evidence makes the next product and sales decision more reliable." },
      { phase: "Launch", objective: "Create a repeatable early customer acquisition process from pilot outcomes.", actions: ["Turn the pilot outcome into a clear customer case study.", "Run targeted outreach to similar independent clinic operators."], whyItMatters: "A repeatable acquisition process is necessary before increasing spending." },
      { phase: "Improve", objective: "Improve activation and retention using evidence from real users.", actions: ["Review onboarding friction with every pilot customer.", "Prioritise the most repeated customer workflow request."], whyItMatters: "Retention signals whether the product is creating durable value." },
    ],
    initialMilestones: [
      { title: "Complete ten clinic discovery interviews", targetOffsetDays: 14, objective: "Validate the highest-friction compliance workflow." },
      { title: "Recruit two qualified pilot clinics", targetOffsetDays: 30, objective: "Secure hands-on early users for the initial workflow." },
      { title: "Launch the first workflow pilot", targetOffsetDays: 45, objective: "Measure time saved and completion outcomes." },
      { title: "Review pilot evidence and iterate", targetOffsetDays: 60, objective: "Use adoption evidence to set the next roadmap." },
    ],
    investmentScenarios: [
      { name: "Bootstrap pilot", fundingAmount: "0", valuation: "0", runwayMonths: 6, useOfFunds: "Founder time, customer interviews, and a focused pilot implementation." },
      { name: "Pre-seed validation", fundingAmount: "500000", valuation: "4000000", runwayMonths: 18, useOfFunds: "Product engineering, customer onboarding, and targeted healthcare sales." },
    ],
    risks: [
      { title: "Teams may resist changing established compliance habits", severity: "high", likelihood: "medium", mitigationNotes: "Start with a narrow workflow and quantify time saved during pilots." },
      { title: "Sensitive data may create security concerns", severity: "high", likelihood: "medium", mitigationNotes: "Use least-privilege access and validate buyer requirements early." },
      { title: "Healthcare procurement may slow sales", severity: "medium", likelihood: "high", mitigationNotes: "Target independent clinics and use short paid pilots to reduce friction." },
    ],
    crisisPlans: [
      { title: "Respond to a critical workflow outage", triggerConditions: "A clinic cannot access a workflow near a reporting deadline.", responseSteps: "Acknowledge the issue, activate fallback guidance, restore access, and document the incident review.", owner: "Operations lead" },
      { title: "Respond to a customer data concern", triggerConditions: "A customer reports suspected unauthorised data access.", responseSteps: "Contain access, investigate the scope, and provide a documented customer update.", owner: "Security lead" },
    ],
  },
};

describe("blueprint.generate", () => {
  const caller = blueprintRouter.createCaller({} as never);
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  it("returns the parsed and validated structured blueprint", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validBlueprint) } }],
    } as never);

    await expect(
      caller.generate({ idea: "A platform that makes recurring clinic compliance easier for lean teams." }),
    ).resolves.toEqual(validBlueprint);

    expect(invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        response_format: expect.objectContaining({
          type: "json_schema",
        }),
      }),
    );
  });

  it("returns a safe internal error when the LLM response is unavailable", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({ choices: [] } as never);

    await expect(
      caller.generate({ idea: "A platform that makes recurring clinic compliance easier for lean teams." }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "We could not generate a startup blueprint. Please try again.",
    });
  });
});
