import type { ChallengeType } from "@/lib/analytics/agent-analytics";

interface ScoreTrendChartProps {
  scores: Array<{ scoreTotal: number; challengeType: ChallengeType; createdAt: Date }>;
}

const colorMap = {
  logic: "#60a5fa",
  debate: "#a78bfa",
  creativity: "#f472b6",
};

export function ScoreTrendChart({ scores }: ScoreTrendChartProps) {
  if (scores.length < 2) return null;

  const maxScore = 100;
  const width = 600;
  const height = 200;
  const padding = 40;

  const points = scores.map((s, i) => ({
    x: padding + (i / (scores.length - 1)) * (width - 2 * padding),
    y: height - padding - (s.scoreTotal / maxScore) * (height - 2 * padding),
    ...s,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Score History (Last 20 Battles)</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((score) => (
          <line
            key={score}
            x1={padding}
            y1={height - padding - (score / maxScore) * (height - 2 * padding)}
            x2={width - padding}
            y2={height - padding - (score / maxScore) * (height - 2 * padding)}
            stroke="#334155"
            strokeWidth="1"
          />
        ))}

        {/* Trend line */}
        <path d={pathD} fill="none" stroke="#94a3b8" strokeWidth="2" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={colorMap[p.challengeType]}
            className="hover:r-6 transition-all cursor-pointer"
          >
            <title>
              {p.challengeType}: {p.scoreTotal}
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Logic
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          Debate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-400"></span>
          Creativity
        </span>
      </div>
    </div>
  );
}
