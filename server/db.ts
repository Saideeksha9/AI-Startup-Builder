import { and, desc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  chatConversations,
  chatMessages,
  crisisPlans,
  InsertUser,
  interestFields,
  interestPendingReviews,
  interestTopics,
  investmentScenarios,
  milestones,
  risks,
  savedBlueprints,
  users,
  ventureNotes,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }

  return _db;
}

async function databaseOrThrow() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;

    textFields.forEach(field => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    });

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    values.lastSignedIn ??= new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listInterestFields() {
  const db = await databaseOrThrow();
  return db.select().from(interestFields).orderBy(interestFields.name);
}

export async function listInterestTopics(fieldId: number) {
  const db = await databaseOrThrow();
  return db.select().from(interestTopics).where(eq(interestTopics.fieldId, fieldId)).orderBy(interestTopics.name);
}

export async function getInterestTopic(topicId: number) {
  const db = await databaseOrThrow();
  const rows = await db.select().from(interestTopics).where(eq(interestTopics.id, topicId)).limit(1);
  return rows[0];
}

export async function createSavedBlueprint(input: {
  userId: number;
  idea: string;
  blueprint: string;
  interestTopicId?: number | null;
  interestOtherText?: string | null;
}) {
  const db = await databaseOrThrow();
  const result = await db.insert(savedBlueprints).values({
    ...input,
    interestTopicId: input.interestTopicId ?? null,
    interestOtherText: input.interestOtherText ?? null,
  });
  return Number(result[0].insertId);
}

export async function updateSavedBlueprint(userId: number, id: number, blueprint: string) {
  const db = await databaseOrThrow();
  await db.update(savedBlueprints).set({ blueprint }).where(and(eq(savedBlueprints.id, id), eq(savedBlueprints.userId, userId)));
}

export async function createInterestPendingReview(input: {
  userId: number;
  savedBlueprintId: number;
  submittedText: string;
}) {
  const db = await databaseOrThrow();
  await db.insert(interestPendingReviews).values(input);
}

export async function listSavedBlueprints(userId: number) {
  const db = await databaseOrThrow();
  return db.select().from(savedBlueprints).where(eq(savedBlueprints.userId, userId)).orderBy(desc(savedBlueprints.createdAt));
}

export async function getSavedBlueprint(userId: number, savedBlueprintId: number) {
  const db = await databaseOrThrow();
  const rows = await db
    .select()
    .from(savedBlueprints)
    .where(and(eq(savedBlueprints.id, savedBlueprintId), eq(savedBlueprints.userId, userId)))
    .limit(1);
  return rows[0];
}

export async function createMilestone(input: {
  userId: number;
  savedBlueprintId: number;
  title: string;
  targetDate?: string | null;
  status?: "planned" | "in_progress" | "done" | "blocked";
  dependsOnId?: number | null;
}) {
  const db = await databaseOrThrow();
  const result = await db.insert(milestones).values({
    ...input,
    targetDate: input.targetDate ? new Date(`${input.targetDate}T00:00:00.000Z`) : null,
  });
  return Number(result[0].insertId);
}

export async function updateMilestoneStatus(input: {
  userId: number;
  savedBlueprintId: number;
  id: number;
  status: "planned" | "in_progress" | "done" | "blocked";
}) {
  const db = await databaseOrThrow();
  await db.update(milestones).set({ status: input.status }).where(and(eq(milestones.id, input.id), eq(milestones.userId, input.userId), eq(milestones.savedBlueprintId, input.savedBlueprintId)));
}

export async function createInvestmentScenario(input: {
  userId: number;
  savedBlueprintId: number;
  name: string;
  fundingAmount?: string | null;
  valuation?: string | null;
  runwayMonths?: number | null;
  useOfFunds?: string | null;
  version?: number;
}) {
  const db = await databaseOrThrow();
  const result = await db.insert(investmentScenarios).values({
    ...input,
    fundingAmount: normalizeMoney(input.fundingAmount),
    valuation: normalizeMoney(input.valuation),
  });
  return Number(result[0].insertId);
}

export async function createRisk(input: {
  userId: number;
  savedBlueprintId: number;
  title: string;
  severity?: "low" | "medium" | "high" | "critical";
  likelihood?: "low" | "medium" | "high";
  mitigationNotes?: string | null;
}) {
  const db = await databaseOrThrow();
  const result = await db.insert(risks).values(input);
  return Number(result[0].insertId);
}

