import { animate } from "motion";
import {
  createElement,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { prefersReducedMotion } from "@/lib/utils";

/** Soft deceleration — settles, doesn't snap. */
export const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const SECTION_STAGGER = 0.18;
export const SECTION_BASE_DELAY = 0.08;

export function sectionDelay(index: number): number {
  return SECTION_BASE_DELAY + index * SECTION_STAGGER;
}

type AppearTag = "div" | "h3" | "li" | "ol";

type AppearProps<T extends AppearTag> = {
  as?: T;
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/**
 * Fade-and-rise enter via Motion's DOM `animate()`.
 * Explicit keyframes avoid the React Strict Mode opacity stall.
 */
export function Appear<T extends AppearTag = "div">({
  as,
  children,
  delay = 0,
  duration = 0.55,
  y = 16,
  ...rest
}: AppearProps<T>) {
  const tag = (as ?? "div") as AppearTag;
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const playback = animate(
      node,
      {
        opacity: [0, 1],
        transform: [`translateY(${y}px)`, "translateY(0px)"],
      },
      { duration, delay, ease: easeOutExpo },
    );
    return () => {
      playback.stop();
    };
  }, [delay, duration, y]);

  return createElement(tag, { ...rest, ref }, children);
}
