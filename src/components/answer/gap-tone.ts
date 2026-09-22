import type { GapTone } from "@/types";

export function toneTextClass(tone?: GapTone): string {
  if (tone === "positive") return "text-feedback-success";
  if (tone === "negative") return "text-feedback-danger";
  return "text-fg-secondary";
}
