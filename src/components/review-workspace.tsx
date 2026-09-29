"use client";
import { useRef, useState } from "react";
import { BarChart3, Undo2, X } from "lucide-react";
import { initialSuggestions, approveRows, type Suggestion } from "@/lib/review";
import { ReviewQueue, type Filter } from "./review-queue";
import { GroundingReview } from "./grounding-review";
export function ReviewWorkspace() {
  const [rows, setRows] = useState(initialSuggestions);
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [undo, setUndo] = useState<{
    rows: Suggestion[];
    message: string;
  } | null>(null);
  const heading = useRef<HTMLDivElement>(null);
  const current = rows.find((r) => r.id === active);
  function returnToQueue() {
    setActive(null);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function save(next: Suggestion[], message: string) {
    setUndo({ rows, message });
    setRows(next);
    setSelected([]);
    setFilter("All");
    returnToQueue();
  }
  return (
    <>
      <header className="app-header">
        <button
          onClick={returnToQueue}
          className="brand"
          aria-label="Standard Metrics · Return to review queue"
        >
          <BarChart3 size={23} />
          <span>Standard Metrics</span>
        </button>
        <span className="text-sm text-slate-500">
          Portfolio workspace <span className="mx-3 text-slate-300">/</span>{" "}
          Financial review
        </span>
        <span className="avatar" aria-label="Portfolio analyst">
          DF
        </span>
      </header>
      <div ref={heading} tabIndex={-1} className="workspace-focus">
        {current ? (
          <GroundingReview
            key={current.id}
            row={current}
            onBack={returnToQueue}
            onApprove={(draft) =>
              save(
                approveRows(rows, [draft.id], draft),
                draft.id === "arr-deck"
                  ? "Correction approved · ARR retained alongside GAAP Revenue"
                  : "Suggestion approved · Not published",
              )
            }
            onReject={() =>
              save(
                rows.map((r) =>
                  r.id === current.id
                    ? {
                        ...r,
                        status: "Rejected",
                        reason: "Rejected in review · Not published",
                      }
                    : r,
                ),
                "Suggestion rejected",
              )
            }
          />
        ) : (
          <ReviewQueue
            rows={rows}
            filter={filter}
            setFilter={setFilter}
            selected={selected}
            setSelected={setSelected}
            onOpen={(row) => {
              setActive(row.id);
              requestAnimationFrame(() => heading.current?.focus());
            }}
            onApprove={() =>
              save(
                approveRows(rows, selected),
                `${selected.length} suggestions approved · Not published`,
              )
            }
          />
        )}
      </div>
      {undo && (
        <div
          className="snackbar"
          style={{ bottom: selected.length ? 112 : 24 }}
        >
          <p role="status">{undo.message}</p>
          <button
            className="flex items-center gap-2 font-medium"
            onClick={() => {
              setRows(undo.rows);
              setUndo(null);
              setSelected([]);
            }}
          >
            <Undo2 size={17} />
            Undo
          </button>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setUndo(null)}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
