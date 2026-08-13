import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createCrisisPlan,
  createInvestmentScenario,
  createMilestone,
  createRisk,
  deleteCrisisPlan,
  deleteInvestmentScenario,
  deleteMilestone,
  deleteRisk,
  getVentureWorkspace,
  updateCrisisPlan,
  updateInvestmentScenario,
  updateMilestone,
  updateMilestoneStatus,
  updateRisk,
} from "../db";
import { startupBlueprintSchema } from "../blueprintSchema";
import { protectedProcedure, router } from "../_core/trpc";

const ventureIdSchema = z.object({ savedBlueprintId: z.number().int().positive() });
const recordIdSchema = ventureIdSchema.extend({ id: z.number().int().positive() });
const milestoneStatusSchema = z.enum(["planned", "in_progress", "done", "blocked"]);

async function workspaceOrThrow(userId: number, savedBlueprintId: number) {
  const workspace = await getVentureWorkspace(userId, savedBlueprintId);
  if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "This startup was not found." });
  return workspace;
}

export const workspaceRouter = router({
  get: protectedProcedure.input(ventureIdSchema).query(async ({ ctx, input }) => {
    try {
      const workspace = await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
      return { ...workspace, startup: { ...workspace.startup, blueprint: startupBlueprintSchema.parse(JSON.parse(workspace.startup.blueprint)) } };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Loading venture workspace failed", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The venture workspace could not be loaded." });
    }
  }),
  addMilestone: protectedProcedure.input(ventureIdSchema.extend({
    title: z.string().trim().min(3).max(240),
    targetDate: z.string().date().nullable().optional(),
    status: milestoneStatusSchema.optional(),
    dependsOnId: z.number().int().positive().nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    return { id: await createMilestone({ ...input, userId: ctx.user.id }) };
  }),
  updateMilestoneStatus: protectedProcedure.input(ventureIdSchema.extend({ id: z.number().int().positive(), status: milestoneStatusSchema })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await updateMilestoneStatus({ ...input, userId: ctx.user.id });
    return { success: true };
  }),
  addInvestmentScenario: protectedProcedure.input(ventureIdSchema.extend({
    name: z.string().trim().min(3).max(160),
    fundingAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
    valuation: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
    runwayMonths: z.number().int().min(0).max(240).nullable().optional(),
    useOfFunds: z.string().trim().max(4000).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    return { id: await createInvestmentScenario({ ...input, userId: ctx.user.id }) };
  }),
  addRisk: protectedProcedure.input(ventureIdSchema.extend({
    title: z.string().trim().min(3).max(240),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    likelihood: z.enum(["low", "medium", "high"]).optional(),
    mitigationNotes: z.string().trim().max(4000).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    return { id: await createRisk({ ...input, userId: ctx.user.id }) };
  }),
  addCrisisPlan: protectedProcedure.input(ventureIdSchema.extend({
    riskId: z.number().int().positive().nullable().optional(),
    title: z.string().trim().min(3).max(240),
    triggerConditions: z.string().trim().max(4000).nullable().optional(),
    responseSteps: z.string().trim().max(4000).nullable().optional(),
    owner: z.string().trim().max(160).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    return { id: await createCrisisPlan({ ...input, userId: ctx.user.id }) };
  }),
  updateMilestone: protectedProcedure.input(recordIdSchema.extend({
    title: z.string().trim().min(3).max(240).optional(),
    targetDate: z.string().date().nullable().optional(),
    status: milestoneStatusSchema.optional(),
    dependsOnId: z.number().int().positive().nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await updateMilestone({ ...input, userId: ctx.user.id });
    return { success: true };
  }),
  deleteMilestone: protectedProcedure.input(recordIdSchema).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await deleteMilestone(ctx.user.id, input.savedBlueprintId, input.id);
    return { success: true };
  }),
  updateInvestmentScenario: protectedProcedure.input(recordIdSchema.extend({
    name: z.string().trim().min(3).max(160).optional(),
    fundingAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
    valuation: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
    runwayMonths: z.number().int().min(0).max(240).nullable().optional(),
    useOfFunds: z.string().trim().max(4000).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await updateInvestmentScenario({ ...input, userId: ctx.user.id });
    return { success: true };
  }),
  deleteInvestmentScenario: protectedProcedure.input(recordIdSchema).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await deleteInvestmentScenario(ctx.user.id, input.savedBlueprintId, input.id);
    return { success: true };
  }),
  updateRisk: protectedProcedure.input(recordIdSchema.extend({
    title: z.string().trim().min(3).max(240).optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    likelihood: z.enum(["low", "medium", "high"]).optional(),
    mitigationNotes: z.string().trim().max(4000).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await updateRisk({ ...input, userId: ctx.user.id });
    return { success: true };
  }),
  deleteRisk: protectedProcedure.input(recordIdSchema).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await deleteRisk(ctx.user.id, input.savedBlueprintId, input.id);
    return { success: true };
  }),
  updateCrisisPlan: protectedProcedure.input(recordIdSchema.extend({
    riskId: z.number().int().positive().nullable().optional(),
    title: z.string().trim().min(3).max(240).optional(),
    triggerConditions: z.string().trim().max(4000).nullable().optional(),
    responseSteps: z.string().trim().max(4000).nullable().optional(),
    owner: z.string().trim().max(160).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await updateCrisisPlan({ ...input, userId: ctx.user.id });
    return { success: true };
  }),
  deleteCrisisPlan: protectedProcedure.input(recordIdSchema).mutation(async ({ ctx, input }) => {
    await workspaceOrThrow(ctx.user.id, input.savedBlueprintId);
    await deleteCrisisPlan(ctx.user.id, input.savedBlueprintId, input.id);
    return { success: true };
  }),
});
