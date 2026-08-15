import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  clearConversationMessages: vi.fn(),
  createChatMessage: vi.fn(),
  createCrisisPlan: vi.fn(),
  createInvestmentScenario: vi.fn(),
  createMilestone: vi.fn(),
  createRisk: vi.fn(),
  createVentureNote: vi.fn(),
  deleteRisk: vi.fn(),
  deleteVentureNote: vi.fn(),
  getOrCreateConversation: vi.fn(),
  getPortfolioContext: vi.fn(),
  getVentureWorkspace: vi.fn(),
  listConversationMessages: vi.fn(),
  listWorkspaceConversationMessages: vi.fn(),
  updateMilestoneStatus: vi.fn(),
  updateMilestone: vi.fn(),
  updateInvestmentScenario: vi.fn(),
  updateCrisisPlan: vi.fn(),
  updateRisk: vi.fn(),
}));

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import {
  createChatMessage,
  createRisk,
  createVentureNote,
  deleteRisk,
  deleteVentureNote,
  clearConversationMessages,
  getOrCreateConversation,
  getVentureWorkspace,
  listConversationMessages,
  listWorkspaceConversationMessages,
  updateCrisisPlan,
  updateInvestmentScenario,
  updateMilestone,
  updateRisk,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { chatRouter } from "./routers/chat";
import { workspaceRouter } from "./routers/workspace";

const blueprint = {
  startupName: "CareLoop",
  tagline: "Simpler compliance for independent clinics.",
  targetAudience: "Operations leaders at independent outpatient clinics handling recurring compliance work with lean teams.",
  businessModel: ["Tiered monthly SaaS subscriptions priced by clinic location.", "Usage-based add-ons for automated evidence collection.", "Annual implementation packages for multi-site clinic groups."],
  competitors: ["Vanta", "Drata", "MedTrainer"],
  marketingPlan: ["Interview clinic administrators to validate the highest-friction compliance workflow.", "Publish compliance workflow templates in healthcare operations communities.", "Partner with specialised healthcare IT consultants for qualified referrals.", "Run targeted demos for regional clinic networks using a time-saved calculator."],
  landingPage: {
    heroHeadline: "Make clinic compliance work feel manageable.",
    heroSubheadline: "CareLoop organises tasks, evidence, and deadlines so lean clinic teams can stay audit-ready without endless spreadsheets.",
    ctaButtonText: "See your workflow",
    features: [
      { title: "One source of truth", description: "Keep every policy, task, owner, and proof point in a single organised workspace." },
      { title: "Deadline clarity", description: "Turn recurring requirements into visible, accountable workflows that teams can complete on time." },
      { title: "Audit-ready evidence", description: "Collect and retrieve the documentation you need without rebuilding the trail from scratch." },
    ],
  },
};

const workspace = {
  startup: { id: 12, userId: 42, idea: "Clinic compliance workspace", blueprint: JSON.stringify(blueprint), interestTopicId: 2, interestOtherText: null, createdAt: new Date() },
  roadmap: [],
  scenarios: [],
  riskRegister: [],
  crisisResponsePlans: [],
  notes: [],
};

function updateAction(kind: "milestone" | "risk" | "investment_scenario" | "crisis_plan", recordId: number, fields: Record<string, unknown>) {
  return {
    kind,
    operation: "update",
    recordId,
    title: null,
    targetDate: null,
    status: null,
    severity: null,
    likelihood: null,
    mitigationNotes: null,
    fundingAmount: null,
    valuation: null,
    runwayMonths: null,
    useOfFunds: null,
    triggerConditions: null,
    responseSteps: null,
    owner: null,
    riskId: null,
    ...fields,
  };
}

function proposedUpdate(kind: string, recordId: number) {
  return [{ id: 1, userId: 42, conversationId: 7, savedBlueprintId: 12, role: "assistant", content: "Proposed update. Reply confirm to save.", linkedRecordType: `proposal_update_${kind}`, linkedRecordId: recordId, createdAt: new Date() }];
}

function mockAdvisorUpdate(action: Record<string, unknown>) {
  vi.mocked(invokeLLM).mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ reply: "Update prepared.", persist: true, action }) } }] } as never);
}

function caller<T>(router: T, userId = 42) {
  return (router as typeof workspaceRouter).createCaller({ user: { id: userId } } as never);
}

