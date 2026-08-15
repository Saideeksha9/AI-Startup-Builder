import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createLandingLead, getSavedBlueprintPublic } from "../db";
import { startupBlueprintSchema } from "../blueprintSchema";
import { notifyOwner } from "../_core/notification";
import { publicProcedure, router } from "../_core/trpc";

const savedLandingInput = z.object({ savedBlueprintId: z.number().int().positive() });
const leadInput = savedLandingInput.extend({
  visitorName: z.string().trim().min(2).max(160),
  visitorEmail: z.string().trim().email().max(320),
  companyName: z.string().trim().max(160).nullable().optional(),
  message: z.string().trim().max(1000).nullable().optional(),
});

export const landingRouter = router({
  getPublic: publicProcedure.input(savedLandingInput).query(async ({ input }) => {
    const saved = await getSavedBlueprintPublic(input.savedBlueprintId);
    if (!saved) throw new TRPCError({ code: "NOT_FOUND", message: "This landing page is unavailable." });
    const blueprint = startupBlueprintSchema.parse(JSON.parse(saved.blueprint));
    return { savedBlueprintId: saved.id, startupName: blueprint.startupName, landingPage: blueprint.landingPage };
  }),
  submitLead: publicProcedure.input(leadInput).mutation(async ({ input }) => {
    const saved = await getSavedBlueprintPublic(input.savedBlueprintId);
    if (!saved) throw new TRPCError({ code: "NOT_FOUND", message: "This landing page is unavailable." });
    const blueprint = startupBlueprintSchema.parse(JSON.parse(saved.blueprint));
    const id = await createLandingLead({
      userId: saved.userId,
      savedBlueprintId: saved.id,
      visitorName: input.visitorName,
      visitorEmail: input.visitorEmail,
      companyName: input.companyName || null,
      message: input.message || null,
    });
    const notificationDelivered = await notifyOwner({
      title: `New landing lead for ${blueprint.startupName}`,
      content: `${input.visitorName} (${input.visitorEmail}) submitted the landing-page CTA for ${blueprint.startupName}.${input.companyName ? ` Company: ${input.companyName}.` : ""}${input.message ? ` Message: ${input.message}` : ""}`,
    });
    return { id, notificationDelivered };
  }),
});
