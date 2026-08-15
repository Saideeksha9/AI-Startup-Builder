import { buildLandingPageHtml, landingPageFileName } from "./landingPageExport";
import { describe, expect, it } from "vitest";

const document = {
  startupName: "CareLoop AI",
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

describe("landing page HTML export", () => {
  it("builds a standalone escaped HTML page with the editable venture content", () => {
    const html = buildLandingPageHtml({ ...document, landingPage: { ...document.landingPage, heroHeadline: "Grow <safely> & clearly" } });

    expect(html).toContain("CareLoop AI");
    expect(html).toContain("Grow &lt;safely&gt; &amp; clearly");
    expect(html).toContain("Audit-ready evidence");
    expect(html).toContain("Thanks — we will be in touch");
  });

  it("creates a deterministic safe filename for standalone hosting", () => {
    expect(landingPageFileName("CareLoop AI")).toBe("careloop-ai-landing-page.html");
  });
});
