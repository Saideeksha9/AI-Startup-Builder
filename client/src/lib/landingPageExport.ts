export type EditableLandingPage = {
  startupName: string;
  landingPage: {
    heroHeadline: string;
    heroSubheadline: string;
    ctaButtonText: string;
    features: Array<{ title: string; description: string }>;
  };
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export function landingPageFileName(startupName: string) {
  const stem = startupName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "startup";
  return `${stem}-landing-page.html`;
}

export function buildLandingPageHtml(landingDocument: EditableLandingPage) {
  const page = landingDocument.landingPage;
  const features = page.features.map(feature => `<article class="feature"><div class="feature-mark">✦</div><h2>${escapeHtml(feature.title)}</h2><p>${escapeHtml(feature.description)}</p></article>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(landingDocument.startupName)}</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; } body { margin: 0; color: #0f172a; background: #f8fafc; }
    .hero { min-height: 62vh; display: grid; place-items: center; padding: 6rem 1.5rem; background: radial-gradient(circle at 15% 20%, #dbeafe, transparent 32%), radial-gradient(circle at 86% 18%, #e0e7ff, transparent 30%), #f8fafc; text-align: center; }
    .hero-inner { max-width: 58rem; } .eyebrow { color: #2563eb; font-weight: 800; font-size: .75rem; letter-spacing: .18em; text-transform: uppercase; }
    h1 { margin: 1rem auto 0; max-width: 52rem; font-size: clamp(2.8rem, 7vw, 5.6rem); line-height: .98; letter-spacing: -.055em; }
    .subheadline { max-width: 42rem; margin: 1.5rem auto 0; color: #475569; font-size: clamp(1.05rem, 2vw, 1.25rem); line-height: 1.7; }
    .cta { display: inline-flex; margin-top: 2rem; padding: .9rem 1.35rem; border: 0; border-radius: 999px; background: #2563eb; color: #fff; font: inherit; font-weight: 800; cursor: pointer; box-shadow: 0 14px 30px rgba(37,99,235,.25); }
    .cta:hover { background: #1d4ed8; } .features { max-width: 72rem; display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1.25rem; margin: -2rem auto 0; padding: 0 1.5rem 5rem; }
    .feature { border: 1px solid #e2e8f0; border-radius: 1.5rem; padding: 2rem; background: #fff; box-shadow: 0 8px 24px rgba(15,23,42,.05); } .feature-mark { color: #2563eb; }
    .feature h2 { margin: 1.35rem 0 0; font-size: 1.3rem; letter-spacing: -.025em; } .feature p { margin: .8rem 0 0; color: #475569; line-height: 1.65; }
    @media (max-width: 760px) { .hero { min-height: auto; padding: 5rem 1.25rem 6.5rem; } .features { grid-template-columns: 1fr; margin-top: -1.75rem; padding: 0 1.25rem 3.5rem; } }
  </style>
</head>
<body>
  <main>
    <section class="hero"><div class="hero-inner"><p class="eyebrow">${escapeHtml(landingDocument.startupName)}</p><h1>${escapeHtml(page.heroHeadline)}</h1><p class="subheadline">${escapeHtml(page.heroSubheadline)}</p><button class="cta" type="button" onclick="this.textContent='Thanks — we will be in touch'">${escapeHtml(page.ctaButtonText)}</button></div></section>
    <section class="features">${features}</section>
  </main>
</body>
</html>`;
}

export function downloadLandingPageHtml(landingDocument: EditableLandingPage) {
  const blob = new Blob([buildLandingPageHtml(landingDocument)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = landingPageFileName(landingDocument.startupName);
  anchor.click();
  URL.revokeObjectURL(url);
}
