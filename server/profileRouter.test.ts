import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getFounderOnboarding: vi.fn(),
  getUserProfile: vi.fn(),
  listSavedBlueprints: vi.fn(),
  upsertFounderOnboarding: vi.fn(),
  upsertUserProfile: vi.fn(),
}));

import { getFounderOnboarding, getUserProfile, listSavedBlueprints, upsertFounderOnboarding, upsertUserProfile } from "./db";
import { profileRouter } from "./routers/profile";

function caller(userId = 42) {
  return profileRouter.createCaller({ user: { id: userId, name: "Cherry", email: "cherry@example.com" } } as never);
}

describe("profile router", () => {
  beforeEach(() => {
    vi.mocked(getUserProfile).mockReset();
    vi.mocked(getFounderOnboarding).mockReset();
    vi.mocked(listSavedBlueprints).mockReset();
    vi.mocked(upsertUserProfile).mockReset();
    vi.mocked(upsertFounderOnboarding).mockReset();
    vi.mocked(getUserProfile).mockResolvedValue(undefined);
    vi.mocked(getFounderOnboarding).mockResolvedValue(undefined);
    vi.mocked(listSavedBlueprints).mockResolvedValue([]);
  });

  it("returns safe defaults and account-owned onboarding data", async () => {
    vi.mocked(getFounderOnboarding).mockResolvedValue({ completedSteps: '["review_workspace"]', dismissed: false } as never);
    vi.mocked(listSavedBlueprints).mockResolvedValue([{ id: 9 }] as never);

    const result = await caller().get();

    expect(result.account).toEqual({ name: "Cherry", email: "cherry@example.com" });
    expect(result.profile.weeklyDigest).toBe(true);
    expect(result.onboarding).toEqual({ completedSteps: ["review_workspace"], dismissed: false, savedVentureCount: 1 });
    expect(getUserProfile).toHaveBeenCalledWith(42);
  });

  it("updates profile preferences only for the authenticated account", async () => {
    await caller().update({ fullName: "Cherry Founder", jobTitle: "CEO", companyName: null, preferredFocus: "Validation", weeklyDigest: false, onboardingEmailTips: true });

    expect(upsertUserProfile).toHaveBeenCalledWith({ userId: 42, fullName: "Cherry Founder", jobTitle: "CEO", companyName: null, preferredFocus: "Validation", weeklyDigest: false, onboardingEmailTips: true });
  });

  it("persists only the validated onboarding checklist steps for the authenticated account", async () => {
    await caller().updateOnboarding({ completedSteps: ["review_workspace", "review_workspace", "ask_advisor"], dismissed: false });

    expect(upsertFounderOnboarding).toHaveBeenCalledWith({ userId: 42, completedSteps: '["review_workspace","ask_advisor"]', dismissed: false });
  });
});
