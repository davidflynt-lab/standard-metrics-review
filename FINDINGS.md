# Standard Metrics — verification and interview findings

Production: https://standard-metrics-review.vercel.app

## Verified outcomes

- Public production URL returns HTTP 200 without a sign-in gate. Vercel production build is READY; TypeScript compilation and strict lint pass.
- All nine local tests pass: eight financial/workflow checks and one rendered-component golden-path test.
- The live HTML and **actual deployed JavaScript bundles** execute in headless JSDOM. Five filters, 48 portfolio suggestions and six HarborCloud rows are present.
- Clicking the board-deck $5.6M row opens review. Page 8, ARR 5.6, USD in millions and June 30 date highlights are present. The mapping warning and 5.6 × 1,000,000 = 5,600,000 USD normalization are visible.
- Mapping to ARR produces the green preview, an as-of period and a read-only June 30 date. Uncorrected mapping cannot be approved.
- Approval returns to the queue, shows Approved 1, retains ARR separately from $1.2M GAAP Revenue, and offers Undo. Undo restores the original mapping and counters.
- Bulk acceptance selects only the three ready records. The same-period workbook/QuickBooks revenue discrepancy remains blocked.
- No runtime or console errors occurred in the live DOM verification. Production CSS declares the 58/42 split.

## Latency notes

One live JSDOM sample: queue fetch + client hydration 555 ms; opening review 23 ms; correction preview 5 ms; staging 23 ms. A separate public HTTP fetch took 308 ms. These are environment-specific observations, not browser paint measurements or a performance benchmark.

## Verification limits

Local Playwright could not launch Chromium because the macOS execution sandbox rejected Mach process registration; neither browser test reached application assertions locally. The live JSDOM check verifies interactions but does not render CSS geometry. A GitHub Actions production browser run is being prepared. No screenshots, videos or traces were captured.

## Discussion points for Justin

1. **Metric governance:** ARR is point-in-time annualized recurring revenue; GAAP Revenue is recognized over a period. Mapping correction preserves both. Who owns the canonical definition and its allowed period types?
2. **Actual source conflict:** $1.26M workbook revenue vs $1.2M accounting revenue is a real same-period disagreement ($60k / 5%). Which source hierarchy and materiality rule should govern resolution?
3. **Batch approval:** Ready means explicit metric, period and units in this fixture. What additional checks, permissions or sampling are necessary before accepting a high-volume batch?
4. **Audit and publishing:** Approval is in-memory staging, not a ledger write. Refresh resets decisions. A production system needs persisted source versions, before/after mappings, actor/time and a separate permissioned commit boundary.
5. **Reusable correction rules:** A rule learned from this ARR correction needs scope, governance and review before applying to other companies or funds. No automation is implied by the prototype.
6. **Fixture scope:** Totals cover 48 illustrative portfolio suggestions; only six HarborCloud records are implemented. Source excerpts and confidence labels are synthetic, not live extraction or calibrated probabilities.

## Editable workspace

Four 1440px SVG frames and a native-text Figma import helper are in `interview-workspace/`. Headless checks confirm valid SVG XML and no out-of-bounds elements across 419 elements. The helper is syntax-checked; its execution in Figma is unverified.

The Figma MCP created https://www.figma.com/design/Oa4BncBNTuFORkR9c3MPSd, then reached the Starter-plan call limit before writing frames. That file is blank until the fallback package is imported. SVG text can import as outlines; the native helper creates editable text and shared color tokens.
