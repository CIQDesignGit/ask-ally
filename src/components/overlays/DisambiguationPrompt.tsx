import { Button } from "@ciq-dev/ciq-design-system";

interface DisambiguationPromptProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function DisambiguationPrompt({
  question,
  options,
  onSelect,
  disabled,
}: DisambiguationPromptProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-fg-primary">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Button
            key={opt}
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect(opt)}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
}
