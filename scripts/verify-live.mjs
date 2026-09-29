import assert from "node:assert/strict";
import fs from "node:fs";
import { TextEncoder, TextDecoder } from "node:util";
import { JSDOM, VirtualConsole } from "jsdom";
const url =
  process.env.PROTOTYPE_URL || "https://standard-metrics-review.vercel.app/";
const output =
  process.env.FINDINGS_OUTPUT ||
  "/private/tmp/standard-metrics-live-findings.json";
const errors = [];
const findings = {
  url,
  checkedAt: new Date().toISOString(),
  method:
    "Live HTML and deployed JavaScript executed in JSDOM; no screenshots or visual layout verification",
  checks: [],
  timingsMs: {},
  runtimeErrors: errors,
};
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(e.message));
vc.on("error", (...args) => errors.push(args.join(" ")));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(predicate, label) {
  const started = performance.now();
  while (performance.now() - started < 20000) {
    if (predicate()) return;
    await delay(20);
  }
  throw new Error("Timed out: " + label + "; errors=" + JSON.stringify(errors));
}
async function main() {
  let began = performance.now();
  const dom = await JSDOM.fromURL(url, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      Object.assign(w, {
        TextEncoder,
        TextDecoder,
        ReadableStream,
        TransformStream,
        WritableStream,
        Headers,
        Request,
        Response,
        AbortController,
      });
      w.fetch = (path, options) => fetch(new URL(path, url), options);
      for (const method of ["mark", "measure", "clearMeasures", "clearMarks"])
        w.performance[method] = () => {};
    },
  });
  const d = dom.window.document;
  const text = (element) =>
    element?.textContent?.replace(/\s+/g, " ").trim() || "";
  const button = (label) =>
    [...d.querySelectorAll("button")].find((e) => text(e) === label);
  const field = (label) =>
    [...d.querySelectorAll("label")]
      .find((e) => e.childNodes[0]?.textContent?.trim() === label)
      ?.querySelector("input");
  const row = (source) =>
    [...d.querySelectorAll("tbody tr")].find((e) => text(e).includes(source));
  try {
    await until(
      () =>
        [...d.querySelectorAll("tbody button")].some((e) =>
          Object.keys(e).some((k) => k.startsWith("__reactProps$")),
        ),
      "queue hydration",
    );
    assert.equal(d.querySelectorAll(".filter").length, 5);
    assert.equal(d.querySelectorAll("tbody tr").length, 6);
    assert.ok(text(d.querySelector("main")).includes("48 suggestions"));
    for (const label of [
      "All48",
      "Ready for review33",
      "Needs review9",
      "Source conflicts6",
      "Approved0",
    ])
      assert.ok(
        [...d.querySelectorAll(".filter")].some((e) => text(e) === label),
        label,
      );
    assert.equal(
      [...d.querySelectorAll("tbody tr")].filter((e) =>
        text(e).includes("HarborCloud"),
      ).length,
      6,
    );
    findings.checks.push(
      "Queue: 48 total, five filters and six HarborCloud rows",
    );
    findings.timingsMs.queueHydration = Math.round(performance.now() - began);
    began = performance.now();
    row("Board deck p. 8").querySelectorAll("td")[2].click();
    await until(
      () => text(d.querySelector("h1")) === "Proposed ledger entry",
      "inspection",
    );
    findings.timingsMs.inspection = Math.round(performance.now() - began);
    assert.ok(text(d.body).includes("Page 8 of 18"));
    assert.equal(d.querySelectorAll("mark").length, 3);
    for (const evidence of ["ARR: 5.6", "USD in millions", "June 30, 2026"])
      assert.ok(
        [...d.querySelectorAll("mark")].some((e) => text(e) === evidence),
      );
    assert.ok(
      text(d.body).includes(
        "The source labels this value ARR. The suggestion maps it to GAAP Revenue.",
      ),
    );
    assert.ok(
      text(d.querySelector(".normalization")).includes(
        "5.6 × 1,000,000 = 5,600,000 USD",
      ),
    );
    assert.equal(button("Approve correction & next").disabled, true);
    findings.checks.push(
      "Inspection and grounding: page 8, three evidence tokens, mapping warning and normalization",
    );
    began = performance.now();
    const select = d.querySelector("select");
    select.value = "ARR";
    select.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    await until(
      () => !!d.querySelector(".notice.success"),
      "correction preview",
    );
    assert.equal(field("Period type").value, "As of date");
    assert.equal(field("Period").value, "As of Jun 30, 2026");
    assert.equal(field("Period").readOnly, true);
    findings.timingsMs.reclassification = Math.round(performance.now() - began);
    findings.checks.push(
      "Reclassification: green preview, as-of period and locked June 30 date",
    );
    began = performance.now();
    button("Approve correction & next").click();
    await until(
      () => !!row("Board deck p. 8")?.querySelector(".status-approved"),
      "staging",
    );
    assert.ok(
      [...row("Board deck p. 8").querySelectorAll("button")].some(
        (e) => text(e) === "ARR",
      ),
    );
    assert.ok(button("Approved1"));
    assert.ok(
      text(d.querySelector(".snackbar")).includes("Correction approved"),
    );
    assert.ok(button("Undo"));
    assert.ok(
      [...d.querySelectorAll("tbody tr")].some(
        (e) =>
          text(e).includes("QuickBooks P&L") &&
          text(e).includes("GAAP Revenue") &&
          text(e).includes("$1,200,000"),
      ),
    );
    findings.timingsMs.staging = Math.round(performance.now() - began);
    findings.checks.push(
      "Staging: Approved 1, approved ARR row, Undo and independent $1.2M GAAP Revenue",
    );
    button("Undo").click();
    await until(() => !!button("Approved0"), "undo");
    assert.ok(text(row("Board deck p. 8")).includes("GAAP Revenue"));
    assert.ok(text(row("Board deck p. 8")).includes("Q2 2026, inferred"));
    findings.checks.push("Undo restores original classification and counters");
    d.querySelector("thead input[type=checkbox]").click();
    await until(
      () => d.querySelectorAll("tbody input:checked").length === 3,
      "selection",
    );
    assert.equal(d.querySelectorAll("tbody input:disabled").length, 3);
    button("Approve selected").click();
    await until(() => !!button("Approved3"), "bulk approval");
    button("Undo").click();
    await until(() => !!button("Approved0"), "bulk undo");
    button("Source conflicts6").click();
    await until(
      () => d.querySelectorAll("tbody tr").length === 1,
      "conflict filter",
    );
    row("Finance workbook Summary!D12").querySelector("button").click();
    await until(
      () => text(d.querySelector("h1")) === "Proposed ledger entry",
      "conflict inspection",
    );
    assert.equal(button("Approve & return").disabled, true);
    assert.ok(text(d.body).includes("Same metric, different source values"));
    findings.checks.push(
      "Bulk acceptance excludes all unresolved records; true source conflict stays blocked",
    );
    const cssLinks = [...d.querySelectorAll("link[rel=stylesheet]")].map(
      (e) => e.href,
    );
    const css = (
      await Promise.all(
        cssLinks.map(async (path) => (await fetch(path)).text()),
      )
    ).join("\n");
    assert.match(css, /grid-template-columns:\s*58%\s+42%/);
    findings.checks.push(
      "Production CSS declares the 58/42 split; geometry not visually verified",
    );
    assert.deepEqual(errors, []);
    findings.result = "PASS";
  } finally {
    fs.writeFileSync(output, JSON.stringify(findings, null, 2) + "\n");
    dom.window.close();
  }
  console.log(JSON.stringify(findings, null, 2));
}
main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
