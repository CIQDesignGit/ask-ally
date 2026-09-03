import { fixtures, getFixtureById } from "@/fixtures";
import type { FixtureEntry } from "@/types";

/**
 * Intent matcher — picks a fixture from user text or an explicit nextTurnId.
 * This is the seam where a real ACP/LLM call would plug in later.
 */
export function matchFixture(
  input: string,
  explicitId?: string
): FixtureEntry {
  if (explicitId) {
    const byId = getFixtureById(explicitId);
    if (byId) return byId;
  }

  const normalized = input.toLowerCase().trim();

  // Prefer longest keyword match
  let best: { fixture: FixtureEntry; score: number } | null = null;
  for (const fixture of fixtures) {
    for (const phrase of fixture.match) {
      if (normalized.includes(phrase)) {
        const score = phrase.length;
        if (!best || score > best.score) {
          best = { fixture, score };
        }
      }
    }
  }

  if (best) return best.fixture;

  // Default to categories-missed-plan demo so every ask gets a rich answer
  return getFixtureById("gap-categories")!;
}