describe("venture workspace and chat procedures", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getVentureWorkspace).mockResolvedValue(workspace as never);
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  it("loads a workspace only through the current user scope", async () => {
    const result = await caller(workspaceRouter).get({ savedBlueprintId: 12 });

    expect(getVentureWorkspace).toHaveBeenCalledWith(42, 12);
    expect(result.startup.blueprint.startupName).toBe("CareLoop");
  });

  it("returns an empty workspace state without validating an inactive startup as id zero", async () => {
    await expect(caller(workspaceRouter).get({ savedBlueprintId: null })).resolves.toBeNull();
    expect(getVentureWorkspace).not.toHaveBeenCalled();
  });

  it("exports only the active owner’s complete workspace, including existing advisor messages", async () => {
    vi.mocked(listWorkspaceConversationMessages).mockResolvedValue([
      { id: 4, userId: 42, conversationId: 7, savedBlueprintId: 12, role: "assistant", content: "Start with ten interviews.", createdAt: new Date("2026-08-14") },
    ] as never);

    const result = await caller(workspaceRouter).export({ savedBlueprintId: 12 });

    expect(getVentureWorkspace).toHaveBeenCalledWith(42, 12);
    expect(listWorkspaceConversationMessages).toHaveBeenCalledWith(42, 12);
    expect(result?.startup.blueprint.startupName).toBe("CareLoop");
    expect(result?.advisorMessages).toEqual(expect.arrayContaining([expect.objectContaining({ content: "Start with ten interviews." })]));
  });

  it("creates a risk record under the authenticated user and active startup", async () => {
    vi.mocked(createRisk).mockResolvedValue(71);

    await expect(caller(workspaceRouter).addRisk({ savedBlueprintId: 12, title: "Regulatory delay", severity: "high", likelihood: "medium", mitigationNotes: "Engage specialist counsel early." })).resolves.toEqual({ id: 71 });

    expect(createRisk).toHaveBeenCalledWith({
      userId: 42,
      savedBlueprintId: 12,
      title: "Regulatory delay",
      severity: "high",
      likelihood: "medium",
      mitigationNotes: "Engage specialist counsel early.",
    });
  });

  it("rejects a workspace that is not available to the requesting user", async () => {
    vi.mocked(getVentureWorkspace).mockResolvedValue(undefined);

    await expect(caller(workspaceRouter, 99).get({ savedBlueprintId: 12 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(getVentureWorkspace).toHaveBeenCalledWith(99, 12);
  });

  it("deletes a risk only through the current user and active startup scope", async () => {
    await expect(caller(workspaceRouter).deleteRisk({ savedBlueprintId: 12, id: 88 })).resolves.toEqual({ success: true });

    expect(deleteRisk).toHaveBeenCalledWith(42, 12, 88);
  });

  it("creates and deletes a private venture note with a validated reference link", async () => {
    vi.mocked(createVentureNote).mockResolvedValue(91);

    await expect(caller(workspaceRouter).addNote({
      savedBlueprintId: 12,
      title: "Pilot interview evidence",
      topic: "Customer research",
      content: "Capture the repeated pain points from the first clinic interviews.",
      referenceUrl: "https://example.com/interview-notes",
    })).resolves.toEqual({ id: 91 });

    expect(createVentureNote).toHaveBeenCalledWith({
      userId: 42,
      savedBlueprintId: 12,
      title: "Pilot interview evidence",
      topic: "Customer research",
      content: "Capture the repeated pain points from the first clinic interviews.",
      referenceUrl: "https://example.com/interview-notes",
    });

    await expect(caller(workspaceRouter).deleteNote({ savedBlueprintId: 12, id: 91 })).resolves.toEqual({ success: true });
    expect(deleteVentureNote).toHaveBeenCalledWith(42, 12, 91);
  });

  it("rejects venture note retrieval and mutations when the startup is not owned by the user", async () => {
    vi.mocked(getVentureWorkspace).mockResolvedValue(undefined);
    const unauthorized = caller(workspaceRouter, 99);

    await expect(unauthorized.get({ savedBlueprintId: 12 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(unauthorized.addNote({
      savedBlueprintId: 12,
      title: "Private founder note",
      topic: "Customer research",
      content: "This record belongs only to the original startup owner.",
      referenceUrl: "https://example.com/private-note",
    })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(unauthorized.deleteNote({ savedBlueprintId: 12, id: 91 })).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(createVentureNote).not.toHaveBeenCalled();
    expect(deleteVentureNote).not.toHaveBeenCalled();
  });

  it("rejects milestone, investment, and crisis mutations when the startup is not owned by the user", async () => {
    vi.mocked(getVentureWorkspace).mockResolvedValue(undefined);
    const unauthorized = caller(workspaceRouter, 99);

    await expect(unauthorized.updateMilestone({ savedBlueprintId: 12, id: 61, status: "done" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(unauthorized.updateInvestmentScenario({ savedBlueprintId: 12, id: 62, valuation: "2500000" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(unauthorized.deleteCrisisPlan({ savedBlueprintId: 12, id: 63 })).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(updateMilestone).not.toHaveBeenCalled();
    expect(updateInvestmentScenario).not.toHaveBeenCalled();
    expect(updateCrisisPlan).not.toHaveBeenCalled();
  });

  it("uses active venture context and persists a clearly requested risk from chat", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue([] as never);
    vi.mocked(createRisk).mockResolvedValue(88);
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({
        reply: "I logged the regulatory risk with an early-counsel mitigation.",
        persist: true,
        action: {
          kind: "risk",
          operation: "create",
          recordId: null,
          title: "Regulatory approval delay",
          targetDate: null,
          status: null,
          severity: "high",
          likelihood: "medium",
          mitigationNotes: "Engage specialist counsel before launch.",
          fundingAmount: null,
          valuation: null,
          runwayMonths: null,
          useOfFunds: null,
          triggerConditions: null,
          responseSteps: null,
          owner: null,
          riskId: null,
        },
      }) } }],
    } as never);

    const result = await caller(chatRouter).send({ activeStartupId: 12, message: "Add a high risk for regulatory approval delay." });

    expect(getVentureWorkspace).toHaveBeenCalledWith(42, 12);
    expect(createRisk).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, savedBlueprintId: 12, title: "Regulatory approval delay" }));
    expect(createChatMessage).toHaveBeenCalledTimes(2);
    expect(result.linkedRecordType).toBe("risk");
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({ role: "system", content: expect.stringContaining("Step-by-step actions") }),
      ]),
    }));
  });

  it("parses plain text JSON with omitted optional action properties", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue([] as never);
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "```json\n{\"reply\":\"Start with customer discovery.\",\"persist\":false,\"action\":{}}\n```" } }],
    } as never);

    await expect(caller(chatRouter).send({ activeStartupId: 12, message: "What should I do first?" })).resolves.toMatchObject({
      reply: "Start with customer discovery.",
      linkedRecordType: null,
    });
  });

  it("stores an allowed advisor attachment under the current user and passes safe metadata into the chat context", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue([] as never);
    vi.mocked(storagePut).mockResolvedValue({ key: "venture-advisor/42/venture-brief_abc123.txt", url: "/manus-storage/venture-advisor/42/venture-brief_abc123.txt" });
    vi.mocked(invokeLLM).mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ reply: "I can help you frame the brief.", persist: false, action: {} }) } }] } as never);

    await caller(chatRouter).send({
      activeStartupId: 12,
      message: "Help me improve this brief.",
      attachment: { fileName: "venture brief.txt", mimeType: "text/plain", size: 5, dataBase64: Buffer.from("brief").toString("base64") },
    });

    expect(storagePut).toHaveBeenCalledWith("venture-advisor/42/venture_brief.txt", expect.any(Buffer), "text/plain");
    expect(createChatMessage).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, content: "Help me improve this brief.", attachmentFileName: "venture brief.txt", attachmentFileKey: "venture-advisor/42/venture-brief_abc123.txt", attachmentMimeType: "text/plain", attachmentSize: 5 }));
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({ messages: expect.arrayContaining([expect.objectContaining({ role: "user", content: expect.stringContaining("Private attachment metadata: venture brief.txt; text/plain; 5 bytes") })]) }));
  });

  it("rejects unsupported advisor attachment types before storage", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue([] as never);

    await expect(caller(chatRouter).send({ activeStartupId: 12, message: "Review this file.", attachment: { fileName: "archive.zip", mimeType: "application/zip", size: 3, dataBase64: "emlw" } })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "Use a PDF, image, text, Markdown, CSV, or JSON file." });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("treats unrecognised model action labels as advisory text instead of failing the chat", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue([] as never);
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ reply: "Here are three startup ideas to explore.", persist: true, action: { kind: "startup_idea", operation: "suggest", status: "draft" } }) } }],
    } as never);

    await expect(caller(chatRouter).send({ activeStartupId: 12, message: "Suggest startup ideas." })).resolves.toMatchObject({
      reply: "Here are three startup ideas to explore.",
      linkedRecordType: null,
    });
  });

  it("converts a provider response without choices into a safe advisor error", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue([] as never);
    vi.mocked(invokeLLM).mockResolvedValue({ error: { message: "JSON mode is unavailable" } } as never);

    await expect(caller(chatRouter).send({ activeStartupId: 12, message: "Help with the roadmap." })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "The venture advisor could not respond. Please try again.",
    });
  });

  it("persists a confirmed update to an existing risk in the active startup", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue(proposedUpdate("risk", 88) as never);
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({
        reply: "Confirmed. I have elevated the risk.",
        persist: true,
        action: {
          kind: "risk",
          operation: "update",
          recordId: 88,
          title: null,
          targetDate: null,
          status: null,
          severity: "critical",
          likelihood: null,
          mitigationNotes: null,
          fundingAmount: null,
          valuation: null,
          runwayMonths: null,
          useOfFunds: null,
          triggerConditions: null,
          responseSteps: null,
          owner: null,
          riskId: null,
        },
      }) } }],
    } as never);

    const result = await caller(chatRouter).send({ activeStartupId: 12, message: "Confirm the risk update." });

    expect(updateRisk).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, savedBlueprintId: 12, id: 88, severity: "critical" }));
    expect(result.reply).toContain("Updated the risk workspace record.");
  });

  it("does not update a record until a matching proposal is explicitly confirmed", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    vi.mocked(listConversationMessages).mockResolvedValue([] as never);
    mockAdvisorUpdate(updateAction("risk", 88, { severity: "critical" }));

    const result = await caller(chatRouter).send({ activeStartupId: 12, message: "Make the risk more serious." });

    expect(updateRisk).not.toHaveBeenCalled();
    expect(result.reply).toContain("Reply “confirm” to apply this proposed update.");
    expect(createChatMessage).toHaveBeenLastCalledWith(expect.objectContaining({ linkedRecordType: "proposal_update_risk", linkedRecordId: 88 }));
  });

  it("applies confirmed milestone, investment, and crisis updates only within the active startup", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);

    vi.mocked(listConversationMessages).mockResolvedValue(proposedUpdate("milestone", 61) as never);
    mockAdvisorUpdate(updateAction("milestone", 61, { title: "Finish clinic pilot", status: "done" }));
    await caller(chatRouter).send({ activeStartupId: 12, message: "Confirm the milestone update." });
    expect(updateMilestone).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, savedBlueprintId: 12, id: 61, status: "done" }));

    vi.mocked(listConversationMessages).mockResolvedValue(proposedUpdate("investment_scenario", 62) as never);
    mockAdvisorUpdate(updateAction("investment_scenario", 62, { valuation: "2500000", runwayMonths: 18 }));
    await caller(chatRouter).send({ activeStartupId: 12, message: "Confirm the funding scenario update." });
    expect(updateInvestmentScenario).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, savedBlueprintId: 12, id: 62, valuation: "2500000", runwayMonths: 18 }));

    vi.mocked(listConversationMessages).mockResolvedValue(proposedUpdate("crisis_plan", 63) as never);
    mockAdvisorUpdate(updateAction("crisis_plan", 63, { owner: "Operations lead", triggerConditions: "Missed regulatory deadline" }));
    await caller(chatRouter).send({ activeStartupId: 12, message: "Confirm the crisis plan update." });
    expect(updateCrisisPlan).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, savedBlueprintId: 12, id: 63, owner: "Operations lead" }));
  });

  it("clears only the authenticated user’s persisted conversation history", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);

    await expect(caller(chatRouter).clear({ activeStartupId: 12 })).resolves.toEqual({ success: true });

    expect(clearConversationMessages).toHaveBeenCalledWith(42, 7);
  });

  it("loads continuous persisted history for the selected startup context", async () => {
    vi.mocked(getOrCreateConversation).mockResolvedValue({ id: 7, userId: 42, activeStartupId: 12, createdAt: new Date() } as never);
    const history = [
      { id: 1, userId: 42, conversationId: 7, savedBlueprintId: 12, role: "user", content: "What is the highest risk?", linkedRecordType: null, linkedRecordId: null, createdAt: new Date() },
      { id: 2, userId: 42, conversationId: 7, savedBlueprintId: 12, role: "assistant", content: "Regulatory approval delay is currently high.", linkedRecordType: "risk", linkedRecordId: 88, createdAt: new Date() },
    ];
    vi.mocked(listConversationMessages).mockResolvedValue(history as never);

    await expect(caller(chatRouter).history({ activeStartupId: 12 })).resolves.toEqual(history);
    expect(listConversationMessages).toHaveBeenCalledWith(42, 7);
  });
});
