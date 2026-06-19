const BAR_BASE = "h-full rounded-lg transition-[width] duration-[800ms] ease-in";

export function getProgressFillWidth(pct) {
  return Math.max(0, Math.min(pct, 100));
}

export function getProgressFillClassName({ pct, lagging }) {
  if (pct >= 100) return `${BAR_BASE} bg-gradient-to-r from-[#0b7a60] to-emerald-500`;
  if (lagging) return `${BAR_BASE} bg-gradient-to-r from-[#92310e] to-orange-500`;
  return `${BAR_BASE} bg-gradient-to-r from-purple-deep to-purple-accent`;
}

export function getProgressPctClassName({ pct, lagging }) {
  const base = "w-[2.8em] shrink-0 text-[0.75em] text-right";
  if (pct >= 100) return `${base} text-emerald-400`;
  if (lagging) return `${base} text-orange-400`;
  return `${base} text-text-soft opacity-70`;
}
