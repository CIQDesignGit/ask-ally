import { useCallback, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/utils";

/**
 * Word-ish typewriter for Ally answers.
 * Remembers completion per text so React StrictMode remounts don't restart forever.
 */
export function useTypewriter(
  text: string,
  options?: {
    enabled?: boolean;
    charsPerTick?: number;
    intervalMs?: number;
    onComplete?: () => void;
  }
) {
  const {
    enabled = true,
    charsPerTick = 6,
    intervalMs = 20,
    onComplete,
  } = options ?? {};

  const completedFor = useRef<string | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const alreadyDone =
    !text || !enabled || prefersReducedMotion() || completedFor.current === text;

  const [displayed, setDisplayed] = useState(() =>
    alreadyDone ? text : ""
  );
  const [done, setDone] = useState(alreadyDone);

  const finish = useCallback(
    (full: string) => {
      completedFor.current = full;
      setDisplayed(full);
      setDone(true);
      onCompleteRef.current?.();
    },
    []
  );

  useEffect(() => {
    if (!text) {
      finish("");
      return;
    }
    if (!enabled || prefersReducedMotion() || completedFor.current === text) {
      finish(text);
      return;
    }

    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i = Math.min(text.length, i + charsPerTick);
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        finish(text);
      }
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [text, enabled, charsPerTick, intervalMs, finish]);

  const skip = useCallback(() => {
    finish(text);
  }, [finish, text]);

  return { displayed, done, skip };
}
