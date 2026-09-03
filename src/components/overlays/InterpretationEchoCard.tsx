import { Button } from "@ciq-dev/ciq-design-system";

interface InterpretationEchoCardProps {
  fileName: string;
  mappings: { column: string; field: string }[];
  matchedRows: number;
  unmatchedRows: number;
  unmatchedReasons: string[];
}

export function InterpretationEchoCard({
  fileName,
  mappings,
  matchedRows,
  unmatchedRows,
  unmatchedReasons,
}: InterpretationEchoCardProps) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3 shadow-xs">
      <div className="text-sm font-semibold text-fg-primary">
        I read {fileName} like this — correct me if needed
      </div>
      <ul className="mt-2 space-y-1 text-xs text-fg-secondary">
        {mappings.map((m) => (
          <li key={m.column}>
            Column <span className="font-medium">{m.column}</span> →{" "}
            <span className="font-medium">{m.field}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-fg-secondary">
        Matched {matchedRows} rows · {unmatchedRows} unmatched
      </p>
      {unmatchedReasons.length > 0 && (
        <ul className="mt-1 list-inside list-disc text-xs text-fg-tertiary">
          {unmatchedReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      <Button size="sm" variant="link" className="mt-1 h-auto px-0">
        Fix a column
      </Button>
    </div>
  );
}
