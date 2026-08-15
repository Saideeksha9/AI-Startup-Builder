import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ createLandingLead: vi.fn(), getSavedBlueprintPublic: vi.fn() }));
vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn() }));

import { createLandingLead, getSavedBlueprintPublic } from "./db";
import { notifyOwner } from "./_core/notification";
import { landingRouter } from "./routers/landing";

const blueprint = {
  startupName: "CareLoop",
  tagline: "Simpler compliance for independent clinics.",
  targetAudience: "Operations leaders at independent outpatient clinics handling recurring compliance work with lean teams.",
  businessModel: ["Tiered monthly SaaS subscriptions priced by clinic location.", "Usage-based add-ons for automated evidence collection.", "Annual implementation packages for multi-site clinic groups."],
  competitors: ["Vanta", "Drata", "MedTrainer"],
  marketingPlan: ["Interview clinic administrators to validate the highest-friction workflow.", "Publish templates in healthcare operations communities.", "Partner with specialised healthcare IT consultants for qualified referrals.", "Run targeted demos for regional clinic networks."],
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

const caller = () => landingRouter.createCaller({ user: null } as never);

describe("public landing lead procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSavedBlueprintPublic).mockResolvedValue({ id: 15, userId: 42, idea: "Clinic compliance", blueprint: JSON.stringify(blueprint) } as never);
  });

  it("returns only public landing content for an available saved venture", async () => {
    await expect(caller().getPublic({ savedBlueprintId: 15 })).resolves.toEqual({ savedBlueprintId: 15, startupName: "CareLoop", landingPage: blueprint.landingPage });
  });

  it("stores each CTA contact against the landing owner and notifies the registered project owner", async () => {
    vi.mocked(createLandingLead).mockResolvedValue(71);
    vi.mocked(notifyOwner).mockResolvedValue(true);

    await expect(caller().submitLead({ savedBlueprintId: 15, visitorName: "Jamie Visitor", visitorEmail: "jamie@example.com", companyName: "Northstar Clinic", message: "Please send pilot information." })).resolves.toEqual({ id: 71, notificationDelivered: true });

    expect(createLandingLead).toHaveBeenCalledWith({ userId: 42, savedBlueprintId: 15, visitorName: "Jamie Visitor", visitorEmail: "jamie@example.com", companyName: "Northstar Clinic", message: "Please send pilot information." });
    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New landing lead for CareLoop", content: expect.stringContaining("jamie@example.com") }));
  });

  it("does not persist a contact against an unavailable landing page", async () => {
    vi.mocked(getSavedBlueprintPublic).mockResolvedValue(undefined);

    await expect(caller().submitLead({ savedBlueprintId: 99, visitorName: "Jamie Visitor", visitorEmail: "jamie@example.com" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(createLandingLead).not.toHaveBeenCalled();
  });
});
