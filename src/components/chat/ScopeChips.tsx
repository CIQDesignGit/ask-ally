import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ciq-dev/ciq-design-system";

import { currentPeriodScope, defaultScope } from "@/fixtures";
import { useAllyStore } from "@/store/ally-store";
import type { ScopeContext } from "@/types";

const chipTriggerClass =
  "h-7 w-auto max-w-[220px] gap-1 rounded-full border-border-default bg-surface-muted px-2.5 text-xs font-medium shadow-none";

const BRANDS = [
  "All brands",
  "Aurelle",
  "Kavi",
  "Tinytide",
  "Purecraft",
  "Brightline",
  "NutriPeak",
] as const;

const CATEGORIES = [
  "All categories",
  "Beauty & Personal Care",
  "Skin Care",
  "Baby Care",
  "Hair Care",
  "Home Cleaning",
  "Oral Care",
  "Vitamins",
] as const;

function categoryToPath(category: string): string[] {
  if (category === "All categories") return ["All categories"];
  if (category === "Beauty & Personal Care") return ["Beauty & Personal Care"];
  // Leaf categories sit under Beauty & Personal Care in this prototype
  if (
    category === "Skin Care" ||
    category === "Baby Care" ||
    category === "Hair Care" ||
    category === "Oral Care" ||
    category === "Vitamins" ||
    category === "Home Cleaning"
  ) {
    return ["Beauty & Personal Care", category];
  }
  return [category];
}

function pathToCategory(path: string[]): string {
  if (!path.length || path[0] === "All categories") return "All categories";
  if (path.length === 1) return path[0]!;
  return path[path.length - 1]!;
}

function tierForCategory(category: string): ScopeContext["tier"] {
  if (category === "All categories" || category === "Beauty & Personal Care") {
    return "business";
  }
  return "category";
}

/**
 * Interactive scope chips for the ask box.
 * Local workaround until CIQ PromptInput gets a `scoped` variant — see docs/CIQ_DS_CHANGELOG.md
 */
export function ScopeChips({ className }: { className?: string }) {
  const scope = useAllyStore((s) => s.scope);
  const setScope = useAllyStore((s) => s.setScope);
  const categoryValue = pathToCategory(scope.taxonomyPath);
  const brandValue = scope.brand || "All brands";

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className ?? ""}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Select
        value={scope.retailer}
        onValueChange={(v) => setScope({ retailer: v })}
      >
        <SelectTrigger className={chipTriggerClass} size="sm">
          <SelectValue placeholder="Retailer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Amazon US">Amazon US</SelectItem>
          <SelectItem value="Amazon CA">Amazon CA</SelectItem>
          <SelectItem value="Walmart US">Walmart US</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={brandValue}
        onValueChange={(v) =>
          setScope({
            brand: v,
            tier: v === "All brands" ? scope.tier : "brand",
          })
        }
      >
        <SelectTrigger className={chipTriggerClass} size="sm">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          {BRANDS.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoryValue}
        onValueChange={(v) =>
          setScope({
            taxonomyPath: categoryToPath(v),
            tier: tierForCategory(v),
          })
        }
      >
        <SelectTrigger className={chipTriggerClass} size="sm">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={scope.period.label}
        onValueChange={(v) => {
          const period: ScopeContext["period"] =
            v === currentPeriodScope.period.label
              ? currentPeriodScope.period
              : defaultScope.period;
          setScope({ period });
        }}
      >
        <SelectTrigger className={chipTriggerClass} size="sm">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={defaultScope.period.label}>
            {defaultScope.period.label}
          </SelectItem>
          <SelectItem value={currentPeriodScope.period.label}>
            {currentPeriodScope.period.label}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={scope.comparison}
        onValueChange={(v) =>
          setScope({ comparison: v as ScopeContext["comparison"] })
        }
      >
        <SelectTrigger className={chipTriggerClass} size="sm">
          <SelectValue placeholder="Comparison" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vs_plan">vs plan</SelectItem>
          <SelectItem value="vs_prior_period">vs prior period</SelectItem>
          <SelectItem value="vs_prior_year">vs prior year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
