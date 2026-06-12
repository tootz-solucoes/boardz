import test from "node:test";
import assert from "node:assert/strict";
import {
  getProgressFillWidth,
  getProgressFillClassName,
  getProgressPctClassName,
} from "./progressUtils.js";

test("caps fill width at 100% when progress exceeds total", () => {
  assert.equal(getProgressFillWidth(135), 100);
});

test("keeps original width when progress is within range", () => {
  assert.equal(getProgressFillWidth(72), 72);
});

test("uses completion color when progress reaches 100%", () => {
  assert.equal(getProgressFillClassName({ pct: 100, lagging: false }), "sprint-bar-fill sprint-bar-fill--complete");
});

test("uses completion color when progress exceeds 100%", () => {
  assert.equal(getProgressFillClassName({ pct: 135, lagging: true }), "sprint-bar-fill sprint-bar-fill--complete");
});

test("uses completion color for the percentage label at 100%", () => {
  assert.equal(getProgressPctClassName({ pct: 100, lagging: false }), "sprint-row-pct sprint-row-pct--complete");
});
