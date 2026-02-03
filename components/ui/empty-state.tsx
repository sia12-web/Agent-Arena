import Link from "next/link";

type EmptyStateVariant = "card" | "inline" | "section";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  variant?: EmptyStateVariant;
}

const variantStyles: Record<EmptyStateVariant, string> = {
  card: "bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center",
  inline: "text-center py-8",
  section: "bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center",
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  variant = "card",
}: EmptyStateProps) {
  return (
    <div className={variantStyles[variant]}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
