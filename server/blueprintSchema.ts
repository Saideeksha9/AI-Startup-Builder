import { z } from "zod";

const emptyVentureWorkspace = {
  detailedActionPlan: [],
  initialMilestones: [],
  investmentScenarios: [],
  risks: [],
  crisisPlans: [],
};

export const ventureWorkspaceRecommendationSchema = z.object({
  detailedActionPlan: z.array(z.object({
    phase: z.string().min(3).max(80),
    objective: z.string().min(20).max(280),
    actions: z.array(z.string().min(12).max(260)).min(2).max(4),
    whyItMatters: z.string().min(20).max(240),
  }).strict()).min(4).max(6),
  initialMilestones: z.array(z.object({
    title: z.string().min(5).max(200),
    targetOffsetDays: z.number().int().min(1).max(180),
    objective: z.string().min(15).max(240),
  }).strict()).min(4).max(6),
  investmentScenarios: z.array(z.object({
    name: z.string().min(4).max(120),
    fundingAmount: z.string().min(1).max(40),
    valuation: z.string().min(1).max(40),
    runwayMonths: z.number().int().min(1).max(60),
    useOfFunds: z.string().min(20).max(240),
  }).strict()).min(2).max(3),
  risks: z.array(z.object({
    title: z.string().min(5).max(200),
    severity: z.enum(["low", "medium", "high", "critical"]),
    likelihood: z.enum(["low", "medium", "high"]),
    mitigationNotes: z.string().min(20).max(320),
  }).strict()).min(3).max(5),
  crisisPlans: z.array(z.object({
    title: z.string().min(5).max(200),
    triggerConditions: z.string().min(15).max(300),
    responseSteps: z.string().min(20).max(400),
    owner: z.string().min(3).max(100),
  }).strict()).min(2).max(4),
}).strict();

export const startupBlueprintSchema = z
  .object({
    startupName: z.string().min(2).max(60),
    tagline: z.string().min(8).max(140),
    targetAudience: z.string().min(20).max(320),
    businessModel: z.array(z.string().min(10).max(240)).min(3).max(5),
    competitors: z.array(z.string().min(2).max(80)).min(3).max(5),
    marketingPlan: z.array(z.string().min(10).max(260)).min(4).max(6),
      landingPage: z
      .object({
        heroHeadline: z.string().min(10).max(120),
        heroSubheadline: z.string().min(20).max(240),
        ctaButtonText: z.string().min(2).max(40),
        features: z
          .array(
            z
              .object({
                title: z.string().min(3).max(60),
                description: z.string().min(15).max(220),
              })
              .strict(),
          )
          .length(3),
      })
      .strict(),
    ventureWorkspace: ventureWorkspaceRecommendationSchema.default(emptyVentureWorkspace),
  })
  .strict();

export const blueprintRequestSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(10, "Please describe your startup idea in at least 10 characters.")
    .max(2_000, "Please keep your startup idea under 2,000 characters."),
});

export type StartupBlueprint = z.infer<typeof startupBlueprintSchema>;
