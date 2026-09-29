import { useState } from "react";
import { FileText, Minus, Plus, Cloud, FileSpreadsheet } from "lucide-react";
import { money, type Suggestion } from "@/lib/review";
export function SourceEvidence({
  row,
  focus,
}: {
  row: Suggestion;
  focus: string;
}) {
  const [zoom, setZoom] = useState(100);
  const deck = row.id === "arr-deck";
  return (
    <section aria-label="Source evidence" className="evidence-pane">
      <div className="evidence-toolbar">
        <div className="flex items-start gap-2">
          <FileText size={18} className="mt-1 shrink-0" />
          <div>
            <p className="font-medium">
              {deck ? "HarborCloud — Q2 Board Update.pdf" : row.source}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {deck ? "Page 8 of 18" : "Synthetic source excerpt"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="icon-button"
            aria-label="Zoom out"
            disabled={zoom <= 80}
            onClick={() => setZoom((z) => z - 10)}
          >
            <Minus size={16} />
          </button>
          <span className="font-mono text-sm">{zoom}%</span>
          <button
            className="icon-button"
            aria-label="Zoom in"
            disabled={zoom >= 130}
            onClick={() => setZoom((z) => z + 10)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="document-canvas">
        <article className="document-page" style={{ width: `${zoom}%` }}>
          <p className="eyebrow">HarborCloud</p>
          <h2 className="mt-6 text-3xl font-semibold">
            {deck
              ? "Q2 Board Update"
              : row.kind === "connected"
                ? "Accounting report"
                : "Financial summary"}
          </h2>
          <p className="mt-4 text-sm text-slate-600">
            {deck ? (
              <>
                Reporting date:{" "}
                <mark className={focus === "date" ? "focused" : ""}>
                  June 30, 2026
                </mark>
              </>
            ) : (
              row.period
            )}
          </p>
          <div className="mt-12 border-t border-slate-300 pt-6">
            <h3 className="text-xl font-medium">Operating metrics</h3>
            <p className="mt-3 mb-8 text-sm text-slate-600">
              {deck ? (
                <mark className={focus === "units" ? "focused" : ""}>
                  USD in millions
                </mark>
              ) : (
                "USD · Reporting period as stated above"
              )}
            </p>
            {deck ? (
              <>
                <div className="document-metric">
                  <mark
                    className={
                      focus === "metric" || focus === "value" ? "focused" : ""
                    }
                  >
                    ARR: 5.6
                  </mark>
                </div>
                <div className="document-line">
                  <span>Cash balance</span>
                  <span>4.8</span>
                </div>
                <div className="document-line">
                  <span>Average monthly net burn</span>
                  <span>0.3</span>
                </div>
                <p className="mt-10 text-sm leading-relaxed text-slate-500">
                  Annual recurring revenue at quarter end. Figures shown in
                  millions of US dollars.
                </p>
              </>
            ) : (
              <>
                <p className="document-metric">
                  <mark>
                    {row.sourceLabel}: {money(row.amount)}
                  </mark>
                </p>
                <p className="mt-8 text-sm text-slate-500">{row.source}</p>
                {row.id === "revenue-workbook" && (
                  <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed">
                    Same metric and period in QuickBooks P&L:{" "}
                    <strong>$1,200,000 USD</strong>. Difference: $60,000 (5%). A
                    source decision is still required.
                  </div>
                )}
              </>
            )}
          </div>
          <footer className="document-footer">
            HarborCloud · Confidential · {deck ? "8" : "Source excerpt"}
          </footer>
        </article>
      </div>
      <p className="evidence-breadcrumb">
        {deck
          ? "Page 8 → Operating metrics → ARR → June 30, 2026"
          : row.source + " → " + row.sourceLabel}
      </p>
      <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">
        {row.kind === "connected" ? (
          <Cloud size={14} className="inline mr-2" />
        ) : row.kind === "spreadsheet" ? (
          <FileSpreadsheet size={14} className="inline mr-2" />
        ) : null}
        Synthetic evidence reconstructed for this prototype.
      </p>
    </section>
  );
}
