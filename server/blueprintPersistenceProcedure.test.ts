import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  createCrisisPlan: vi.fn(),
  createInvestmentScenario: vi.fn(),
  createMilestone: vi.fn(),
  createRisk: vi.fn(),
  createSavedBlueprint: vi.fn(),
  listSavedBlueprints: vi.fn(),
}));

import { createCrisisPlan, createInvestmentScenario, createMilestone, createRisk, createSavedBlueprint, listSavedBlueprints } from "./db";
import { blueprintRouter } from "./routers/blueprint";

const blueprint = {
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
      { phase: "Validate", objective: "Confirm that clinic teams will pay for a simpler compliance workflow.", actions: ["Interview ten operations leaders about current compliance work.", "Test a clear value proposition with prospective customers."], whyItMatters: "Early validation avoids building a workflow that does not solve a painful enough problem." },
      { phase: "Pilot", objective: "Run a small pilot with selected clinics and collect evidence of time saved.", actions: ["Recruit two pilot clinics with active compliance deadlines.", "Track time saved and completion rates for each workflow."], whyItMatters: "Pilot evidence gives the founder a credible basis for product and sales decisions." },
      { phase: "Launch", objective: "Turn the pilot into a repeatable early customer acquisition process.", actions: ["Package the pilot outcome into a simple sales story.", "Run weekly outreach to similar independent clinics."], whyItMatters: "A repeatable motion is needed before increasing product or marketing spend." },
      { phase: "Improve", objective: "Use customer feedback to improve activation and retention.", actions: ["Review onboarding drop-off with each pilot customer.", "Prioritise the most repeated workflow request."], whyItMatters: "Retention signals whether the product creates durable value." },
    ],
    initialMilestones: [
      { title: "Complete ten clinic compliance discovery interviews", targetOffsetDays: 14, objective: "Validate the most painful recurring compliance workflow." },
      { title: "Recruit two early pilot clinic partners", targetOffsetDays: 30, objective: "Secure hands-on users for the first workflow pilot." },
      { title: "Launch the first compliance workflow pilot", targetOffsetDays: 45, objective: "Measure time saved and completion outcomes." },
      { title: "Review pilot evidence and decide the next iteration", targetOffsetDays: 60, objective: "Use real adoption evidence to set the product roadmap." },
    ],
    investmentScenarios: [
      { name: "Bootstrap pilot", fundingAmount: "0", valuation: "0", runwayMonths: 6, useOfFunds: "Founder time, targeted customer interviews, and pilot implementation." },
      { name: "Pre-seed validation", fundingAmount: "$500,000", valuation: "$4,000,000", runwayMonths: 18, useOfFunds: "Product engineering, customer onboarding, and targeted healthcare sales." },
    ],
    risks: [
      { title: "Clinic teams may not change established compliance habits", severity: "high", likelihood: "medium", mitigationNotes: "Start with one recurring workflow and quantify time saved during pilots." },
      { title: "Sensitive compliance data may introduce security concerns", severity: "high", likelihood: "medium", mitigationNotes: "Use least-privilege access, document handling policies, and validate buyer requirements early." },
      { title: "Long healthcare procurement cycles may slow sales", severity: "medium", likelihood: "high", mitigationNotes: "Target independent clinics first and use short paid pilots to reduce purchasing friction." },
    ],
    crisisPlans: [
      { title: "Respond to a critical workflow outage", triggerConditions: "A clinic cannot access a compliance workflow near a reporting deadline.", responseSteps: "Acknowledge the issue, activate fallback guidance, restore access, and document the incident review.", owner: "Operations lead" },
      { title: "Respond to a customer data concern", triggerConditions: "A customer reports suspected unauthorised access or data handling concerns.", responseSteps: "Contain access, notify the designated owner, investigate the scope, and provide a documented customer update.", owner: "Security lead" },
    ],
  },
};

function authenticatedCaller() {
  return blueprintRouter.createCaller({ user: { id: 42 } } as never);
}

describe("blueprint persistence procedures", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  it("saves a validated blueprint against the authenticated user", async () => {
    vi.mocked(createSavedBlueprint).mockResolvedValue(11);

    await expect(
      authenticatedCaller().save({
        idea: "A platform that makes recurring clinic compliance easier for lean teams.",
        blueprint,
      }),
    ).resolves.toEqual({ id: 11 });

    expect(createSavedBlueprint).toHaveBeenCalledWith({
      userId: 42,
      idea: "A platform that makes recurring clinic compliance easier for lean teams.",
      blueprint: JSON.stringify(blueprint),
    });
    expect(createMilestone).toHaveBeenCalledTimes(4);
    expect(createInvestmentScenario).toHaveBeenCalledTimes(2);
    expect(createInvestmentScenario).toHaveBeenCalledWith(expect.objectContaining({
      name: "Pre-seed validation",
      fundingAmount: "500000",
      valuation: "4000000",
    }));
    expect(createRisk).toHaveBeenCalledTimes(3);
    expect(createCrisisPlan).toHaveBeenCalledTimes(2);
  });

  it("returns a safe error when the database cannot save a blueprint", async () => {
    vi.mocked(createSavedBlueprint).mockRejectedValue(new Error("Database is unavailable."));

    await expect(
      authenticatedCaller().save({
        idea: "A platform that makes recurring clinic compliance easier for lean teams.",
        blueprint,
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "We could not save this blueprint. Please try again.",
    });
  });

  it("returns only the current user’s stored blueprints after validating their JSON", async () => {
    const createdAt = new Date("2026-08-12T00:00:00.000Z");
    vi.mocked(listSavedBlueprints).mockResolvedValue([
      {
        id: 11,
        userId: 42,
        idea: "A platform that makes recurring clinic compliance easier for lean teams.",
        blueprint: JSON.stringify(blueprint),
        createdAt,
      },
    ] as never);

    await expect(authenticatedCaller().list()).resolves.toEqual([
      {
        id: 11,
        idea: "A platform that makes recurring clinic compliance easier for lean teams.",
        blueprint,
        createdAt,
      },
    ]);

    expect(listSavedBlueprints).toHaveBeenCalledWith(42);
  });

  it("returns a safe error when saved history cannot be retrieved from the database", async () => {
    vi.mocked(listSavedBlueprints).mockRejectedValue(new Error("Database is unavailable."));

    await expect(authenticatedCaller().list()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "We could not load your saved blueprints. Please try again.",
    });
  });

  it("rejects persistence requests that do not have an authenticated user", async () => {
    const unauthenticatedCaller = blueprintRouter.createCaller({ user: null } as never);

    await expect(unauthenticatedCaller.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
