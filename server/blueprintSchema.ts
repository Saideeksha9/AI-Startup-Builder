import { z } from "zod";

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
