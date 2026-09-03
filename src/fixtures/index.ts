/**
 * Fixture catalog for Ask Ally — conversation-script templates.
 * Answers use AnswerPayload.sections for rich layouts.
 */
export {
  defaultScope,
  currentPeriodScope,
  suggestedQuestionGroups,
  gapCategories,
  skinCareDrivers,
  campaignBudgetCut,
  babyCareAvailability,
  chronicBb90d,
} from "./conversations-gap";

export {
  wowPortfolio,
  wowSkinCare,
  wowSerumsSkus,
} from "./conversations-wow";

export {
  bbOffToday,
  bbSellersCrossCat,
  promoCompliance,
} from "./conversations-store";

export {
  mapViolations,
  fileEcho,
  automationMap,
  promoDashboardPreview,
  deckOutline,
  gapToPlanCurrent,
  disambiguation,
  staleData,
} from "./conversations-actions";

import type { FixtureEntry } from "@/types";

import {
  babyCareAvailability,
  campaignBudgetCut,
  chronicBb90d,
  gapCategories,
  skinCareDrivers,
} from "./conversations-gap";
import {
  automationMap,
  deckOutline,
  disambiguation,
  fileEcho,
  gapToPlanCurrent,
  mapViolations,
  promoDashboardPreview,
  staleData,
} from "./conversations-actions";
import {
  bbOffToday,
  bbSellersCrossCat,
  promoCompliance,
} from "./conversations-store";
import { wowPortfolio, wowSerumsSkus, wowSkinCare } from "./conversations-wow";

/** Legacy id alias so older chips / docs still resolve */
const gapToPlanAlias: FixtureEntry = {
  ...gapCategories,
  id: "gap-to-plan",
  match: ["__alias_gap_to_plan__"],
};

const skinCareMissAlias: FixtureEntry = {
  ...skinCareDrivers,
  id: "skin-care-miss",
  match: ["__alias_skin_care_miss__"],
};

const statusPromoAlias: FixtureEntry = {
  ...promoCompliance,
  id: "status-promo",
  match: ["__alias_status_promo__"],
};

const heatstripAlias: FixtureEntry = {
  ...chronicBb90d,
  id: "heatstrip-bb",
  match: ["__alias_heatstrip__"],
};

const dashboardGapAlias: FixtureEntry = {
  ...promoDashboardPreview,
  id: "dashboard-gap",
  match: ["__alias_dashboard_gap__"],
};

export const fixtures: FixtureEntry[] = [
  gapCategories,
  gapToPlanAlias,
  skinCareDrivers,
  skinCareMissAlias,
  campaignBudgetCut,
  babyCareAvailability,
  chronicBb90d,
  heatstripAlias,
  wowPortfolio,
  wowSkinCare,
  wowSerumsSkus,
  bbOffToday,
  bbSellersCrossCat,
  promoCompliance,
  statusPromoAlias,
  mapViolations,
  fileEcho,
  automationMap,
  promoDashboardPreview,
  dashboardGapAlias,
  deckOutline,
  gapToPlanCurrent,
  disambiguation,
  staleData,
];

export function getFixtureById(id: string): FixtureEntry | undefined {
  return fixtures.find((f) => f.id === id);
}
