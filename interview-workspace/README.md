# Editable interview workspace

Four 1440px-wide frames, prepared without screenshots:

1. `01-strategy-alignment.svg`: candidate context, 4 assumptions, 4 open questions, AI workflow narrative.
2. `02-review-queue.svg`: 6 HarborCloud rows, 5 filters and an illustrative active selection bar.
3. `03-grounded-review.svg`: 58/42 split, source evidence highlights, mapping warning, inputs, normalization and actions.
4. `04-co-design-sandbox.svg`: duplicate review composed from named modules, 3 layout placeholders and 6 blank sticky notes.

## Fast SVG import

Drag the four SVG files onto a Figma Design canvas. They contain named vector groups and text, with resolved fills for importer compatibility. Shared token names are recorded in SVG metadata and `tokens.json`. SVG import may convert text to vector outlines; use the native helper below when editable text is required.

## Native editable import (recommended for live co-design)

In Figma Design, choose **Plugins → Development → Import plugin from manifest**, select `native-import-plugin/manifest.json`, and run **Standard Metrics Interview Workspace**.

The helper creates all four frames, native editable text nodes, named movable module frames, and shared color variables. It runs locally and requests no network access. Each run creates another copy; run once in a blank canvas. No Figma MCP quota is consumed. Font: Inter, substituting for the web prototype's Arial/Helvetica because Arial was unavailable in the MCP font inventory.

This helper has been syntax-checked but has not been executed in the Figma editor. SVG XML and layout bounds were checked headlessly; visual quality has not been screenshot-verified.

## Figma MCP limitation

The MCP created this file, then hit the Starter-plan tool-call limit before any frames were added:
https://www.figma.com/design/Oa4BncBNTuFORkR9c3MPSd

That file is blank until the SVGs or native helper are imported. The SVG/native fallback fulfills the requested offline workspace package; do not present the empty file as a completed canvas.

## Deliberate differences from the app

The queue canvas shows the selected-state bar as an illustrative design state; the app shows it only after selecting ready items. The source-grounded frame shows the uncorrected state, so its period remains inferred; changing the metric in the app produces the as-of date correction. Other form fields are source-backed and read-only in the implemented golden path. Sandbox notes and approval-gate alternatives are intentionally unfinished.
