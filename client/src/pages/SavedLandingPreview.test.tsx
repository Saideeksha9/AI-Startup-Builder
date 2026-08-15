import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SavedLandingPreview from "./SavedLandingPreview";

const record = {
  id: 15,
  blueprint: {
    startupName: "CareLoop",
    landingPage: {
      heroHeadline: "Make clinic compliance work feel manageable.",
      heroSubheadline: "CareLoop helps independent clinics organise recurring compliance work without endless spreadsheets.",
      ctaButtonText: "See your workflow",
      features: [
        { title: "One source of truth", description: "Keep work, owners, and evidence in one organised space." },
        { title: "Deadline clarity", description: "Turn requirements into visible and accountable workflow steps." },
        { title: "Audit-ready evidence", description: "Collect documentation without rebuilding the trail from scratch." },
      ],
    },
  },
};

vi.mock("@/components/AppNavigation", () => ({ AppNavigation: () => <div data-testid="app-navigation" /> }));
vi.mock("@/lib/trpc", () => ({ trpc: { blueprint: { list: { useQuery: () => ({ data: [record], isLoading: false }) } } } }));

describe("SavedLandingPreview", () => {
  beforeEach(() => window.history.replaceState({}, "", "/landing/15/preview"));

  it("renders a selected saved venture and keeps its CTA interactive", () => {
    render(<SavedLandingPreview />);

    expect(screen.getByText("Make clinic compliance work feel manageable.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "See your workflow" }));
    expect(screen.getByRole("status")).toHaveTextContent("CTA interaction recorded in this preview.");
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
