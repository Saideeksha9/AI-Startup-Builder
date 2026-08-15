import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import Home from "./Home";

const generateMutate = vi.fn();
const saveMutate = vi.fn();
const generateWorkspacePlanMutate = vi.fn();
const resetGenerate = vi.fn();
const refetchSavedStartups = vi.fn();
const refetchWorkspace = vi.fn();
const topicUseQuery = vi.fn();
const openWindow = vi.fn();
const addNoteMutate = vi.fn();
const deleteNoteMutate = vi.fn();
const refetchWorkspaceExport = vi.fn();
const downloadWorkspaceMarkdown = vi.fn();
const downloadWorkspacePdf = vi.fn();
const updateOnboardingMutate = vi.fn();

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

const proactiveBlueprint = {
  ...blueprint,
  ventureWorkspace: {
    detailedActionPlan: [{
      phase: "Validate",
      objective: "Confirm independent clinic demand before expanding the product scope.",
      actions: ["Interview ten clinic operations leaders about their current workflow.", "Test a narrow pilot offer with two qualified clinic teams."],
      whyItMatters: "This reduces the chance of investing in a workflow that clinics do not value enough to adopt.",
    }],
    initialMilestones: [],
    investmentScenarios: [],
    risks: [],
    crisisPlans: [],
  },
};

const legacyBlueprint = {
  ...blueprint,
  ventureWorkspace: {
    detailedActionPlan: [],
    initialMilestones: [],
    investmentScenarios: [],
    risks: [],
    crisisPlans: [],
  },
};

const authState = { user: null as { name: string | null } | null, loading: false, isAuthenticated: false, logout: vi.fn() };
const generateState: { data: typeof blueprint | undefined; isPending: boolean; error: { message: string } | null } = { data: undefined, isPending: false, error: null };
const saveState = { isPending: false, isSuccess: false, isError: false, error: null as { message: string } | null };
const savedStartupsState: { data: Array<{ id: number; idea: string; createdAt: Date; interestTopicId: number | null; interestOtherText: string | null; blueprint: typeof blueprint }> | undefined; isLoading: boolean; error: { message: string } | null } = { data: [], isLoading: false, error: null };
const workspaceState: { data: unknown; isLoading: boolean; error: { message: string } | null } = { data: undefined, isLoading: false, error: null };
const workspaceExportState: { data: unknown; isFetching: boolean; error: { message: string } | null } = { data: undefined, isFetching: false, error: null };
const profileState = {
  data: {
    account: { name: "Cherry 99", email: "cherry@example.com" },
    profile: { fullName: null as string | null, jobTitle: null, companyName: null, preferredFocus: null as string | null, weeklyDigest: true, onboardingEmailTips: true },
    onboarding: { completedSteps: [] as Array<"review_profile" | "save_first_venture" | "review_workspace" | "ask_advisor">, dismissed: false, savedVentureCount: 0 },
  },
  refetch: vi.fn(),
};
const taxonomyFields = [{ id: 1, name: "Medical/Healthcare", slug: "medical-healthcare" }];
const taxonomyTopics = [{ id: 2, fieldId: 1, name: "Telemedicine", slug: "telemedicine" }];

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => authState }));
vi.mock("@/components/VentureChat", () => ({ VentureChat: () => <div data-testid="venture-chat" /> }));
vi.mock("@/lib/ventureExport", () => ({
  downloadVentureWorkspaceMarkdown: (...args: unknown[]) => downloadWorkspaceMarkdown(...args),
  downloadVentureWorkspacePdf: (...args: unknown[]) => downloadWorkspacePdf(...args),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    taxonomy: {
      fields: { useQuery: () => ({ data: taxonomyFields, isLoading: false }) },
      topics: { useQuery: (...args: unknown[]) => { topicUseQuery(...args); return { data: taxonomyTopics, isLoading: false, isError: false, error: null }; } },
    },
    blueprint: {
      list: { useQuery: () => ({ ...savedStartupsState, refetch: refetchSavedStartups }) },
      generate: { useMutation: () => ({ ...generateState, mutate: generateMutate, reset: resetGenerate }) },
      save: { useMutation: () => ({ ...saveState, mutate: saveMutate }) },
      generateWorkspacePlan: { useMutation: () => ({ isPending: false, mutate: generateWorkspacePlanMutate }) },
    },
    workspace: {
      get: { useQuery: () => ({ ...workspaceState, refetch: refetchWorkspace }) },
      export: { useQuery: () => ({ ...workspaceExportState, refetch: refetchWorkspaceExport }) },
      addMilestone: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      updateMilestoneStatus: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      addInvestmentScenario: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      addRisk: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      addCrisisPlan: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      deleteMilestone: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      deleteInvestmentScenario: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      deleteRisk: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      deleteCrisisPlan: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      addNote: { useMutation: () => ({ isPending: false, mutate: addNoteMutate }) },
      deleteNote: { useMutation: () => ({ isPending: false, mutate: deleteNoteMutate }) },
    },
    profile: {
      get: { useQuery: () => profileState },
      updateOnboarding: { useMutation: () => ({ isPending: false, mutate: updateOnboardingMutate }) },
    },
  },
}));

