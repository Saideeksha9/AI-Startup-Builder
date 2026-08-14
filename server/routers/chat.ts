import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  clearConversationMessages,
  createChatMessage,
  createCrisisPlan,
  createInvestmentScenario,
  createMilestone,
  createRisk,
  getOrCreateConversation,
  getPortfolioContext,
  getVentureWorkspace,
  listConversationMessages,
  updateCrisisPlan,
  updateInvestmentScenario,
  updateMilestone,
  updateRisk,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

const actionSchema = z.object({
  kind: z.enum(["none", "milestone", "risk", "investment_scenario", "crisis_plan"]).default("none"),
  operation: z.enum(["none", "create", "update"]).default("none"),
  recordId: z.number().int().nullable().default(null),
  title: z.string().nullable().default(null),
  targetDate: z.string().nullable().default(null),
  status: z.enum(["planned", "in_progress", "done", "blocked"]).nullable().default(null),
  severity: z.enum(["low", "medium", "high", "critical"]).nullable().default(null),
  likelihood: z.enum(["low", "medium", "high"]).nullable().default(null),
  mitigationNotes: z.string().nullable().default(null),
  fundingAmount: z.string().nullable().default(null),
  valuation: z.string().nullable().default(null),
  runwayMonths: z.number().int().nullable().default(null),
  useOfFunds: z.string().nullable().default(null),
  triggerConditions: z.string().nullable().default(null),
  responseSteps: z.string().nullable().default(null),
  owner: z.string().nullable().default(null),
  riskId: z.number().int().nullable().default(null),
}).strip();

const chatResponseSchema = z.object({
  reply: z.string().min(1).max(2400),
  persist: z.boolean(),
  action: actionSchema,
}).strip();

const chatInputSchema = z.object({
  activeStartupId: z.number().int().positive().nullable(),
  message: z.string().trim().min(1).max(2400),
});

const explicitConfirmation = /\b(confirm|confirmed|approve|approved|go ahead|apply (?:it|the update)|save (?:it|the update))\b/i;

function parseAdvisorResponse(content: string) {
  const fenced = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return chatResponseSchema.parse(JSON.parse(fenced?.[1] ?? content.trim()));
}

async function contextFor(userId: number, activeStartupId: number | null) {
  if (activeStartupId === null) {
    const portfolio = await getPortfolioContext(userId);
    return {
      scope: "General portfolio mode",
      portfolio: portfolio.startups.map(startup => ({ id: startup.id, blueprint: JSON.parse(startup.blueprint) })),
      risks: portfolio.riskRegister,
      workspace: null,
    };
  }

  const workspace = await getVentureWorkspace(userId, activeStartupId);
  if (!workspace) throw new TRPCError({ code: "NOT_FOUND", message: "This startup was not found." });
  return { scope: "Active startup mode", portfolio: null, risks: null, workspace: { ...workspace, startup: { ...workspace.startup, blueprint: JSON.parse(workspace.startup.blueprint) } } };
}

async function persistAction(userId: number, savedBlueprintId: number, action: z.infer<typeof actionSchema>) {
  if (action.kind === "none" || action.operation === "none") return null;
  if (action.operation === "update" && !action.recordId) return null;
  if (action.operation === "create" && !action.title) return null;

  if (action.operation === "update") {
    switch (action.kind) {
      case "milestone":
        await updateMilestone({ userId, savedBlueprintId, id: action.recordId!, title: action.title ?? undefined, targetDate: action.targetDate ?? undefined, status: action.status ?? undefined });
        return { type: "milestone", id: action.recordId!, verb: "Updated" };
      case "risk":
        await updateRisk({ userId, savedBlueprintId, id: action.recordId!, title: action.title ?? undefined, severity: action.severity ?? undefined, likelihood: action.likelihood ?? undefined, mitigationNotes: action.mitigationNotes ?? undefined });
        return { type: "risk", id: action.recordId!, verb: "Updated" };
      case "investment_scenario":
        await updateInvestmentScenario({ userId, savedBlueprintId, id: action.recordId!, name: action.title ?? undefined, fundingAmount: action.fundingAmount ?? undefined, valuation: action.valuation ?? undefined, runwayMonths: action.runwayMonths ?? undefined, useOfFunds: action.useOfFunds ?? undefined });
        return { type: "investment_scenario", id: action.recordId!, verb: "Updated" };
      case "crisis_plan":
        await updateCrisisPlan({ userId, savedBlueprintId, id: action.recordId!, riskId: action.riskId ?? undefined, title: action.title ?? undefined, triggerConditions: action.triggerConditions ?? undefined, responseSteps: action.responseSteps ?? undefined, owner: action.owner ?? undefined });
        return { type: "crisis_plan", id: action.recordId!, verb: "Updated" };
      default:
        return null;
    }
  }

  switch (action.kind) {
    case "milestone":
      return { type: "milestone", id: await createMilestone({ userId, savedBlueprintId, title: action.title!, targetDate: action.targetDate, status: action.status ?? "planned" }), verb: "Saved" };
    case "risk":
      return { type: "risk", id: await createRisk({ userId, savedBlueprintId, title: action.title!, severity: action.severity ?? "medium", likelihood: action.likelihood ?? "medium", mitigationNotes: action.mitigationNotes }), verb: "Saved" };
    case "investment_scenario":
      return { type: "investment_scenario", id: await createInvestmentScenario({ userId, savedBlueprintId, name: action.title!, fundingAmount: action.fundingAmount, valuation: action.valuation, runwayMonths: action.runwayMonths, useOfFunds: action.useOfFunds }), verb: "Saved" };
    case "crisis_plan":
      return { type: "crisis_plan", id: await createCrisisPlan({ userId, savedBlueprintId, riskId: action.riskId, title: action.title!, triggerConditions: action.triggerConditions, responseSteps: action.responseSteps, owner: action.owner }), verb: "Saved" };
    default:
      return null;
  }
}

