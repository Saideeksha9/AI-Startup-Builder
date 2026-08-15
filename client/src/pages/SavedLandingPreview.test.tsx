import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SavedLandingPreview from "./SavedLandingPreview";

const record = {
  savedBlueprintId: 15,
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
};

const submitLead = vi.fn();

vi.mock("@/components/AppNavigation", () => ({ AppNavigation: () => <div data-testid="app-navigation" /> }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { landing: { getPublic: { useQuery: () => ({ data: record, isLoading: false }) }, submitLead: { useMutation: (options?: { onSuccess?: (data: { id: number; notificationDelivered: boolean }) => void }) => ({ isPending: false, error: null, mutate: (value: unknown) => { submitLead(value); options?.onSuccess?.({ id: 7, notificationDelivered: true }); } }) } } } }));

describe("SavedLandingPreview", () => {
  beforeEach(() => window.history.replaceState({}, "", "/landing/15/preview"));

  beforeEach(() => submitLead.mockClear());

  it("captures a visitor contact through the CTA and reports success", () => {
    render(<SavedLandingPreview />);

    expect(screen.getByText("Make clinic compliance work feel manageable.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "See your workflow" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jamie Visitor" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jamie@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));
    expect(submitLead).toHaveBeenCalledWith(expect.objectContaining({ savedBlueprintId: 15, visitorName: "Jamie Visitor", visitorEmail: "jamie@example.com" }));
    expect(screen.getByRole("status")).toHaveTextContent("Thanks — the registered project owner was notified.");
  });
});
