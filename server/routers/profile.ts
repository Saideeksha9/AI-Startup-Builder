import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getFounderOnboarding, getUserProfile, listSavedBlueprints, upsertFounderOnboarding, upsertUserProfile } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const onboardingStepSchema = z.enum(["review_profile", "save_first_venture", "review_workspace", "ask_advisor"]);
const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();

function parseSteps(value: string | null | undefined) {
  try {
    const parsed = JSON.parse(value ?? "[]");
    return z.array(onboardingStepSchema).parse(Array.isArray(parsed) ? Array.from(new Set(parsed)) : []);
  } catch {
    return [] as Array<z.infer<typeof onboardingStepSchema>>;
  }
}

export const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [profile, onboarding, savedVentures] = await Promise.all([
        getUserProfile(ctx.user.id),
        getFounderOnboarding(ctx.user.id),
        listSavedBlueprints(ctx.user.id),
      ]);
      return {
        account: { name: ctx.user.name ?? null, email: ctx.user.email ?? null },
        profile: profile ?? {
          fullName: ctx.user.name ?? null,
          jobTitle: null,
          companyName: null,
          preferredFocus: null,
          weeklyDigest: true,
          onboardingEmailTips: true,
        },
        onboarding: {
          completedSteps: parseSteps(onboarding?.completedSteps),
          dismissed: onboarding?.dismissed ?? false,
          savedVentureCount: savedVentures.length,
        },
      };
    } catch (error) {
      console.error("Loading profile settings failed", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Profile settings could not be loaded." });
    }
  }),
  update: protectedProcedure.input(z.object({
    fullName: nullableText(160),
    jobTitle: nullableText(160),
    companyName: nullableText(160),
    preferredFocus: nullableText(120),
    weeklyDigest: z.boolean(),
    onboardingEmailTips: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    await upsertUserProfile({
      userId: ctx.user.id,
      fullName: input.fullName || null,
      jobTitle: input.jobTitle || null,
      companyName: input.companyName || null,
      preferredFocus: input.preferredFocus || null,
      weeklyDigest: input.weeklyDigest,
      onboardingEmailTips: input.onboardingEmailTips,
    });
    return { success: true } as const;
  }),
  updateOnboarding: protectedProcedure.input(z.object({
    completedSteps: z.array(onboardingStepSchema).max(4),
    dismissed: z.boolean(),
  })).mutation(async ({ ctx, input }) => {
    await upsertFounderOnboarding({
      userId: ctx.user.id,
      completedSteps: JSON.stringify(Array.from(new Set(input.completedSteps))),
      dismissed: input.dismissed,
    });
    return { success: true } as const;
  }),
});
