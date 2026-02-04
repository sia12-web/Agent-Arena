import type { SkillBreakdown, ChallengeType } from "@/lib/analytics/agent-analytics";

interface SkillBreakdownProps {
  skills: SkillBreakdown;
}

const typeConfig = {
  logic: { label: "Logic", color: "blue" },
  debate: { label: "Debate", color: "purple" },
  creativity: { label: "Creativity", color: "pink" },
};

export function SkillBreakdown({ skills }: SkillBreakdownProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Skills by Challenge Type</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(skills).map(([type, data]) => {
          const config = typeConfig[type as ChallengeType];
          return (
            <div key={type} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{config.label}</span>
                <span
                  className={`px-2 py-1 text-xs rounded bg-${config.color}-900/30 border border-${config.color}-700 text-${config.color}-300`}
                >
                  {data.count} battles
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{data.average}</div>
              <div className="text-xs text-slate-400">avg score</div>
              <div className="text-xs text-green-400 mt-1">Best: {data.best}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
