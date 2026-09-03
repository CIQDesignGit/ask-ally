/**
 * Quiet card frame for answer sections — grouping via common region,
 * not heavy chrome. Slate borders; no brand purple fill.
 */
interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`rounded-xl border border-border-default bg-surface ${className}`}
    >
      {(title || description) && (
        <header className="border-b border-border-default px-4 py-2.5">
          {title ? (
            <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
          ) : null}
          {description ? (
            <p className="mt-0.5 text-xs text-fg-tertiary">{description}</p>
          ) : null}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
