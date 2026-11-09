import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = await import(pathToFileURL(path.join(root, ".local/browser/node_modules/playwright/index.mjs")));
const base = process.argv[2] ?? "http://127.0.0.1:8087/rimweave-docs/";
const review = path.join(root, ".local/review");
await mkdir(review, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const failures = [];
const pages = [];

async function noOverflow(page, name) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  const dimensions = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }));
  assert(dimensions.width <= page.viewportSize().width + 1, `${name}: layout enlarged the viewport ${JSON.stringify(dimensions)}`);
  assert(dimensions.content <= dimensions.width + 1, `${name}: document overflows horizontally ${JSON.stringify(dimensions)}`);
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1050 }, reducedMotion: "reduce" });
  desktop.setDefaultTimeout(10000);
  desktop.on("pageerror", error => errors.push(error.message));
  desktop.on("response", response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  await desktop.goto(base, { waitUntil: "networkidle" });
  await desktop.locator("#search-query:enabled").waitFor();
  assert.match(await desktop.locator("h1").innerText(), /RimWeave for/);
  await noOverflow(desktop, "desktop home");
  await desktop.screenshot({ path: path.join(review, "home-desktop.png"), fullPage: true });
  pages.push("desktop home");

  await desktop.getByRole("link", { name: "See how it works", exact: true }).click();
  await desktop.waitForURL("**/getting-started/index.html");
  assert.match(await desktop.locator("h1").innerText(), /What RimWeave does/);
  await noOverflow(desktop, "desktop introduction");
  await desktop.screenshot({ path: path.join(review, "introduction-desktop.png"), fullPage: true });
  pages.push("getting started navigation");

  await desktop.goto(new URL("concepts/origins.html", base).href, { waitUntil: "networkidle" });
  assert.match(await desktop.locator("article").innerText(), /A source reference is a string/);
  await desktop.screenshot({ path: path.join(review, "origins-desktop.png"), fullPage: true });
  await noOverflow(desktop, "desktop origins");
  pages.push("origins guide");

  await desktop.locator("#search-query:enabled").fill("Unknown");
  await desktop.locator("#search-results a").first().waitFor();
  const searchLinks = await desktop.locator("#search-results a").evaluateAll(links => links.map(link => link.href));
  assert(searchLinks.some(link => link.includes("concepts/origins.html")), "Origins guide absent from search results");
  await desktop.screenshot({ path: path.join(review, "search-desktop.png"), fullPage: true });
  pages.push("search returns origins guide");

  await desktop.goto(new URL("api/RimWeave.Health.HediffOperations.html", base).href, { waitUntil: "networkidle" });
  assert.match(await desktop.locator("article").innerText(), /ArgumentNullException/);
  assert.match(await desktop.locator("article").innerText(), /Pawn pawn, Hediff hediff/);
  await noOverflow(desktop, "desktop API");
  await desktop.screenshot({ path: path.join(review, "api-desktop.png"), fullPage: true });
  pages.push("generated API contract");

  await desktop.getByRole("button", { name: "Change theme", exact: true }).click();
  const dark = desktop.getByRole("link", { name: "Dark", exact: true });
  await dark.click();
  assert.equal(await desktop.locator("html").getAttribute("data-bs-theme"), "dark");
  await noOverflow(desktop, "dark API");
  await desktop.screenshot({ path: path.join(review, "api-dark.png"), fullPage: true });
  pages.push("dark theme");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1, reducedMotion: "reduce" });
  mobile.setDefaultTimeout(10000);
  mobile.on("pageerror", error => errors.push(error.message));
  mobile.on("response", response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  await mobile.goto(base, { waitUntil: "networkidle" });
  await noOverflow(mobile, "mobile home");
  await mobile.screenshot({ path: path.join(review, "home-mobile.png"), fullPage: true });
  await mobile.getByRole("button", { name: "Toggle navigation" }).click();
  await mobile.getByRole("link", { name: "How it works", exact: true }).click();
  await mobile.waitForURL("**/concepts/contributions.html");
  await mobile.waitForLoadState("networkidle");
  await mobile.getByRole("button", { name: "Show table of contents" }).click();
  await mobile.getByRole("link", { name: "What caused this effect?", exact: true }).first().click();
  await mobile.waitForURL("**/concepts/origins.html");
  await noOverflow(mobile, "mobile origins");
  await mobile.screenshot({ path: path.join(review, "origins-mobile.png"), fullPage: true });
  pages.push("mobile navigation and origins");
  await mobile.goto(new URL("getting-started/index.html", base).href, { waitUntil: "networkidle" });
  await noOverflow(mobile, "mobile introduction");
  await mobile.screenshot({ path: path.join(review, "introduction-mobile.png"), fullPage: true });
  pages.push("mobile introduction");
  await mobile.goto(new URL("api/RimWeave.Health.ContributionQueries.html", base).href, { waitUntil: "networkidle" });
  await noOverflow(mobile, "mobile API");
  pages.push("mobile API");

  assert.deepEqual(errors, [], "Browser script errors");
  assert.deepEqual(failures, [], "Failed browser requests");
  const result = { checked: pages, javascriptErrors: errors, failedRequests: failures };
  await writeFile(path.join(review, "browser-results.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
