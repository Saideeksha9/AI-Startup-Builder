import { date, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const savedBlueprints = mysqlTable(
  "savedBlueprints",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    idea: text("idea").notNull(),
    blueprint: text("blueprint").notNull(),
    interestTopicId: int("interestTopicId").references(() => interestTopics.id, { onDelete: "set null" }),
    interestOtherText: text("interestOtherText"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("savedBlueprints_user_created_idx").on(table.userId, table.createdAt)],
);

export type SavedBlueprint = typeof savedBlueprints.$inferSelect;
export type InsertSavedBlueprint = typeof savedBlueprints.$inferInsert;

export const interestFields = mysqlTable("interestFields", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const interestTopics = mysqlTable(
  "interestTopics",
  {
    id: int("id").autoincrement().primaryKey(),
    fieldId: int("fieldId")
      .notNull()
      .references(() => interestFields.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [unique("interestTopics_field_slug_unique").on(table.fieldId, table.slug), index("interestTopics_field_idx").on(table.fieldId)],
);

export const interestPendingReviews = mysqlTable(
  "interestPendingReviews",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    savedBlueprintId: int("savedBlueprintId")
      .notNull()
      .references(() => savedBlueprints.id, { onDelete: "cascade" }),
    submittedText: text("submittedText").notNull(),
    status: mysqlEnum("status", ["pending", "promoted", "rejected"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("interestPendingReviews_user_idx").on(table.userId), index("interestPendingReviews_startup_idx").on(table.savedBlueprintId)],
);

export const milestones = mysqlTable(
  "milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    savedBlueprintId: int("savedBlueprintId")
      .notNull()
      .references(() => savedBlueprints.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    targetDate: date("targetDate"),
    status: mysqlEnum("status", ["planned", "in_progress", "done", "blocked"]).default("planned").notNull(),
    dependsOnId: int("dependsOnId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("milestones_user_startup_idx").on(table.userId, table.savedBlueprintId)],
);

export const investmentScenarios = mysqlTable(
  "investmentScenarios",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    savedBlueprintId: int("savedBlueprintId")
      .notNull()
      .references(() => savedBlueprints.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    fundingAmount: decimal("fundingAmount", { precision: 15, scale: 2 }),
    valuation: decimal("valuation", { precision: 15, scale: 2 }),
    runwayMonths: int("runwayMonths"),
    useOfFunds: text("useOfFunds"),
    version: int("version").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("investmentScenarios_user_startup_idx").on(table.userId, table.savedBlueprintId)],
);

export const risks = mysqlTable(
  "risks",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    savedBlueprintId: int("savedBlueprintId")
      .notNull()
      .references(() => savedBlueprints.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 240 }).notNull(),
    severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
    likelihood: mysqlEnum("likelihood", ["low", "medium", "high"]).default("medium").notNull(),
    mitigationNotes: text("mitigationNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("risks_user_startup_idx").on(table.userId, table.savedBlueprintId)],
);

export const crisisPlans = mysqlTable(
  "crisisPlans",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    savedBlueprintId: int("savedBlueprintId")
      .notNull()
      .references(() => savedBlueprints.id, { onDelete: "cascade" }),
    riskId: int("riskId").references(() => risks.id, { onDelete: "set null" }),
    title: varchar("title", { length: 240 }).notNull(),
    triggerConditions: text("triggerConditions"),
    responseSteps: text("responseSteps"),
    owner: varchar("owner", { length: 160 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("crisisPlans_user_startup_idx").on(table.userId, table.savedBlueprintId)],
);

export const chatConversations = mysqlTable(
  "chatConversations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeStartupId: int("activeStartupId").references(() => savedBlueprints.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("chatConversations_user_startup_idx").on(table.userId, table.activeStartupId)],
);

export const chatMessages = mysqlTable(
  "chatMessages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId")
      .notNull()
      .references(() => chatConversations.id, { onDelete: "cascade" }),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    savedBlueprintId: int("savedBlueprintId").references(() => savedBlueprints.id, { onDelete: "set null" }),
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    content: text("content").notNull(),
    linkedRecordType: varchar("linkedRecordType", { length: 64 }),
    linkedRecordId: int("linkedRecordId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("chatMessages_conversation_idx").on(table.conversationId), index("chatMessages_user_startup_idx").on(table.userId, table.savedBlueprintId)],
);
