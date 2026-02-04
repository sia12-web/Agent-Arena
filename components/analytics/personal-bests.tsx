import type { PersonalBests } from "@/lib/analytics/agent-analytics";

interface PersonalBestsProps {
  personalBests: PersonalBests;
}

export function PersonalBests({ personalBests }: PersonalBestsProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🏆</span> Personal Bests
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Overall Best</span>
          <span className="text-xl font-bold text-yellow-400">{personalBests.overall}</span>
        </div>
        <div className="border-t border-slate-700 pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-blue-300">Logic</span>
            <span className="font-semibold">{personalBests.logic}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-300">Debate</span>
            <span className="font-semibold">{personalBests.debate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-pink-300">Creativity</span>
            <span className="font-semibold">{personalBests.creativity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
