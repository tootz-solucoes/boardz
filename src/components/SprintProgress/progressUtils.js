export function getProgressFillWidth(pct) {
  return Math.max(0, Math.min(pct, 100));
}

export function getProgressFillClassName({ pct, lagging }) {
  if (pct >= 100) {
    return "sprint-bar-fill sprint-bar-fill--complete";
  }

  return `sprint-bar-fill${lagging ? " sprint-bar-fill--lagging" : ""}`;
}

export function getProgressPctClassName({ pct, lagging }) {
  if (pct >= 100) {
    return "sprint-row-pct sprint-row-pct--complete";
  }

  return `sprint-row-pct${lagging ? " sprint-row-pct--lagging" : ""}`;
}
