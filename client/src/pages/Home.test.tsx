import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

const mutate = vi.fn();
const saveMutate = vi.fn();
const resetGenerate = vi.fn();
const refetchSavedBlueprints = vi.fn();
const mutationState: {
  data: unknown;
  isPending: boolean;
  error: { message: string } | null;
} = {
  data: undefined,
  isPending: false,
  error: null,
};

const savedBlueprintsState: {
  data: unknown[] | undefined;
  isLoading: boolean;
  error: { message: string } | null;
} = {
  data: [],
  isLoading: false,
  error: null,
};

const saveBlueprintState: {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: { message: string } | null;
} = {
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
};

const authState = {
  user: null as { name: string | null } | null,
  loading: false,
  isAuthenticated: false,
  logout: vi.fn(),
};

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    blueprint: {
      generate: {
        useMutation: () => ({ ...mutationState, mutate, reset: resetGenerate }),
      },
      save: {
        useMutation: () => ({ ...saveBlueprintState, mutate: saveMutate }),
      },
      list: {
        useQuery: () => ({ ...savedBlueprintsState, refetch: refetchSavedBlueprints }),
      },
    },
  },
}));

const blueprint = {
  startupName: "CareLoop",
  tagline: "Simpler compliance for independent clinics.",
  targetAudience: "Operations leaders at independent outpatient clinics handling recurring compliance work with lean teams.",
  businessModel: [
    "Tiered monthly SaaS subscriptions priced by clinic location.",
    "Usage-based add-ons for automated evidence collection.",
    "Annual implementation packages for multi-site clinic groups.",
  ],
  competitors: ["Vanta", "Drata", "MedTrainer"],
  marketingPlan: [
    "Interview clinic administrators to validate the highest-friction compliance workflow.",
    "Publish compliance workflow templates in healthcare operations communities.",
    "Partner with specialised healthcare IT consultants for qualified referrals.",
    "Run targeted demos for regional clinic networks using a time-saved calculator.",
  ],
  landingPage: {
    heroHeadline: "Make clinic compliance work feel manageable.",
    heroSubheadline: "CareLoop organises tasks, evidence, and deadlines so lean clinic teams can stay audit-ready without endless spreadsheets.",
    ctaButtonText: "See your workflow",
    features: [
      {
        title: "One source of truth",
        description: "Keep every policy, task, owner, and proof point in a single organised workspace.",
      },
      {
        title: "Deadline clarity",
        description: "Turn recurring requirements into visible, accountable workflows that teams can complete on time.",
      },
      {
        title: "Audit-ready evidence",
        description: "Collect and retrieve the documentation you need without rebuilding the trail from scratch.",
      },
    ],
  },
};

describe("Home", () => {
  beforeEach(() => {
    mutate.mockClear();
    saveMutate.mockClear();
    resetGenerate.mockClear();
    refetchSavedBlueprints.mockClear();
    mutationState.data = undefined;
    mutationState.isPending = false;
    mutationState.error = null;
    savedBlueprintsState.data = [];
    savedBlueprintsState.isLoading = false;
    savedBlueprintsState.error = null;
    saveBlueprintState.isPending = false;
    saveBlueprintState.isSuccess = false;
    saveBlueprintState.isError = false;
    saveBlueprintState.error = null;
    authState.user = null;
    authState.loading = false;
    authState.isAuthenticated = false;
  });

  it("shows the empty prompt before an idea is generated", () => {
    render(<Home />);

    expect(screen.getByText("Begin with an idea.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Describe a startup idea...")).toBeInTheDocument();
  });

  it("shows the exact loading message while a blueprint is generating", () => {
    mutationState.isPending = true;
    render(<Home />);

    expect(screen.getByText("Strategizing...")).toBeInTheDocument();
    expect(screen.getByText("Generate")).toHaveClass("hidden", "sm:inline");
  });

  it("shows an inline validation alert for an underspecified idea", () => {
    render(<Home />);

    fireEvent.change(screen.getByPlaceholderText("Describe a startup idea..."), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please describe your startup idea in at least 10 characters.",
    );
    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows saved blueprints to an authenticated user and opens one on selection", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    savedBlueprintsState.data = [
      {
        id: 8,
        idea: "A platform that makes recurring clinic compliance easier for lean teams.",
        blueprint,
        createdAt: new Date("2026-08-12T00:00:00.000Z"),
      },
    ];

    render(<Home />);

    expect(screen.getByText("Saved blueprints")).toBeInTheDocument();
    expect(screen.getByText("New generations are saved here automatically.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /careloop/i }));
    expect(resetGenerate).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Business Strategy")).toBeInTheDocument();
  });

  it("shows an accurate save-failure status and inline error to an authenticated user", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    mutationState.data = blueprint;
    saveBlueprintState.isError = true;
    saveBlueprintState.error = { message: "We could not save this blueprint. Please try again." };

    render(<Home />);

    expect(screen.getByText("Save failed")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("We could not save this blueprint. Please try again.");
  });

  it("shows an inline alert when saved history cannot be loaded", () => {
    authState.user = { name: "Cherry 99" };
    authState.isAuthenticated = true;
    savedBlueprintsState.error = { message: "We could not load your saved blueprints. Please try again." };

    render(<Home />);

    expect(screen.getByRole("alert")).toHaveTextContent("We could not load your saved blueprints. Please try again.");
  });

  it("renders all generated blueprint sections and required landing-page elements", () => {
    mutationState.data = blueprint;
    const { container } = render(<Home />);

    expect(screen.getAllByText("CareLoop")).toHaveLength(2);
    expect(screen.getByText("Business Strategy")).toBeInTheDocument();
    expect(screen.getByText("Marketing Plan")).toBeInTheDocument();
    expect(screen.getByText("Generated Landing Page")).toBeInTheDocument();
    expect(screen.getByText("Vanta")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText(blueprint.landingPage.heroHeadline)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /see your workflow/i })).toBeInTheDocument();
    expect(screen.getByText("One source of truth")).toBeInTheDocument();
    expect(screen.getByText("Deadline clarity")).toBeInTheDocument();
    expect(screen.getByText("Audit-ready evidence")).toBeInTheDocument();
    expect(container.querySelector(".lg\\:grid-cols-2")).toBeInTheDocument();
    expect(container.querySelector(".lg\\:grid-cols-3")).toBeInTheDocument();
  });
});
