# Standard Metrics financial review prototype

A rough, interactive midpoint design checkpoint with six synthetic HarborCloud suggestions. All data, source excerpts, confidence labels and portfolio totals are illustrative; no connected systems or live extraction are represented.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production verification: `npm run build` (includes TypeScript compilation and lint with zero warnings). Workflow checks: `npm test`.

## Golden path

1. Open the second row: GAAP Revenue · $5,600,000 · Board deck p. 8.
2. Inspect the highlighted ARR value, millions unit and June 30 date.
3. Change Standard metric to ARR. Preview preserves $5.6M ARR alongside $1.2M quarterly GAAP Revenue; it is a classification correction, not a source conflict.
4. Approve correction & next. The queue shows ARR, its point-in-time period and Approved status.
5. Undo restores the original mapping and workflow counts.

Filters, ready-item selection, bulk approval, skip, rejection, source zoom and field-to-evidence focus are functional. No unresolved mapping or source conflict can be bulk approved. Other rows allow evidence inspection; conflict resolution and burn-period editing are intentionally outside this two-screen golden path. Source-backed numeric fields are read-only.

Approval stages a review decision; it does not publish to a golden ledger. Changes are held in memory and reset on reload. Portfolio filter totals describe 48 illustrative suggestions; only the six HarborCloud fixtures are implemented and labeled as such. There is no backend, persistence, authentication, actual document rendering, calibrated model confidence, or export.

## Structure

- `PLAN.md`: complete original build brief, saved before component work.
- `src/data/suggestions.json`: synthetic source fixtures.
- `src/lib/review.ts`: mapping, approval safeguards and workflow counts.
- `src/components/review-workspace.tsx`: queue/review transitions and undo snapshot.
- `src/components/review-queue.tsx`: filters, selection and review queue.
- `src/components/grounding-review.tsx`: correction preview and review actions.
- `src/components/source-evidence.tsx`: simulated source evidence and highlights.

Verification uses headless compilation, strict linting, nine logic/DOM tests and a live deployed-JavaScript golden-path check. No computer use, screenshots, video or trace capture is used. Local Chromium execution is blocked by the macOS sandbox; GitHub Actions provides a Linux headless browser environment.

## Production and interview workspace

Live prototype: https://standard-metrics-review.vercel.app

`npm run verify:live` loads live HTML and client bundles in JSDOM and checks the full correction flow plus safeguards. `npm run test:e2e` runs Playwright against a local production server; set `PROTOTYPE_URL` to run it against production. First install its browser with `npx playwright install chromium`. The GitHub verification workflow can be dispatched with the production URL.

See `FINDINGS.md` for checked outcomes and limitations, and `interview-workspace/README.md` for four SVG frames and the native Figma import helper.
