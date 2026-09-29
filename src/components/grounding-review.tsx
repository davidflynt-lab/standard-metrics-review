import { useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  canApprove,
  correctMapping,
  money,
  type Suggestion,
} from "@/lib/review";
import { StatusBadge } from "./status-badge";
import { SourceEvidence } from "./source-evidence";
export function GroundingReview({
  row,
  onBack,
  onApprove,
  onReject,
}: {
  row: Suggestion;
  onBack: () => void;
  onApprove: (row: Suggestion) => void;
  onReject: () => void;
}) {
  const [draft, setDraft] = useState(row);
  const [focus, setFocus] = useState("metric");
  const isMapping = row.id === "arr-deck";
  const corrected = isMapping && draft.metric === "ARR";
  const terminal = row.status === "Approved" || row.status === "Rejected";
  return (
    <main className="review-shell">
      <nav aria-label="Breadcrumb" className="review-breadcrumb">
        <button className="button flex items-center gap-2" onClick={onBack}>
          <ArrowLeft size={17} />
          Review queue
        </button>
        <span aria-hidden="true">/</span>
        <span>HarborCloud · Suggested {row.metric}</span>
        <span aria-hidden="true">/</span>
        <StatusBadge status={row.status} />
      </nav>
      <div className="review-grid">
        <SourceEvidence row={row} focus={focus} />
        <section aria-labelledby="entry-title" className="entry-pane">
          <div className="entry-content">
            <p className="eyebrow">Human review</p>
            <h1 id="entry-title" className="mt-2 text-2xl font-semibold">
              Proposed ledger entry
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              HarborCloud · Q2 2026 reporting
            </p>
            {isMapping && !terminal && (
              <div
                className={`notice mt-6 ${corrected ? "success" : "warning"}`}
                role="status"
              >
                {corrected ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <AlertTriangle size={19} />
                )}
                <div>
                  <p className="font-medium">
                    {corrected
                      ? "Correction preview: ARR · As of Jun 30, 2026"
                      : "Check the metric mapping"}
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {corrected
                      ? "Keep ARR at $5,600,000 and QuickBooks GAAP Revenue at $1,200,000 as separate metrics. Neither value replaces the other."
                      : "The source labels this value ARR. The suggestion maps it to GAAP Revenue."}
                  </p>
                </div>
              </div>
            )}
            {row.status === "Conflict" && (
              <div className="notice warning mt-6">
                <AlertTriangle size={19} />
                <div>
                  <p className="font-medium">
                    Same metric, different source values
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Workbook revenue is $1,260,000; QuickBooks revenue is
                    $1,200,000 for the same quarter. Resolve the source
                    difference before approval.
                  </p>
                </div>
              </div>
            )}
            {row.id === "burn-deck" && (
              <div className="notice warning mt-6">
                <AlertTriangle size={19} />
                <p className="leading-relaxed">
                  The source describes average monthly net burn. Confirm the
                  averaging period before approval.
                </p>
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="col-span-2 field">
                Standard metric
                <select
                  value={draft.metric}
                  disabled={!isMapping || terminal}
                  onFocus={() => setFocus("metric")}
                  onChange={(e) =>
                    setDraft(correctMapping(draft, e.target.value))
                  }
                >
                  {[
                    "GAAP Revenue",
                    "ARR",
                    "Cash Balance",
                    "COGS",
                    "Net Burn",
                  ].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Value
                <input
                  className="font-mono"
                  value={money(draft.amount)}
                  readOnly
                  onFocus={() => setFocus("value")}
                />
              </label>
              <label className="field">
                Currency
                <input value="USD" readOnly onFocus={() => setFocus("units")} />
              </label>
              <label className="field">
                Source scale
                <input
                  value={row.scale === 1000000 ? "Millions" : "Units"}
                  readOnly
                  onFocus={() => setFocus("units")}
                />
              </label>
              <label className="field">
                Period type
                <input
                  value={
                    draft.period.startsWith("As of")
                      ? "As of date"
                      : row.id === "burn-deck"
                        ? "Monthly average"
                        : "Reporting period"
                  }
                  readOnly
                  onFocus={() => setFocus("date")}
                />
              </label>
              <label className="col-span-2 field">
                Period
                <input
                  value={draft.period}
                  readOnly
                  onFocus={() => setFocus("date")}
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              {isMapping
                ? "Change the metric mapping to update its period meaning. Source value and units stay fixed to the evidence."
                : "Evidence inspection only for this row; the working correction path is the board deck ARR suggestion."}
            </p>
            <div className="normalization">
              <p className="eyebrow">Source normalization</p>
              <p className="mt-3 text-sm">
                Source value:{" "}
                <span className="font-mono">{row.sourceValue}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Normalization:{" "}
                <span className="font-mono">
                  {row.sourceValue} × {row.scale.toLocaleString("en-US")} ={" "}
                  {row.amount.toLocaleString("en-US")} USD
                </span>
              </p>
            </div>
            <p className="confidence">
              Extraction: High · Metric mapping:{" "}
              {isMapping && !corrected
                ? "Needs review"
                : row.status === "Conflict"
                  ? "Source conflict"
                  : row.status === "Approved"
                    ? "Reviewed"
                    : corrected
                      ? "Corrected"
                      : "Source-aligned"}{" "}
              · Date:{" "}
              {isMapping
                ? "Explicit"
                : row.id === "burn-deck"
                  ? "Needs review"
                  : "Explicit"}{" "}
              · Units: Explicit
            </p>
            {isMapping && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                ARR is an annualized recurring revenue measure at a point in
                time. GAAP Revenue is recognized revenue across a period.
              </p>
            )}
          </div>
          <footer className="entry-actions">
            <div className="flex flex-wrap gap-2">
              <button className="button" onClick={onBack}>
                Skip for now
              </button>
              <button
                className="button reject"
                disabled={terminal}
                onClick={onReject}
              >
                Reject suggestion
              </button>
            </div>
            <button
              className="button primary w-full justify-center"
              disabled={!canApprove(draft) || terminal}
              onClick={() => onApprove(draft)}
            >
              {isMapping ? "Approve correction & next" : "Approve & return"}
              <ArrowRight size={17} />
            </button>
            <p className="text-sm text-slate-500">
              Approval does not publish to the portfolio ledger.
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
