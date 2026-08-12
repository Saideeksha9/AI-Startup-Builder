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
