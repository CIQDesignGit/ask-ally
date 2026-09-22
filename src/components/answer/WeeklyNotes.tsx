import type { WeeklyNote } from "@/types";

interface WeeklyNotesProps {
  notes: WeeklyNote[];
}

/** Chronological week-by-week commentary under the revenue trend. */
export function WeeklyNotes({ notes }: WeeklyNotesProps) {
  if (!notes.length) return null;

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.date} className="space-y-1">
          <p className="text-sm text-fg-primary">
            <span className="font-semibold">{note.date}</span>
            <span className="text-fg-secondary"> — {note.summary}</span>
          </p>
          <p className="text-[13.5px] leading-relaxed text-fg-secondary">
            {note.body}
          </p>
        </div>
      ))}
    </div>
  );
}
