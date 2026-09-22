export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function formatScopeChips(scope: {
  retailer: string;
  brand?: string;
  taxonomyPath: string[];
  period: { label: string };
  comparison: string;
}): string[] {
  const comparisonLabel =
    scope.comparison === "vs_plan"
      ? "vs plan"
      : scope.comparison === "vs_prior_period"
        ? "vs prior period"
        : "vs prior year";

  const category =
    !scope.taxonomyPath.length || scope.taxonomyPath[0] === "All categories"
      ? "All categories"
      : scope.taxonomyPath[scope.taxonomyPath.length - 1]!;

  return [
    scope.retailer,
    scope.brand || "All brands",
    category,
    scope.period.label,
    comparisonLabel,
  ];
}

/** Drop `**` emphasis markers so answer copy can be streamed as plain text. */
export function stripEmphasis(text: string): string {
  return text.replace(/\*\*/g, "");
}

export function autoTitle(question: string, scopeLabel: string): string {
  const q = question.trim().slice(0, 48);
  return q.length < question.trim().length ? `${q}… · ${scopeLabel}` : `${q} · ${scopeLabel}`;
}

export function startOfIsoWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().slice(0, 10);
}
