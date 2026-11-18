import assert from "node:assert/strict";
import { dedupeCitations } from "./healthtech_citations.ts";

const result = dedupeCitations([
  { title: "Guideline", query: "appointments", url: "https://example.org/guide/", excerpt: "A" },
  { title: "Guideline copy", query: "appointments", url: "https://example.org/guide", excerpt: "B" },
  { title: "Study", query: "appointments", url: "https://example.org/study", excerpt: "C" },
]);
assert.deepEqual(result.citations.map((item) => item.title), ["Guideline", "Study"]);
assert.equal(result.operationalNotification.status, "human-review");
console.log("citation decision test passed");
