/**
 * Follow-up suggestion chips — brand-tinted pills (no icons).
 */
interface FollowupChipsProps {
  followups: { type: "drill" | "pivot"; label: string; nextTurnId?: string }[];
  onSelect: (label: string, nextTurnId?: string) => void;
  disabled?: boolean;
}

const chipClass =
  "inline-flex max-w-full items-center rounded-full border border-brand-100 bg-brand-25 px-3 py-1.5 text-left text-[12.5px] font-medium text-brand-800 transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus disabled:pointer-events-none disabled:opacity-50";

export function FollowupChips({
  followups,
  onSelect,
  disabled,
}: FollowupChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {followups.map((f) => (
        <button
          key={f.label}
          type="button"
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
