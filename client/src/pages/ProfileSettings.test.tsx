import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileSettings from "./ProfileSettings";

const updateMutate = vi.fn();
const invalidateProfile = vi.fn();
const authState = { user: { name: "Cherry" }, isAuthenticated: true, loading: false, logout: vi.fn() };
const profileData = {
  account: { name: "Cherry", email: "cherry@example.com" },
  profile: { fullName: "Cherry Founder", jobTitle: "CEO", companyName: "Cherry Studio", preferredFocus: "Validation", weeklyDigest: true, onboardingEmailTips: true },
  onboarding: { completedSteps: [], dismissed: false, savedVentureCount: 0 },
};

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => authState }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    profile: {
      get: { useQuery: () => ({ data: profileData, isLoading: false, isError: false }) },
      update: { useMutation: () => ({ mutate: updateMutate, isPending: false, isError: false }) },
    },
    useUtils: () => ({ profile: { get: { invalidate: invalidateProfile } } }),
  },
}));

describe("ProfileSettings", () => {
  beforeEach(() => {
    updateMutate.mockClear();
    invalidateProfile.mockClear();
  });

  it("shows account-owned profile fields and persists updated preferences", () => {
    render(<ProfileSettings />);

    expect(screen.getByDisplayValue("cherry@example.com")).toBeInTheDocument();
    expect(screen.getByText("Passwordless account access")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Preferred name"), { target: { value: "Cherry Patel" } });
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

    expect(updateMutate).toHaveBeenCalledWith({ fullName: "Cherry Patel", jobTitle: "CEO", companyName: "Cherry Studio", preferredFocus: "Validation", weeklyDigest: true, onboardingEmailTips: true });
  });
});
