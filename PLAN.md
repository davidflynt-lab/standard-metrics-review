You are building the interactive prototype for Standard Metrics based on the design specification below.

OPERATIONAL RULES:
• Strict token conservation: Do not use vision or computer use actions. No screenshot loops or cursor tracking.
• Headless execution: Use filesystem and terminal MCP tools only to create files, write code, and run builds.
• Verification: Run `npm run build` headlessly in terminal after each major step. Output only terminal error messages if a build fails.
• Stack: Next.js (App Router), Tailwind CSS, Lucide icons, and local static JSON fixture data.

STEP 0: SAVE BLUEPRINT
Write this complete specification to a file named PLAN.md in the project root before writing any component code.

=======================================================
STANDARD METRICS PROTOTYPE SPECIFICATION
=======================================================

1. Core Persona and Premise
• Primary user: A VC portfolio analyst reviewing quarterly company reporting packets.
• Crucial financial rule: $1.2M GAAP Revenue and $1.4M ARR are not conflicting values. One is discrete recognized period revenue; the other is annualized forward recurring revenue.
• The demo showcases a classification correction: the model mislabels a board deck ARR figure as GAAP Revenue. The user fixes the classification, retains both values, and inspects normalized data.

2. Golden Click Path Scope
• Screen 1 (Review Queue): Renders a clean table with 6 synthetic rows for HarborCloud.
• Transition: Clicking Row 2 (HarborCloud · GAAP Revenue · $5,600,000 · Board deck p. 8 · Needs review) opens Screen 2.
• Screen 2 (Grounding and Review): 58/42 split screen. 
  - Left pane: Document viewer showing simulated page 8 of "HarborCloud — Q2 Board Update.pdf" with multi token bounding box highlights over "ARR: 5.6", "USD in millions", and "June 30, 2026".
  - Right pane: Proposed ledger entry showing the conflict explanation, editable fields, and the normalization math (5.6 × 1,000,000 = 5,600,000 USD).
• Correction Interaction: Changing the Standard Metric dropdown from "GAAP Revenue" to "ARR" updates the period to "As of Jun 30, 2026" and displays a green correction preview banner.
• Approval Action: Clicking "Approve correction & next" records the item into the approved set, returns to Screen 1, and surfaces an Undo snackbar.

3. Synthetic Fixture Dataset (Queue Rows)
Row 1: HarborCloud | GAAP Revenue | $1,200,000 USD | Apr 1 to Jun 30, 2026 | QuickBooks P&L | Status: Ready
Row 2: HarborCloud | GAAP Revenue | $5,600,000 USD | Q2 2026, inferred | Board deck p. 8 | Status: Needs review (Source label says ARR)
Row 3: HarborCloud | GAAP Revenue | $1,260,000 USD | Apr 1 to Jun 30, 2026 | Finance workbook Summary!D12 | Status: Conflict (QuickBooks reports $1,200,000)
Row 4: HarborCloud | Cash Balance | $4,800,000 USD | As of Jun 30, 2026 | QuickBooks Balance sheet | Status: Ready
Row 5: HarborCloud | COGS | $240,000 USD | Apr 1 to Jun 30, 2026 | QuickBooks P&L | Status: Ready
Row 6: HarborCloud | Net Burn | $300,000 USD/mo | Q2 monthly average | Board deck p. 9 | Status: Needs review (Period interpretation)

4. Screen 1 Layout (Review Queue)
• Header: "Review financial data" · Subtitle: "Q2 2026 reporting · 12 companies · 48 suggestions · No changes published to portfolio ledger"
• Workflow filters: All (48), Ready for review (33), Needs review (9), Source conflicts (6)
• Table columns: Checkbox, Company / Suggested Metric, Proposed Value, Period, Source, Review Reason, Action
• Bottom sticky bar: Triggers when checkboxes are selected. Shows explicit count: "X suggestions selected across Y companies" with "Approve selected" button.

5. Screen 2 Layout (Source Grounded Review)
• Breadcrumb: "← Review queue / HarborCloud · Suggested GAAP Revenue / Needs review"
• Left Pane (58% width): Document evidence toolbar ("HarborCloud — Q2 Board Update.pdf", Page 8 of 18, Zoom controls). Canvas rendering page text with visible highlights over ARR 5.6 and date. Evidence breadcrumb: "Page 8 → Operating metrics → ARR → June 30, 2026".
• Right Pane (42% width):
  - Warning banner: "Check the metric mapping. The source labels this value ARR. The suggestion maps it to GAAP Revenue."
  - Form fields: Standard Metric (editable dropdown), Value ($5,600,000), Currency (USD), Source Scale (Millions), Period Type (As of date), Period (Jun 30, 2026).
  - Normalization callout: "Source value: 5.6 · Normalization: 5.6 × 1,000,000 = 5,600,000 USD".
  - Confidence pill: "Extraction: High · Metric mapping: Needs review · Date: Explicit · Units: Explicit".
  - Footer actions: "Skip for now", "Reject suggestion", and primary "Approve correction & next".

=======================================================
EXECUTION INSTRUCTIONS
=======================================================
1. Write this plan to PLAN.md.
2. Initialize and scaffold the Next.js components cleanly.
3. Build the interactive state machine for the golden click path.
4. Run `npm run build` in the terminal to verify zero type or lint errors.

Start now by saving PLAN.md and scaffolding the components.