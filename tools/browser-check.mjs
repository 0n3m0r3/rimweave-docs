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

async function search(page, text) {
  await page.evaluate(() => { window.docfx.searchResultReady = false; });
  await page.locator("#search-query:enabled").fill(text);
  if (!text.trim()) {
    await page.waitForFunction(() => !document.body.hasAttribute("data-search"));
    return [];
  }
  await page.waitForFunction(() => window.docfx.searchResultReady);
  return page.locator("#search-results .sr-item a").evaluateAll(links => links.map(link => link.href));
}

async function checkSearch(page) {
  for (const [title, target] of [
    ["Prepare a provider removal", "guides/prepared-removal.html"],
    ["Check a missing provider", "guides/provider-removal.html"]
  ]) {
    for (const text of [title, `  ${title.toUpperCase().replaceAll(" ", "   ")}  `, `\t${title.replaceAll(" ", "\u00a0")}\t`]) {
      const links = await search(page, text);
      assert(links.length > 0 && new URL(links[0]).pathname.endsWith(target), `Title missing from first result: ${text}`);
    }
  }
  for (const [text, target] of [
    ["prepared", "guides/prepared-removal.html"],
    ["provider", "guides/prepared-removal.html"],
    ["providers", "guides/prepared-removal.html"],
    ["Unknown", "concepts/origins.html"],
    ["HediffOperations", "api/RimWeave.Health.HediffOperations.html"],
    ["RimWeave.Health.HediffOperations", "api/RimWeave.Health.HediffOperations.html"],
    ["HediffOperations.Remove()", "api/RimWeave.Health.HediffOperations.html"]
  ]) {
    assert((await search(page, text)).some(link => new URL(link).pathname.endsWith(target)), `No relevant result: ${text}`);
  }
  for (const text of ["a the and of", " : + - () ", "title:provider", "provider wordnotpresentanywhere"]) {
    assert.equal((await search(page, text)).length, 0, `Unexpected results: ${text}`);
    assert.match(await page.locator("#search-results").innerText(), /No results for/);
  }
  await search(page, "");
  await search(page, "provider");
  await search(page, "   ");
  // A pending worker response must not reopen results after clearing input.
  await page.evaluate(() => {
    window.docfx.searchResultReady = false;
    const input = document.getElementById("search-query");
    for (const value of ["provider", "   "]) {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await page.waitForFunction(() => window.docfx.searchResultReady);
  assert.equal(await page.locator("body").getAttribute("data-search"), null, "Late results reopened a cleared search");
  await search(page, "Prepare a provider removal");
}

function monitor(page) {
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
}

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
  monitor(desktop);
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
  await checkSearch(desktop);
  await noOverflow(desktop, "desktop title search");
  await desktop.screenshot({ path: path.join(review, "title-search-desktop.png"), fullPage: true });
  pages.push("desktop title, API, keyword and empty searches");

  // Real static hosts send ETags; the preview server does not. Exercise the
  // same index bytes with an ETag, then reload to cover IndexedDB restoration.
  const cachedContext = await browser.newContext();
  await cachedContext.route("**/index.json", async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), etag: '"search-browser-check"' } });
  });
  const cached = await cachedContext.newPage();
  cached.setDefaultTimeout(10000);
  monitor(cached);
  await cached.goto(base, { waitUntil: "networkidle" });
  await checkSearch(cached);
  const stored = await cached.evaluate(() => new Promise((resolve, reject) => {
    const open = indexedDB.open("docfx");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const database = open.result;
      const request = database.transaction("lunr").objectStore("lunr").get("index");
      request.onerror = () => { database.close(); reject(request.error); };
      request.onsuccess = () => { database.close(); resolve(JSON.parse(request.result)); };
    };
  }));
  assert.equal(stored.etag, '"search-browser-check"', "Search cache was not populated");
  await cached.reload({ waitUntil: "networkidle" });
  await checkSearch(cached);
  await cachedContext.close();
  pages.push("fresh and restored search cache");

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
  monitor(mobile);
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
  await mobile.getByRole("button", { name: "Toggle navigation" }).click();
  await checkSearch(mobile);
  await noOverflow(mobile, "mobile title search");
  await mobile.screenshot({ path: path.join(review, "title-search-mobile.png"), fullPage: true });
  pages.push("mobile title, API, keyword and empty searches");
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