export const chatRouter = router({
  history: protectedProcedure.input(z.object({ activeStartupId: z.number().int().positive().nullable() })).query(async ({ ctx, input }) => {
    if (input.activeStartupId !== null && !(await getVentureWorkspace(ctx.user.id, input.activeStartupId))) {
      throw new TRPCError({ code: "NOT_FOUND", message: "This startup was not found." });
    }
    const conversation = await getOrCreateConversation(ctx.user.id, input.activeStartupId);
    return listConversationMessages(ctx.user.id, conversation.id);
  }),
  clear: protectedProcedure.input(z.object({ activeStartupId: z.number().int().positive().nullable() })).mutation(async ({ ctx, input }) => {
    if (input.activeStartupId !== null && !(await getVentureWorkspace(ctx.user.id, input.activeStartupId))) {
      throw new TRPCError({ code: "NOT_FOUND", message: "This startup was not found." });
    }
    const conversation = await getOrCreateConversation(ctx.user.id, input.activeStartupId);
    await clearConversationMessages(ctx.user.id, conversation.id);
    return { success: true };
  }),
  send: protectedProcedure.input(chatInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const context = await contextFor(ctx.user.id, input.activeStartupId);
      const conversation = await getOrCreateConversation(ctx.user.id, input.activeStartupId);
      const history = await listConversationMessages(ctx.user.id, conversation.id);
      await createChatMessage({ conversationId: conversation.id, userId: ctx.user.id, savedBlueprintId: input.activeStartupId, role: "user", content: input.message });

      const modelResult = await invokeLLM({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: `You are the shared venture advisor for a founder's private startup portfolio. Use the injected context as the sole source of startup facts. Be concise, practical, and clear that investment scenarios are planning assumptions rather than financial advice.\n\nDistinguish conversation from durable records. Set operation=create only for a new durable artifact and operation=update only for a record already included in the private context. Set persist=true only if the current user message clearly asks to create a record, or explicitly confirms an already-proposed update. When an update is requested but confirmation is absent, describe the precise proposed edit, set persist=false, and ask the founder to reply "confirm". In General mode, never persist an action.\n\nRespond with JSON only: an object with reply (string), persist (boolean), and action (object). action must include kind, operation, recordId, title, targetDate, status, severity, likelihood, mitigationNotes, fundingAmount, valuation, runwayMonths, useOfFunds, triggerConditions, responseSteps, owner, and riskId. Use null for any action field that does not apply. Do not use markdown fences or additional prose.`,
          },
          {
            role: "system",
            content: `PRIVATE CONTEXT:\n${JSON.stringify(context)}`,
          },
          ...history.map(message => ({ role: message.role, content: message.content } as const)),
          { role: "user", content: input.message },
        ],
      });

      const firstChoice = Array.isArray(modelResult?.choices) ? modelResult.choices[0] : undefined;
      const messageContent = firstChoice?.message?.content;
      const content = typeof messageContent === "string"
        ? messageContent
        : Array.isArray(messageContent)
          ? messageContent.filter(part => part.type === "text").map(part => part.text).join("\n")
          : undefined;
      if (!content) {
        const providerError = (modelResult as unknown as { error?: { message?: string } }).error?.message;
        throw new Error(`The advisor returned no completion${providerError ? `: ${providerError}` : ""}.`);
      }
      const advisor = parseAdvisorResponse(content);
      const proposedUpdateKey = advisor.action.operation === "update" && advisor.action.recordId
        ? `proposal_update_${advisor.action.kind}`
        : null;
      const hasMatchingProposal = Boolean(proposedUpdateKey && history.some(message => message.role === "assistant" && message.linkedRecordType === proposedUpdateKey && message.linkedRecordId === advisor.action.recordId));
      const canPersistUpdate = advisor.action.operation !== "update" || (explicitConfirmation.test(input.message) && hasMatchingProposal);
      const persisted = advisor.persist && input.activeStartupId !== null && canPersistUpdate ? await persistAction(ctx.user.id, input.activeStartupId, advisor.action) : null;
      const confirmationRequired = advisor.action.operation === "update" && !persisted && !canPersistUpdate;
      const reply = persisted
        ? `${advisor.reply}\n\n${persisted.verb} the ${persisted.type.replace("_", " ")} workspace record.`
        : confirmationRequired
          ? `${advisor.reply}\n\nReply “confirm” to apply this proposed update.`
          : advisor.reply;

      await createChatMessage({
        conversationId: conversation.id,
        userId: ctx.user.id,
        savedBlueprintId: input.activeStartupId,
        role: "assistant",
        content: reply,
        linkedRecordType: persisted?.type ?? proposedUpdateKey,
        linkedRecordId: persisted?.id ?? advisor.action.recordId ?? null,
      });

      return { reply, linkedRecordType: persisted?.type ?? null, linkedRecordId: persisted?.id ?? null };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Venture advisor chat failed", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The venture advisor could not respond. Please try again." });
    }
  }),
});
