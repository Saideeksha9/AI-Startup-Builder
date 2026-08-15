import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPageEditor from "./LandingPageEditor";

const updateMutate = vi.fn();
const refetch = vi.fn();
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

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, loading: false }) }));
vi.mock("@/components/AppNavigation", () => ({ AppNavigation: () => <div data-testid="app-navigation" /> }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    blueprint: {
      list: { useQuery: () => ({ data: [record], isLoading: false, refetch }) },
      updateLandingPage: { useMutation: () => ({ mutate: updateMutate, isPending: false, isSuccess: false, error: null }) },
    },
  },
}));

describe("LandingPageEditor", () => {
  beforeEach(() => {
    updateMutate.mockClear();
    window.history.replaceState({}, "", "/landing/15/edit");
  });

  it("edits and saves landing-page content for the selected saved venture", () => {
    render(<LandingPageEditor />);

    fireEvent.change(screen.getByLabelText("Hero headline"), { target: { value: "Run clinic compliance with confidence." } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateMutate).toHaveBeenCalledWith(expect.objectContaining({ savedBlueprintId: 15, landingPage: expect.objectContaining({ heroHeadline: "Run clinic compliance with confidence." }) }));
    expect(screen.getByRole("button", { name: "Export HTML" })).toBeInTheDocument();
  });
});
