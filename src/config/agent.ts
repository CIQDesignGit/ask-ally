/**
 * Ally agent identity — keep branding here so Blake/Jessica routing
 * can swap later without rebuilding the UI.
 */
export const agentConfig = {
  name: "Ally",
  tagline: "Conversational insights for ecommerce sales",
  colorToken: "brand",
  /** Initials fallback for avatar */
  avatarFallback: "A",
  /** Optional image URL — leave empty to use fallback */
  avatarSrc: "",
} as const;

export const FEEDBACK_DOWN_TAGS = [
  { id: "wrong_scope", label: "Wrong scope" },
  { id: "wrong_number", label: "Wrong number" },
  { id: "wrong_driver", label: "Wrong driver" },
  { id: "wrong_action", label: "Right data, wrong action" },
  { id: "tone", label: "Tone" },
] as const;
