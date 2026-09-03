import { useState } from "react";
import { Button, Input } from "@ciq-dev/ciq-design-system";
import { Loader2 } from "lucide-react";

import { prefersReducedMotion, sleep } from "@/lib/utils";

interface OutlineCardProps {
  slides: string[];
  onConfirm: (slides: string[]) => void;
}

export function OutlineCard({ slides: initial, onConfirm }: OutlineCardProps) {
  const [slides, setSlides] = useState(initial);

  return (
    <div className="space-y-3 rounded-xl border border-border-default bg-surface p-4 shadow-xs">
      <div className="text-sm font-semibold">Proposed slide outline</div>
      <ol className="space-y-2">
        {slides.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-5 text-xs text-fg-tertiary">{i + 1}.</span>
            <Input
              value={s}
              onChange={(e) => {
                const next = [...slides];
                next[i] = e.target.value;
                setSlides(next);
              }}
            />
          </li>
        ))}
      </ol>
      <Button size="sm" onClick={() => onConfirm(slides)}>
        Confirm &amp; build deck
      </Button>
    </div>
  );
}

interface DeckReadyCardProps {
  slideCount: number;
}

export function DeckBuilder({
  slides,
}: {
  slides: string[];
}) {
  const [phase, setPhase] = useState<"outline" | "building" | "ready">(
    "outline"
  );
  const [count, setCount] = useState(slides.length);
  const [progress, setProgress] = useState<string[]>([]);

  const build = async (finalSlides: string[]) => {
    setCount(finalSlides.length);
    setPhase("building");
    const steps = [
      "Pulling data",
      `Laying out ${finalSlides.length} slides`,
      "Applying template",
    ];
    const reduced = prefersReducedMotion();
    for (const step of steps) {
      setProgress((p) => [...p, step]);
      await sleep(reduced ? 50 : 700);
    }
    setPhase("ready");
  };

  if (phase === "outline") {
    return <OutlineCard slides={slides} onConfirm={build} />;
  }

  if (phase === "building") {
    return (
      <div className="rounded-xl border border-border-default bg-surface p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 font-medium">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Building deck…
        </div>
        <ul className="space-y-1 text-fg-secondary">
          {progress.map((p) => (
            <li key={p}>✓ {p}</li>
          ))}
        </ul>
      </div>
    );
  }

  return <DeckReadyCard slideCount={count} />;
}

function DeckReadyCard({ slideCount }: DeckReadyCardProps) {
  return (
    <div className="rounded-xl border border-border-default bg-surface p-4 shadow-xs">
      <div className="text-sm font-semibold text-fg-primary">
        Deck ready — {slideCount} slides
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {Array.from({ length: Math.min(slideCount, 6) }).map((_, i) => (
          <div
            key={i}
            className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-border-default bg-slate-50 text-xs text-fg-tertiary"
          >
            Slide {i + 1}
          </div>
        ))}
      </div>
      <Button size="sm" className="mt-3" variant="outline">
        Download .pptx (prototype stub)
      </Button>
    </div>
  );
}
