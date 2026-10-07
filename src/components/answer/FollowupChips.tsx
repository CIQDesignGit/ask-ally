/**
 * Follow-up suggestion chips — up to 3 in one horizontally scrollable row.
 */
interface FollowupChipsProps {
  followups: { type: "drill" | "pivot"; label: string; nextTurnId?: string }[];
  onSelect: (label: string, nextTurnId?: string) => void;
  disabled?: boolean;
}

const MAX_CHIPS = 3;

const chipClass =
  "inline-flex shrink-0 items-center rounded-full border border-brand-100 bg-brand-25 px-3 py-1.5 text-left text-[12.5px] font-medium whitespace-nowrap text-brand-800 transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus disabled:pointer-events-none disabled:opacity-50";

export function FollowupChips({
  followups,
  onSelect,
  disabled,
}: FollowupChipsProps) {
  const chips = followups.slice(0, MAX_CHIPS);

  return (
    <div
      className="flex flex-nowrap gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label="Suggested follow-ups"
    >
      {chips.map((f) => (
        <button
          key={f.label}
          type="button"
          role="listitem"
          disabled={disabled}
          className={chipClass}
          onClick={() => onSelect(f.label, f.nextTurnId)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