export async function createCrisisPlan(input: {
  userId: number;
  savedBlueprintId: number;
  riskId?: number | null;
  title: string;
  triggerConditions?: string | null;
  responseSteps?: string | null;
  owner?: string | null;
}) {
  const db = await databaseOrThrow();
  const result = await db.insert(crisisPlans).values(input);
  return Number(result[0].insertId);
}

export async function createVentureNote(input: {
  userId: number;
  savedBlueprintId: number;
  title: string;
  topic?: string | null;
  content: string;
  referenceUrl?: string | null;
}) {
  const db = await databaseOrThrow();
  const result = await db.insert(ventureNotes).values(input);
  return Number(result[0].insertId);
}

export async function deleteVentureNote(userId: number, savedBlueprintId: number, id: number) {
  const db = await databaseOrThrow();
  await db.delete(ventureNotes).where(and(eq(ventureNotes.id, id), eq(ventureNotes.userId, userId), eq(ventureNotes.savedBlueprintId, savedBlueprintId)));
}

export async function getVentureWorkspace(userId: number, savedBlueprintId: number) {
  const db = await databaseOrThrow();
  const startup = await getSavedBlueprint(userId, savedBlueprintId);
  if (!startup) return undefined;

  const [roadmap, scenarios, riskRegister, crisisResponsePlans, notes] = await Promise.all([
    db.select().from(milestones).where(and(eq(milestones.userId, userId), eq(milestones.savedBlueprintId, savedBlueprintId))).orderBy(milestones.targetDate),
    db.select().from(investmentScenarios).where(and(eq(investmentScenarios.userId, userId), eq(investmentScenarios.savedBlueprintId, savedBlueprintId))).orderBy(desc(investmentScenarios.createdAt)),
    db.select().from(risks).where(and(eq(risks.userId, userId), eq(risks.savedBlueprintId, savedBlueprintId))).orderBy(desc(risks.createdAt)),
    db.select().from(crisisPlans).where(and(eq(crisisPlans.userId, userId), eq(crisisPlans.savedBlueprintId, savedBlueprintId))).orderBy(desc(crisisPlans.createdAt)),
    db.select().from(ventureNotes).where(and(eq(ventureNotes.userId, userId), eq(ventureNotes.savedBlueprintId, savedBlueprintId))).orderBy(desc(ventureNotes.createdAt)),
  ]);

  return { startup, roadmap, scenarios, riskRegister, crisisResponsePlans, notes };
}

function normalizeMoney(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = value.replace(/[$,\s]/g, "");
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? normalized : null;
}

export async function getPortfolioContext(userId: number) {
  const db = await databaseOrThrow();
  const [startups, riskRegister] = await Promise.all([
    db.select().from(savedBlueprints).where(eq(savedBlueprints.userId, userId)).orderBy(desc(savedBlueprints.createdAt)),
    db.select().from(risks).where(eq(risks.userId, userId)).orderBy(desc(risks.createdAt)),
  ]);
  return { startups, riskRegister };
}

export async function getOrCreateConversation(userId: number, activeStartupId: number | null) {
  const db = await databaseOrThrow();
  const where = activeStartupId === null
    ? and(eq(chatConversations.userId, userId), isNull(chatConversations.activeStartupId))
    : and(eq(chatConversations.userId, userId), eq(chatConversations.activeStartupId, activeStartupId));
  const existing = await db.select().from(chatConversations).where(where).limit(1);
  if (existing[0]) return existing[0];

  const result = await db.insert(chatConversations).values({ userId, activeStartupId });
  const created = await db.select().from(chatConversations).where(eq(chatConversations.id, Number(result[0].insertId))).limit(1);
  if (!created[0]) throw new Error("Conversation could not be created.");
  return created[0];
}

export async function listConversationMessages(userId: number, conversationId: number) {
  const db = await databaseOrThrow();
  const rows = await db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.userId, userId), eq(chatMessages.conversationId, conversationId)))
    .orderBy(desc(chatMessages.createdAt))
    .limit(20);
  return rows.reverse();
}

export async function listWorkspaceConversationMessages(userId: number, savedBlueprintId: number) {
  const db = await databaseOrThrow();
  const conversations = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.userId, userId), eq(chatConversations.activeStartupId, savedBlueprintId)))
    .limit(1);
  if (!conversations[0]) return [];
  return db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.userId, userId), eq(chatMessages.conversationId, conversations[0].id)))
    .orderBy(chatMessages.createdAt);
}

export async function createChatMessage(input: {
  conversationId: number;
  userId: number;
  savedBlueprintId: number | null;
  role: "user" | "assistant";
  content: string;
  linkedRecordType?: string | null;
  linkedRecordId?: number | null;
}) {
  const db = await databaseOrThrow();
  await db.insert(chatMessages).values(input);
}

