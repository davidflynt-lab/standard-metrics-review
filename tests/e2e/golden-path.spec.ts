import { test, expect } from "@playwright/test";

test("golden path: queue → source → ARR correction → staged approval → undo", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const timings: Record<string, number> = {};
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  let began = performance.now();
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Review financial data" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Q2 2026 reporting · 12 companies · 48 suggestions · No changes published to portfolio ledger",
    ),
  ).toBeVisible();
  await expect(page.locator(".filter")).toHaveCount(5);
  for (const label of [
    /All\s*48/,
    /Ready for review\s*33/,
    /Needs review\s*9/,
    /Source conflicts\s*6/,
    /Approved\s*0/,
  ])
    await expect(
      page.getByRole("button", { name: label, exact: false }),
    ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await expect(
    page.locator("tbody tr").filter({ hasText: "HarborCloud" }),
  ).toHaveCount(6);
  timings.queueLoadMs = Math.round(performance.now() - began);
  began = performance.now();
  const row = page.locator("tbody tr").filter({ hasText: "Board deck p. 8" });
  await expect(row).toContainText("GAAP Revenue");
  await expect(row).toContainText("$5,600,000");
  await row.locator("td").nth(2).click();
  await expect(
    page.getByRole("heading", { name: "Proposed ledger entry" }),
  ).toBeVisible();
  timings.inspectionMs = Math.round(performance.now() - began);
  const grid = await page.locator(".review-grid").boundingBox();
  const evidence = await page.locator(".evidence-pane").boundingBox();
  expect(grid && evidence ? evidence.width / grid.width : 0).toBeCloseTo(
    0.58,
    2,
  );
  await expect(page.getByText("Page 8 of 18", { exact: true })).toBeVisible();
  await expect(page.locator("mark")).toHaveCount(3);
  for (const value of ["ARR: 5.6", "USD in millions", "June 30, 2026"])
    await expect(page.locator("mark").filter({ hasText: value })).toBeVisible();
  await expect(
    page.getByText(
      "The source labels this value ARR. The suggestion maps it to GAAP Revenue.",
    ),
  ).toBeVisible();
  await expect(page.locator(".normalization")).toContainText(
    "5.6 × 1,000,000 = 5,600,000 USD",
  );
  await expect(
    page.getByRole("button", { name: "Approve correction & next" }),
  ).toBeDisabled();
  began = performance.now();
  await page.getByLabel("Standard metric", { exact: true }).selectOption("ARR");
  await expect(page.locator(".notice.success")).toContainText(
    "Correction preview: ARR · As of Jun 30, 2026",
  );
  await expect(page.getByLabel("Period type", { exact: true })).toHaveValue(
    "As of date",
  );
  await expect(page.getByLabel("Period", { exact: true })).toHaveValue(
    "As of Jun 30, 2026",
  );
  await expect(page.getByLabel("Period", { exact: true })).toHaveAttribute(
    "readonly",
    "",
  );
  timings.reclassificationMs = Math.round(performance.now() - began);
  began = performance.now();
  await page.getByRole("button", { name: "Approve correction & next" }).click();
  await expect(
    page.getByRole("heading", { name: "Review financial data" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Approved\s*1/ }),
  ).toBeVisible();
  const approved = page
    .locator("tbody tr")
    .filter({ hasText: "Board deck p. 8" });
  await expect(
    approved.getByRole("button", { name: "ARR", exact: true }),
  ).toBeVisible();
  await expect(approved.locator(".status-approved")).toBeVisible();
  await expect(approved).toContainText("As of Jun 30, 2026");
  await expect(page.locator(".snackbar")).toContainText("Correction approved");
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeVisible();
  const revenue = page
    .locator("tbody tr")
    .filter({ hasText: "QuickBooks P&L" })
    .filter({ hasText: "GAAP Revenue" });
  await expect(revenue).toContainText("$1,200,000");
  timings.stagingMs = Math.round(performance.now() - began);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Approved\s*0/ }),
  ).toBeVisible();
  await expect(
    page.locator("tbody tr").filter({ hasText: "Board deck p. 8" }),
  ).toContainText("GAAP Revenue");
  await expect(
    page.locator("tbody tr").filter({ hasText: "Board deck p. 8" }),
  ).toContainText("Q2 2026, inferred");
  expect(errors).toEqual([]);
  await testInfo.attach("latency-notes", {
    body: JSON.stringify(timings, null, 2),
    contentType: "application/json",
  });
});

test("edge cases: selection excludes unresolved records; bulk approval; skip; rejection; reload", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("checkbox", { name: "Select all visible ready suggestions" })
    .check();
  await expect(page.locator("tbody input[type=checkbox]:checked")).toHaveCount(
    3,
  );
  await expect(page.locator("tbody input[type=checkbox]:disabled")).toHaveCount(
    3,
  );
  await page
    .getByRole("button", { name: "Approve selected", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Approved\s*3/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: /Source conflicts\s*6/ }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Review GAAP Revenue from Finance workbook Summary!D12",
    })
    .click();
  await expect(
    page.getByText("Same metric, different source values"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve & return" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByRole("button", { name: /All\s*48/ }).click();
  await page
    .getByRole("button", { name: "Review GAAP Revenue from Board deck p. 8" })
    .click();
  await page.getByRole("button", { name: "Reject suggestion" }).click();
  await expect(
    page.locator("tbody tr").filter({ hasText: "Board deck p. 8" }),
  ).toContainText("Rejected");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Approved\s*0/ }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(6);
});
