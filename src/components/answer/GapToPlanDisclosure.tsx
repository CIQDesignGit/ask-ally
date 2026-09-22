import { cn } from "@ciq-dev/ciq-design-system";
import { ChevronRight } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

interface GapToPlanDisclosureProps {
  title: ReactNode;
  /** Stays visible when collapsed so the closed row still carries the number */
  summary?: ReactNode;
  defaultOpen?: boolean;
  dense?: boolean;
  children: ReactNode;
}

/**
 * Flat disclosure row. Grouping comes from hairlines and indentation
 * rather than another bordered container, so panels never nest boxes.
 */
export function GapToPlanDisclosure({
  title,
  summary,
  defaultOpen = false,
  dense = false,
  children,
}: GapToPlanDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className={cn(
          "group flex w-full items-center gap-3 text-left transition-colors hover:bg-surface-muted/50",
          dense ? "px-6 py-2" : "px-6 py-3.5",
        )}
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-200",
            open ? "rotate-90 text-fg-primary" : "text-fg-tertiary",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            dense
              ? "text-[13px] text-fg-primary"
              : "text-sm font-semibold text-fg-primary",
          )}
        >
          {title}
        </span>
        {summary ? (
          <span className="shrink-0 text-xs tabular-nums text-fg-tertiary">
            {summary}
          </span>
        ) : null}
      </button>

      {open ? (
        <div id={bodyId} className={cn("pr-6 pb-5 pl-[42px]", dense && "pb-3")}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
