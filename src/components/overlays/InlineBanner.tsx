import { AlertTriangle } from "lucide-react";

interface InlineBannerProps {
  message: string;
}

export function InlineBanner({ message }: InlineBannerProps) {
  return (
    <div
      role="status"
      className="mb-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
