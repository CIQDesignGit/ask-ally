import {
  Button,
  FeedbackForm,
  cn,
  type FeedbackSentiment,
  type FeedbackTagOption,
} from "@ciq-dev/ciq-design-system";
import { Circle, CircleCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

import type { Turn } from "@/types";

const POSITIVE_TAGS: FeedbackTagOption[] = [
  { value: "accurate", label: "Accurate" },
  { value: "clear", label: "Clear" },
  { value: "actionable", label: "Actionable" },
];

const NEGATIVE_TAGS: FeedbackTagOption[] = [
  { value: "inaccurate", label: "Inaccurate" },
  { value: "unclear", label: "Unclear" },
  { value: "not_actionable", label: "Not actionable" },
];

type TurnFeedback = NonNullable<Turn["feedback"]>;

interface AnswerFeedbackProps {
  turnId: string;
  feedback?: TurnFeedback;
  onSubmit: (feedback: TurnFeedback) => void;
}

function SentimentPill({ up }: { up: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
      )}
    >
      {up ? "Helpful?" : "Not helpful?"}
      {up ? (
        <ThumbsUp className="size-3.5" aria-hidden />
      ) : (
        <ThumbsDown className="size-3.5" aria-hidden />
      )}
    </span>
  );
}

/**
 * “Was this helpful?” → expands inline to match CIQ feedback UI:
 * Helpful? pill → Accurate / Clear / Actionable → comment + Share / Skip.
 */
export function AnswerFeedback({
  turnId,
  feedback,
  onSubmit,
}: AnswerFeedbackProps) {
  const [draftSentiment, setDraftSentiment] = useState<
    "up" | "down" | null
  >(null);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitted = Boolean(feedback?.submitted);
  const open = Boolean(draftSentiment) && !submitted;

  const tags =
    draftSentiment === "up"
      ? POSITIVE_TAGS
      : draftSentiment === "down"
        ? NEGATIVE_TAGS
        : [];

  const dsSentiment: FeedbackSentiment | null =
    draftSentiment === "up"
      ? "POSITIVE"
      : draftSentiment === "down"
        ? "NEGATIVE"
        : null;

  function openPanel(sentiment: "up" | "down") {
    if (submitted) return;
    setDraftSentiment(sentiment);
    setComment("");
    setSelectedTags([]);
  }

  function toggleTag(tagValue: string) {
    setSelectedTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue],
    );
  }

  async function finish(note: string, tagsOut: string[]) {
    if (!draftSentiment) return;
    setIsSubmitting(true);
    try {
      onSubmit({
        sentiment: draftSentiment,
        tags: tagsOut,
        note: note || undefined,
        submitted: true,
      });
      setDraftSentiment(null);
      setComment("");
      setSelectedTags([]);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted && feedback?.sentiment) {
    return (
      <div className="pt-1" data-feedback-turn={turnId}>
        <SentimentPill up={feedback.sentiment === "up"} />
      </div>
    );
  }

  if (open && dsSentiment) {
    return (
      <div className="flex flex-col gap-2.5 pt-1" data-feedback-turn={turnId}>
        <SentimentPill up={draftSentiment === "up"} />

        {/* Tag chips sit above the bordered comment box (screenshot layout) */}
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.value);
            return (
              <Button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  isSelected
                    ? "border-purple-200 bg-white text-slate-500"
                    : "border-slate-100 bg-white text-slate-500",
                )}
              >
                {tag.label}
                {isSelected ? (
                  <CircleCheck
                    size={16}
                    className="shrink-0 fill-purple-400 text-white"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    size={16}
                    className="shrink-0 text-slate-300"
                    aria-hidden
                  />
                )}
              </Button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border-default bg-surface px-3 py-2.5">
          <FeedbackForm
            sentiment={dsSentiment}
            comment={comment}
            onCommentChange={setComment}
            onSubmit={() => void finish(comment, selectedTags)}
            onSkip={() => void finish("", [])}
            isSubmitting={isSubmitting}
            submitDisabled={comment.trim().length === 0}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 pt-1 text-[13px] text-fg-tertiary"
      data-feedback-turn={turnId}
    >
      <span>Was this helpful?</span>
      <button
        type="button"
        aria-label="Thumbs up"
        className="rounded-md p-1 text-fg-tertiary hover:bg-surface-muted hover:text-fg-secondary"
        onClick={() => openPanel("up")}
      >
        <ThumbsUp className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Thumbs down"
        className="rounded-md p-1 text-fg-tertiary hover:bg-surface-muted hover:text-fg-secondary"
        onClick={() => openPanel("down")}
      >
        <ThumbsDown className="size-3.5" />
      </button>
    </div>
  );
}
