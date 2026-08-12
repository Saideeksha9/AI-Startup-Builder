import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  createSavedBlueprint: vi.fn(),
  listSavedBlueprints: vi.fn(),
}));

import { createSavedBlueprint, listSavedBlueprints } from "./db";
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
