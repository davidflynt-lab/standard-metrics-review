import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialSuggestions,
  canApprove,
  correctMapping,
  approveRows,
  workflowCounts,
} from "../src/lib/review";
const deck = initialSuggestions.find((r) => r.id === "arr-deck")!;
test("six synthetic records preserve source normalization", () => {
  assert.equal(initialSuggestions.length, 6);
  for (const row of initialSuggestions)
    assert.equal(
      Math.round(row.sourceValue * row.scale * 100),
      Math.round(row.amount * 100),
    );
});
test("source ARR mislabeled as revenue cannot be approved", () => {
  assert.equal(canApprove(deck), false);
  assert.equal(
    approveRows(initialSuggestions, [deck.id]).find((r) => r.id === deck.id)
      ?.status,
    "Needs review",
  );
});
test("ARR correction updates date semantics and unlocks approval", () => {
  const corrected = correctMapping(deck, "ARR");
  assert.equal(corrected.period, "As of Jun 30, 2026");
  assert.equal(canApprove(corrected), true);
  assert.equal(corrected.amount, 5600000);
});
test("approved ARR retains ERP recognized revenue independently", () => {
  const next = approveRows(
    initialSuggestions,
    [deck.id],
    correctMapping(deck, "ARR"),
  );
  assert.equal(next.find((r) => r.id === deck.id)?.status, "Approved");
  assert.equal(next.find((r) => r.id === "revenue-erp")?.amount, 1200000);
  assert.equal(
    next.find((r) => r.id === "revenue-erp")?.metric,
    "GAAP Revenue",
  );
  assert.equal(workflowCounts(next)["Needs review"], 8);
  assert.equal(workflowCounts(next).Approved, 1);
});
test("bulk approval cannot approve unresolved issues or conflicts", () => {
  const next = approveRows(
    initialSuggestions,
    initialSuggestions.map((r) => r.id),
  );
  assert.equal(next.filter((r) => r.status === "Approved").length, 3);
  assert.equal(
    next.find((r) => r.id === "revenue-workbook")?.status,
    "Conflict",
  );
  assert.equal(next.find((r) => r.id === "burn-deck")?.status, "Needs review");
});
test("undo snapshot remains unchanged through approval", () => {
  const snapshot = structuredClone(initialSuggestions);
  approveRows(initialSuggestions, [deck.id], correctMapping(deck, "ARR"));
  assert.deepEqual(initialSuggestions, snapshot);
});
test("reverting metric restores inferred period and blocks approval", () => {
  const reverted = correctMapping(correctMapping(deck, "ARR"), "GAAP Revenue");
  assert.equal(reverted.period, "Q2 2026, inferred");
  assert.equal(canApprove(reverted), false);
});
test("portfolio counts remain distinct from six visible fixture records", () => {
  assert.deepEqual(workflowCounts(initialSuggestions), {
    All: 48,
    Ready: 33,
    "Needs review": 9,
    Conflict: 6,
    Approved: 0,
  });
});
