import {
  ArrowUpRight,
  Cloud,
  FileSpreadsheet,
  FileText,
  Check,
} from "lucide-react";
import {
  canApprove,
  money,
  workflowCounts,
  type Suggestion,
} from "@/lib/review";
import { StatusBadge } from "./status-badge";
export type Filter = "All" | "Ready" | "Needs review" | "Conflict" | "Approved";
const filters: [Filter, string][] = [
  ["All", "All"],
  ["Ready", "Ready for review"],
  ["Needs review", "Needs review"],
  ["Conflict", "Source conflicts"],
  ["Approved", "Approved"],
];
export function ReviewQueue({
  rows,
  filter,
  setFilter,
  selected,
  setSelected,
  onOpen,
  onApprove,
}: {
  rows: Suggestion[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  selected: string[];
  setSelected: (ids: string[]) => void;
  onOpen: (r: Suggestion) => void;
  onApprove: () => void;
}) {
  const visible = rows.filter((r) => filter === "All" || r.status === filter);
  const eligible = visible.filter((r) => r.status === "Ready" && canApprove(r));
  const allSelected =
    eligible.length > 0 && eligible.every((r) => selected.includes(r.id));
  const counts = workflowCounts(rows);
  return (
    <main className="queue-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Portfolio reporting</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Review financial data
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Q2 2026 reporting · 12 companies · 48 suggestions · No changes
            published to portfolio ledger
          </p>
        </div>
        <span className="quiet-label">Synthetic workflow prototype</span>
      </div>
      <nav
        aria-label="Review filters"
        className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4"
      >
        {filters.map(([key, label]) => (
          <button
            key={key}
            aria-pressed={filter === key}
            className={`filter ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="tabular-nums">{counts[key]}</span>
          </button>
        ))}
      </nav>
      <div className="mt-6 mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <p>
          {visible.length} HarborCloud suggestions shown · Counts above cover
          the full portfolio
        </p>
        <p className="flex items-center gap-2">
          <Check size={16} /> Approval stages a review decision
        </p>
      </div>
      <div className="table-wrap">
        <table>
          <caption className="sr-only">
            HarborCloud financial suggestions for Q2 2026
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-12">
                <input
                  type="checkbox"
                  aria-label="Select all visible ready suggestions"
                  checked={allSelected}
                  disabled={!eligible.length}
                  onChange={() =>
                    setSelected(
                      allSelected
                        ? selected.filter(
                            (id) => !eligible.some((r) => r.id === id),
                          )
                        : [
                            ...new Set([
                              ...selected,
                              ...eligible.map((r) => r.id),
                            ]),
                          ],
                    )
                  }
                />
              </th>
              <th scope="col">Company / Suggested metric</th>
              <th scope="col">Proposed value</th>
              <th scope="col">Period</th>
              <th scope="col">Source</th>
              <th scope="col">Review reason</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const Icon =
                row.kind === "connected"
                  ? Cloud
                  : row.kind === "spreadsheet"
                    ? FileSpreadsheet
                    : FileText;
              return (
                <tr
                  key={row.id}
                  onClick={(event) => {
                    if (!(event.target as HTMLElement).closest("button, input"))
                      onOpen(row);
                  }}
                  className={row.id === "arr-deck" ? "featured-row" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.metric} from ${row.source}`}
                      disabled={row.status !== "Ready"}
                      checked={selected.includes(row.id)}
                      onChange={() =>
                        setSelected(
                          selected.includes(row.id)
                            ? selected.filter((id) => id !== row.id)
                            : [...selected, row.id],
                        )
                      }
                    />
                  </td>
                  <td>
                    <span className="block text-sm text-slate-500">
                      {row.company}
                    </span>
                    <button className="metric-link" onClick={() => onOpen(row)}>
                      {row.metric}
                    </button>
                  </td>
                  <td className="font-mono tabular-nums whitespace-nowrap font-medium">
                    {money(row.amount)}
                    <span className="block text-sm font-sans text-slate-500">
                      USD{row.id === "burn-deck" ? " / mo" : ""}
                    </span>
                  </td>
                  <td className="max-w-40 text-sm leading-relaxed">
                    {row.period}
                  </td>
                  <td>
                    <span className="flex items-start gap-2 text-sm leading-relaxed">
                      <Icon
                        size={17}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />
                      {row.source}
                    </span>
                  </td>
                  <td className="max-w-48">
                    <StatusBadge status={row.status} />
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {row.reason}
                    </p>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Review ${row.metric} from ${row.source}`}
                      onClick={() => onOpen(row)}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-12 text-center text-slate-500">
            No suggestions in this review state.
          </p>
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-500">
        Ready = explicit metric, period and units. Mapping issues and source
        conflicts require individual review.
      </p>
      {!!selected.length && (
        <div className="selection-bar">
          <p>
            <strong>{selected.length} suggestions selected</strong> across{" "}
            {
              new Set(
                rows
                  .filter((r) => selected.includes(r.id))
                  .map((r) => r.company),
              ).size
            }{" "}
            companies
          </p>
          <div className="flex gap-3">
            <button className="button" onClick={() => setSelected([])}>
              Clear selection
            </button>
            <button className="button primary" onClick={onApprove}>
              Approve selected
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
