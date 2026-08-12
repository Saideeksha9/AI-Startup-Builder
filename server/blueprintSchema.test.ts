import { describe, expect, it } from "vitest";
import { blueprintRequestSchema, startupBlueprintSchema } from "./blueprintSchema";

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

describe("startup blueprint schemas", () => {
  it("accepts a complete blueprint with the required structure", () => {
    expect(startupBlueprintSchema.safeParse(validBlueprint).success).toBe(true);
  });

  it("rejects unexpected fields to preserve the strict response contract", () => {
    expect(
      startupBlueprintSchema.safeParse({ ...validBlueprint, extraField: "not allowed" }).success,
    ).toBe(false);
  });

  it("requires a substantive startup idea", () => {
    expect(blueprintRequestSchema.safeParse({ idea: "too short" }).success).toBe(false);
    expect(
      blueprintRequestSchema.safeParse({ idea: "A platform for independent clinics" }).success,
    ).toBe(true);
  });
});
