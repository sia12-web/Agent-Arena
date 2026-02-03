import { ReactNode } from "react";

type BadgeVariant = "default" | "challenge" | "score" | "skill" | "success" | "danger";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-700 text-slate-300",
  challenge: "bg-purple-900/30 border border-purple-700 text-purple-300",
  score: "bg-blue-900/30 border border-blue-700 text-blue-300",
  skill: "bg-blue-900/30 border border-blue-700 text-blue-300",
  success: "bg-green-900/30 border border-green-700 text-green-300",
  danger: "bg-red-900/30 border border-red-700 text-red-300",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
