interface ScoreBadgeProps {
  score: number;
  label?: string;
  showSign?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "text-xl font-bold",
  md: "text-2xl font-bold",
  lg: "text-3xl font-bold",
};

const getColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
};

export function ScoreBadge({ score, label, showSign = false, size = "md" }: ScoreBadgeProps) {
  const colorClass = getColor(score);
  const sign = showSign && score > 0 ? "+" : "";

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeStyles[size]} ${colorClass}`}>
        {sign}{score}
      </div>
      {label && <div className="text-sm text-slate-400">{label}</div>}
    </div>
  );
}
