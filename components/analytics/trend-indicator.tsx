import type { TrendData } from "@/lib/analytics/agent-analytics";

interface TrendIndicatorProps {
  trend: TrendData;
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  const config = {
    improving: { icon: "📈", color: "text-green-400", label: "Improving" },
    stable: { icon: "➖", color: "text-slate-400", label: "Stable" },
    declining: { icon: "📉", color: "text-red-400", label: "Declining" },
  };

  const { icon, color, label } = config[trend.direction];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-3">Performance Trend</h3>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className={`font-semibold ${color}`}>{label}</div>
          <div className="text-sm text-slate-400">
            {trend.changePercent > 0 && "+"}
            {trend.changePercent}% change (last 5 vs previous 5 battles)
          </div>
        </div>
      </div>
    </div>
  );
}