describe("Home venture workspace", () => {
  beforeEach(() => {
    generateMutate.mockClear();
    saveMutate.mockClear();
    generateWorkspacePlanMutate.mockClear();
    resetGenerate.mockClear();
    refetchSavedStartups.mockClear();
    refetchWorkspace.mockClear();
    topicUseQuery.mockClear();
    openWindow.mockClear();
    addNoteMutate.mockClear();
    deleteNoteMutate.mockClear();
    refetchWorkspaceExport.mockClear();
    downloadWorkspaceMarkdown.mockClear();
    downloadWorkspacePdf.mockClear();
    updateOnboardingMutate.mockClear();
    profileState.refetch.mockClear();
    profileState.data.profile.fullName = null;
    profileState.data.profile.preferredFocus = null;
    profileState.data.onboarding.completedSteps = [];
    profileState.data.onboarding.dismissed = false;
    profileState.data.onboarding.savedVentureCount = 0;
    Object.defineProperty(window, "open", { value: openWindow, writable: true });
    window.sessionStorage.clear();
    authState.user = null;
    authState.loading = false;
    authState.isAuthenticated = false;
    generateState.data = undefined;
    generateState.isPending = false;
    generateState.error = null;
    saveState.isPending = false;
    saveState.isSuccess = false;
    saveState.isError = false;
    saveState.error = null;
    savedStartupsState.data = [];
    savedStartupsState.isLoading = false;
    savedStartupsState.error = null;
    workspaceState.data = undefined;
    workspaceState.isLoading = false;
    workspaceState.error = null;
    workspaceExportState.data = undefined;
    workspaceExportState.isFetching = false;
    workspaceExportState.error = null;
  });

  it("shows the taxonomy-guided empty state before any venture is generated", () => {
    render(<Home />);
    expect(screen.getByText("Begin with an idea.")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Medical/Healthcare" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Telemedicine" })).toBeInTheDocument();
  });

  it("requires a field before generation", () => {
  render(<Home />);
  fireEvent.change(screen.getByPlaceholderText("Describe a startup idea..."), { target: { value: "A useful startup idea for healthcare teams" } });
  fireEvent.click(screen.getByRole("button", { name: /generate/i }));
  expect(screen.getByRole("alert")).toHaveTextContent("Select an interest field before generating a startup blueprint.");
  expect(generateMutate).not.toHaveBeenCalled();
});

  it("enables and loads dependent topics after a field is selected", () => {
    render(<Home />);
    const [fieldSelector, topicSelector] = screen.getAllByRole("combobox");

    expect(topicSelector).toBeDisabled();
    fireEvent.change(fieldSelector, { target: { value: "1" } });

    expect(topicSelector).toBeEnabled();
    expect(screen.getByRole("option", { name: "Telemedicine" })).toBeInTheDocument();
    expect(topicUseQuery).toHaveBeenLastCalledWith({ fieldId: 1 }, expect.objectContaining({ enabled: true }));
  });

  it("shows the exact loading message while a blueprint is generating", () => {
    generateState.isPending = true;
    render(<Home />);
    expect(screen.getByText("Strategizing...")).toBeInTheDocument();
  });

  it("renders the generated strategy and landing-page blueprint", () => {
    generateState.data = blueprint;
    render(<Home />);
    expect(screen.getAllByText("CareLoop")).toHaveLength(2);
    expect(screen.getByText("Business Strategy")).toBeInTheDocument();
    expect(screen.getByText("Marketing Plan")).toBeInTheDocument();
    expect(screen.getByText("Generated Landing Page")).toBeInTheDocument();
    expect(screen.getByText("One source of truth")).toBeInTheDocument();
  });

  it("shows proactive step-by-step guidance when the generated blueprint includes it", () => {
    generateState.data = proactiveBlueprint;
    render(<Home />);

    expect(screen.getByText("Step-by-step launch guide")).toBeInTheDocument();
    expect(screen.getByText("Confirm independent clinic demand before expanding the product scope.")).toBeInTheDocument();
    expect(screen.getByText(/This reduces the chance of investing/i)).toBeInTheDocument();
  });

  it("opens the generated landing page as an interactive preview", () => {
    generateState.data = blueprint;
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "See your workflow" }));

    expect(openWindow).toHaveBeenCalledWith("/landing-preview", "_blank", "noopener");
    expect(window.sessionStorage.getItem("autonomous-ai-startup-landing-preview")).toContain("CareLoop");
  });

  it("does not save a generated blueprint until the signed-in user presses Save to list", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    const rendered = render(<Home />);
    const [fieldSelector, topicSelector] = screen.getAllByRole("combobox");

    fireEvent.change(fieldSelector, { target: { value: "1" } });
    fireEvent.change(topicSelector, { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("Describe a startup idea..."), { target: { value: "A useful startup idea for clinic compliance teams" } });
    fireEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(generateMutate).toHaveBeenCalledTimes(1);
    expect(saveMutate).not.toHaveBeenCalled();

    generateState.data = blueprint;
    rendered.rerender(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Save to list" }));

    expect(saveMutate).toHaveBeenCalledWith(expect.objectContaining({ idea: "A useful startup idea for clinic compliance teams", blueprint, interestTopicId: 2 }));
  });

  it("opens a signed-in saved venture with its workspace views and chat", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    savedStartupsState.data = [{ id: 12, idea: "A clinic compliance workspace", createdAt: new Date("2026-08-12"), interestTopicId: 2, interestOtherText: null, blueprint }];
    workspaceState.data = { roadmap: [], scenarios: [], riskRegister: [], crisisResponsePlans: [] };
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /careloop/i }));
    expect(screen.getByText("Venture workspace")).toBeInTheDocument();
    expect(screen.getByText("Active startup: CareLoop")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notes" })).toBeInTheDocument();
    expect(screen.getByText("Milestone roadmap")).toBeInTheDocument();
    expect(screen.getByText("Investment scenarios")).toBeInTheDocument();
    expect(screen.getByText("Risk register")).toBeInTheDocument();
    expect(screen.getAllByText("Crisis plans").length).toBeGreaterThan(0);
    expect(screen.getByTestId("venture-chat")).toBeInTheDocument();
  });

  it("shows a first-founder checklist and persists an optional completed step", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    render(<Home />);

    expect(screen.getByRole("region", { name: "Founder welcome checklist" })).toBeInTheDocument();
    expect(screen.getByText("Start with a clear first move.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark complete: Review a venture workspace" }));

    expect(updateOnboardingMutate).toHaveBeenCalledWith({ completedSteps: ["review_workspace"], dismissed: false });
  });

  it("offers a one-click workspace plan for legacy startups without recommendations", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    savedStartupsState.data = [{ id: 18, idea: "A clinic compliance workspace", createdAt: new Date("2026-08-12"), interestTopicId: 2, interestOtherText: null, blueprint: legacyBlueprint }];
    workspaceState.data = { roadmap: [], scenarios: [], riskRegister: [], crisisResponsePlans: [], notes: [] };
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /careloop/i }));
    expect(screen.getByText(/This startup was saved before automatic roadmap/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Generate workspace plan" }));
    expect(generateWorkspacePlanMutate).toHaveBeenCalledWith({ savedBlueprintId: 18 });
  });

  it("switches the active workspace between multiple saved startups", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    savedStartupsState.data = [
      { id: 12, idea: "A clinic compliance workspace", createdAt: new Date("2026-08-12"), interestTopicId: 2, interestOtherText: null, blueprint },
      { id: 19, idea: "An aerial-inspection workspace", createdAt: new Date("2026-08-13"), interestTopicId: 2, interestOtherText: null, blueprint: { ...blueprint, startupName: "AeroScan" } },
    ];
    workspaceState.data = { roadmap: [], scenarios: [], riskRegister: [], crisisResponsePlans: [], notes: [] };
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /careloop/i }));
    expect(screen.getByText("Active startup: CareLoop")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /careloop/i })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /aeroscan/i }));
    expect(screen.getByText("Active startup: AeroScan")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aeroscan/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("exports the active venture workspace as Markdown", async () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    savedStartupsState.data = [{ id: 12, idea: "A clinic compliance workspace", createdAt: new Date("2026-08-12"), interestTopicId: 2, interestOtherText: null, blueprint }];
    workspaceState.data = { roadmap: [], scenarios: [], riskRegister: [], crisisResponsePlans: [], notes: [] };
    workspaceExportState.data = { startup: { idea: "A clinic compliance workspace", blueprint }, roadmap: [], scenarios: [], riskRegister: [], crisisResponsePlans: [], notes: [], advisorMessages: [] };
    refetchWorkspaceExport.mockResolvedValue({ data: workspaceExportState.data });
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /careloop/i }));
    fireEvent.click(screen.getByRole("button", { name: "Markdown" }));

    await waitFor(() => expect(refetchWorkspaceExport).toHaveBeenCalled());
    expect(downloadWorkspaceMarkdown).toHaveBeenCalledWith(workspaceExportState.data);
  });

  it("creates a private venture note with an optional topic and reference link", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    savedStartupsState.data = [{ id: 12, idea: "A clinic compliance workspace", createdAt: new Date("2026-08-12"), interestTopicId: 2, interestOtherText: null, blueprint }];
    workspaceState.data = { roadmap: [], scenarios: [], riskRegister: [], crisisResponsePlans: [], notes: [] };
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /careloop/i }));

    fireEvent.change(screen.getByPlaceholderText("Note title"), { target: { value: "Pilot interview evidence" } });
    fireEvent.change(screen.getByPlaceholderText("Topic (optional)"), { target: { value: "Customer research" } });
    fireEvent.change(screen.getByPlaceholderText(/Write related research/i), { target: { value: "Capture the repeated pain points from the first clinic interviews." } });
    fireEvent.change(screen.getByPlaceholderText(/Reference link/i), { target: { value: "https://example.com/interview-notes" } });
    fireEvent.click(screen.getByRole("button", { name: "Save note" }));

    expect(addNoteMutate).toHaveBeenCalledWith({
      savedBlueprintId: 12,
      title: "Pilot interview evidence",
      topic: "Customer research",
      content: "Capture the repeated pain points from the first clinic interviews.",
      referenceUrl: "https://example.com/interview-notes",
    });
  });
});
