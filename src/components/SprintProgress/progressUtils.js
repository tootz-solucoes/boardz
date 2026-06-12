export function getProgressFillWidth(pct) {
  return Math.max(0, Math.min(pct, 100));
}

export function getProgressFillClassName({ pct, lagging }) {
  if (pct >= 100) {
    return "sprint-bar-fill sprint-bar-fill--complete";
  }

  return `sprint-bar-fill${lagging ? " sprint-bar-fill--lagging" : ""}`;
}
