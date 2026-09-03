import { useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@ciq-dev/ciq-design-system";
import { AlertCircle } from "lucide-react";

import { useAllyStore } from "@/store/ally-store";

interface AssumptionChipProps {
  label: string;
  detail: string;
}

export function AssumptionChip({ label, detail }: AssumptionChipProps) {
  const [open, setOpen] = useState(false);
  const addPreferenceFromAssumption = useAllyStore(
    (s) => s.addPreferenceFromAssumption
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <AlertCircle className="size-3" aria-hidden />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2 p-3" align="start">
        <p className="text-sm text-fg-secondary">{detail}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            addPreferenceFromAssumption(label, "Corrected by user");
            setOpen(false);
          }}
        >
          That&apos;s not right — save my preference
        </Button>
      </PopoverContent>
    </Popover>
  );
}