export async function updateMilestone(input: {
  userId: number;
  savedBlueprintId: number;
  id: number;
  title?: string;
  targetDate?: string | null;
  status?: "planned" | "in_progress" | "done" | "blocked";
  dependsOnId?: number | null;
}) {
  const db = await databaseOrThrow();
  await db.update(milestones).set({
    title: input.title,
    targetDate: input.targetDate === undefined ? undefined : input.targetDate ? new Date(`${input.targetDate}T00:00:00.000Z`) : null,
    status: input.status,
    dependsOnId: input.dependsOnId,
  }).where(and(eq(milestones.id, input.id), eq(milestones.userId, input.userId), eq(milestones.savedBlueprintId, input.savedBlueprintId)));
}

export async function deleteMilestone(userId: number, savedBlueprintId: number, id: number) {
  const db = await databaseOrThrow();
  await db.delete(milestones).where(and(eq(milestones.id, id), eq(milestones.userId, userId), eq(milestones.savedBlueprintId, savedBlueprintId)));
}

export async function updateInvestmentScenario(input: {
  userId: number;
  savedBlueprintId: number;
  id: number;
  name?: string;
  fundingAmount?: string | null;
  valuation?: string | null;
  runwayMonths?: number | null;
  useOfFunds?: string | null;
}) {
  const db = await databaseOrThrow();
  await db.update(investmentScenarios).set({
    name: input.name,
    fundingAmount: input.fundingAmount === undefined ? undefined : normalizeMoney(input.fundingAmount),
    valuation: input.valuation === undefined ? undefined : normalizeMoney(input.valuation),
    runwayMonths: input.runwayMonths,
    useOfFunds: input.useOfFunds,
  }).where(and(eq(investmentScenarios.id, input.id), eq(investmentScenarios.userId, input.userId), eq(investmentScenarios.savedBlueprintId, input.savedBlueprintId)));
}

export async function deleteInvestmentScenario(userId: number, savedBlueprintId: number, id: number) {
  const db = await databaseOrThrow();
  await db.delete(investmentScenarios).where(and(eq(investmentScenarios.id, id), eq(investmentScenarios.userId, userId), eq(investmentScenarios.savedBlueprintId, savedBlueprintId)));
}

export async function updateRisk(input: {
  userId: number;
  savedBlueprintId: number;
  id: number;
  title?: string;
  severity?: "low" | "medium" | "high" | "critical";
  likelihood?: "low" | "medium" | "high";
  mitigationNotes?: string | null;
}) {
  const db = await databaseOrThrow();
  await db.update(risks).set({
    title: input.title,
    severity: input.severity,
    likelihood: input.likelihood,
    mitigationNotes: input.mitigationNotes,
  }).where(and(eq(risks.id, input.id), eq(risks.userId, input.userId), eq(risks.savedBlueprintId, input.savedBlueprintId)));
}

export async function deleteRisk(userId: number, savedBlueprintId: number, id: number) {
  const db = await databaseOrThrow();
  await db.delete(risks).where(and(eq(risks.id, id), eq(risks.userId, userId), eq(risks.savedBlueprintId, savedBlueprintId)));
}

export async function updateCrisisPlan(input: {
  userId: number;
  savedBlueprintId: number;
  id: number;
  riskId?: number | null;
  title?: string;
  triggerConditions?: string | null;
  responseSteps?: string | null;
  owner?: string | null;
}) {
  const db = await databaseOrThrow();
  await db.update(crisisPlans).set({
    riskId: input.riskId,
    title: input.title,
    triggerConditions: input.triggerConditions,
    responseSteps: input.responseSteps,
    owner: input.owner,
  }).where(and(eq(crisisPlans.id, input.id), eq(crisisPlans.userId, input.userId), eq(crisisPlans.savedBlueprintId, input.savedBlueprintId)));
}

export async function deleteCrisisPlan(userId: number, savedBlueprintId: number, id: number) {
  const db = await databaseOrThrow();
  await db.delete(crisisPlans).where(and(eq(crisisPlans.id, id), eq(crisisPlans.userId, userId), eq(crisisPlans.savedBlueprintId, savedBlueprintId)));
}

export async function clearConversationMessages(userId: number, conversationId: number) {
  const db = await databaseOrThrow();
  await db.delete(chatMessages).where(and(eq(chatMessages.userId, userId), eq(chatMessages.conversationId, conversationId)));
}
