import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPreview from "./LandingPreview";

const storageKey = "autonomous-ai-startup-landing-preview";

vi.mock("@/components/AppNavigation", () => ({ AppNavigation: () => <div data-testid="app-navigation" /> }));

describe("LandingPreview", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("renders the saved generated landing page and completes its CTA interaction", () => {
    window.sessionStorage.setItem(storageKey, JSON.stringify({
      startupName: "CareLoop",
      landingPage: {
        heroHeadline: "Make clinic compliance work feel manageable.",
        heroSubheadline: "A clearer workflow for lean clinic teams.",
        ctaButtonText: "Start a pilot",
        features: [
          { title: "One source of truth", description: "Keep every compliance workflow together." },
          { title: "Deadline clarity", description: "See the next accountable action." },
          { title: "Audit-ready evidence", description: "Keep proof available when needed." },
        ],
      },
    }));

    render(<LandingPreview />);

    expect(screen.getByText("Make clinic compliance work feel manageable.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start a pilot" }));
    expect(screen.getByRole("status")).toHaveTextContent("CTA interaction recorded in this preview.");
  });
});
