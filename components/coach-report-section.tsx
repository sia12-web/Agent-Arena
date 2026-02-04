"use client";

import { useState } from "react";
import Link from "next/link";
import { regenerateCoachReport } from "@/lib/actions/coach-report-actions";

interface CoachReportSectionProps {
  battleId: string;
  battleAgentId: string;
  coachReport: {
    strengths: string[];
    weaknesses: string[];
    promptSuggestions: string[];
    nextDrills: Array<{
      challengeType: string;
      presetTitle: string;
      presetInput: string;
    }>;
    recommendedFocus: string;
  };
  isOwner: boolean;
}

export function CoachReportSection({
  battleId,
  battleAgentId,
  coachReport,
  isOwner,
}: CoachReportSectionProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = async () => {
    if (!isOwner) return;

    setIsRegenerating(true);
    const result = await regenerateCoachReport(battleId);

    setIsRegenerating(false);

    if ("error" in result && result.error) {
      alert(result.error); // Could add toast notification
      return;
    }

    // Refresh the page to show updated report
    window.location.reload();
  };

  const focusColors: Record<string, string> = {
    LOGIC: "bg-blue-900/30 border-blue-700 text-blue-300",
    DEBATE: "bg-purple-900/30 border-purple-700 text-purple-300",
    CREATIVITY: "bg-pink-900/30 border-pink-700 text-pink-300",
    GENERAL: "bg-green-900/30 border-green-700 text-green-300",
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Coach Report</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Focus Area:</span>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${focusColors[coachReport.recommendedFocus]}`}>
              {coachReport.recommendedFocus}
            </span>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-sm rounded-lg transition-colors"
          >
            {isRegenerating ? "Regenerating..." : "Regenerate Report"}
          </button>
        )}
      </div>

      {/* Strengths */}
      {coachReport.strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
            <span>✓</span> Strengths
          </h3>
          <ul className="space-y-2">
            {coachReport.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-slate-300 text-sm"
              >
                <span className="text-green-400 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {coachReport.weaknesses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <span>△</span> Areas to Improve
          </h3>
          <ul className="space-y-2">
            {coachReport.weaknesses.map((weakness, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-slate-300 text-sm"
              >
                <span className="text-red-400 mt-1">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prompt Suggestions */}
      {coachReport.promptSuggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
            <span>💡</span> Suggested Prompts
          </h3>
          <div className="space-y-3">
            {coachReport.promptSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex justify-between items-start gap-3"
              >
                <p className="text-sm text-slate-300 flex-1">{suggestion}</p>
                <button
                  onClick={() => handleCopy(suggestion, idx)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                >
                  {copiedIndex === idx ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Drills */}
      {coachReport.nextDrills.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
            <span>▶</span> Recommended Drills
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {coachReport.nextDrills.map((drill, idx) => (
              <Link
                key={idx}
                href={`/arena?agent=${battleAgentId}&type=${drill.challengeType}&input=${encodeURIComponent(drill.presetInput)}`}
                className="block bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 text-xs rounded capitalize ${
                      drill.challengeType === "logic"
                        ? "bg-blue-900/30 border-blue-700 text-blue-300"
                        : drill.challengeType === "debate"
                        ? "bg-purple-900/30 border-purple-700 text-purple-300"
                        : "bg-pink-900/30 border-pink-700 text-pink-300"
                    }`}
                  >
                    {drill.challengeType}
                  </span>
                  <span className="text-xs text-slate-400">Drill {idx + 1}</span>
                </div>
                <h4 className="font-medium text-white mb-1">{drill.presetTitle}</h4>
                <p className="text-sm text-slate-400 line-clamp-2">
                  {drill.presetInput}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
