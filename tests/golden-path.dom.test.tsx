import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act } from "react";

test("rendered DOM golden path: queue, evidence, correction, approval and undo", async () => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div id="root"></div></body></html>',
    { url: "http://localhost/" },
  );
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
    requestAnimationFrame: (cb: () => void) => setTimeout(cb, 0),
  }))
    Object.defineProperty(globalThis, key, { value, configurable: true });
  const { createRoot } = await import("react-dom/client");
  const { ReviewWorkspace } =
    await import("../src/components/review-workspace");
  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  const text = (element: Element) =>
    element.textContent?.replace(/\s+/g, " ").trim() || "";
  const button = (name: string) => {
    const found = Array.from(container.querySelectorAll("button")).find(
      (e) => text(e) === name,
    );
    assert.ok(found, "Missing button: " + name);
    return found;
  };
  const field = (name: string) => {
    const label = Array.from(container.querySelectorAll("label")).find(
      (e) => e.childNodes[0]?.textContent?.trim() === name,
    );
    const input = label?.querySelector("input");
    assert.ok(input, "Missing field: " + name);
    return input;
  };
  try {
    await act(async () => root.render(<ReviewWorkspace />));
    assert.equal(container.querySelectorAll("tbody tr").length, 6);
    assert.equal(container.querySelectorAll(".filter").length, 5);
    for (const label of [
      "All48",
      "Ready for review33",
      "Needs review9",
      "Source conflicts6",
      "Approved0",
    ])
      assert.ok(
        Array.from(container.querySelectorAll(".filter")).some(
          (e) => text(e).replaceAll(" ", "") === label.replaceAll(" ", ""),
        ),
      );
    const row = Array.from(container.querySelectorAll("tbody tr")).find((e) =>
      text(e).includes("Board deck p. 8"),
    )!;
    await act(async () =>
      (row.querySelectorAll("td")[2] as HTMLElement).click(),
    );
    assert.equal(container.querySelectorAll(".evidence-pane mark").length, 3);
    for (const evidence of ["ARR: 5.6", "USD in millions", "June 30, 2026"])
      assert.ok(
        Array.from(container.querySelectorAll("mark")).some(
          (e) => text(e) === evidence,
        ),
      );
    assert.ok(container.textContent?.includes("Page 8 of 18"));
    assert.ok(
      container.textContent?.includes(
        "The source labels this value ARR. The suggestion maps it to GAAP Revenue.",
      ),
    );
    assert.ok(
      container
        .querySelector(".normalization")
        ?.textContent?.includes("5.6 × 1,000,000 = 5,600,000 USD"),
    );
    assert.equal(button("Approve correction & next").disabled, true);
    const select = container.querySelector("select")!;
    await act(async () => {
      select.value = "ARR";
      select.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
    assert.ok(
      container
        .querySelector(".notice.success")
        ?.textContent?.includes("Correction preview: ARR"),
    );
    assert.equal(field("Period type").value, "As of date");
    assert.equal(field("Period").value, "As of Jun 30, 2026");
    assert.equal(field("Period").readOnly, true);
    await act(async () => button("Approve correction & next").click());
    assert.ok(
      Array.from(container.querySelectorAll(".filter")).some(
        (e) => text(e) === "Approved1",
      ),
    );
    const approved = Array.from(container.querySelectorAll("tbody tr")).find(
      (e) => text(e).includes("Board deck p. 8"),
    )!;
    assert.ok(approved.querySelector(".status-approved"));
    assert.ok(
      Array.from(approved.querySelectorAll("button")).some(
        (e) => text(e) === "ARR",
      ),
    );
    assert.ok(
      container
        .querySelector(".snackbar")
        ?.textContent?.includes("Correction approved"),
    );
    assert.ok(container.textContent?.includes("$1,200,000"));
    await act(async () => button("Undo").click());
    assert.ok(
      Array.from(container.querySelectorAll(".filter")).some(
        (e) => text(e) === "Approved0",
      ),
    );
    assert.ok(
      Array.from(container.querySelectorAll("tbody tr")).some(
        (e) =>
          text(e).includes("Board deck p. 8") &&
          text(e).includes("GAAP Revenue"),
      ),
    );
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
