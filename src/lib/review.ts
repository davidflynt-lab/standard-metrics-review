import fixture from "@/data/suggestions.json";
export type Status =
  "Ready" | "Needs review" | "Conflict" | "Approved" | "Rejected";
export type Suggestion = Omit<(typeof fixture)[number], "status"> & {
  status: Status;
};
export const initialSuggestions: Suggestion[] = fixture.map((row) => ({
  ...row,
  status: row.status as Status,
}));
export const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
export function correctMapping(row: Suggestion, metric: string): Suggestion {
  return {
    ...row,
    metric,
    period:
      row.id === "arr-deck"
        ? metric === "ARR"
          ? "As of Jun 30, 2026"
          : "Q2 2026, inferred"
        : row.period,
  };
}
export function canApprove(row: Suggestion): boolean {
  return (
    row.status === "Ready" ||
    (row.id === "arr-deck" &&
      row.status === "Needs review" &&
      row.metric === "ARR" &&
      row.period === "As of Jun 30, 2026")
  );
}
export function approveRows(
  rows: Suggestion[],
  ids: string[],
  draft?: Suggestion,
): Suggestion[] {
  return rows.map((row) => {
    const candidate = draft?.id === row.id ? draft : row;
    return ids.includes(row.id) && canApprove(candidate)
      ? { ...candidate, status: "Approved", reason: "Reviewed · Not published" }
      : row;
  });
}
export function workflowCounts(rows: Suggestion[]) {
  return {
    All: 48,
    Ready: 33 + rows.filter((r) => r.status === "Ready").length - 3,
    "Needs review":
      9 + rows.filter((r) => r.status === "Needs review").length - 2,
    Conflict: 6 + rows.filter((r) => r.status === "Conflict").length - 1,
    Approved: rows.filter((r) => r.status === "Approved").length,
  };
}
