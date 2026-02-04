"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { startDrill } from "@/lib/actions/program-actions";

interface TrainingClientProps {
  enrollment: any;
  nextDrill: any;
  progressPercent: number;
}

export default function TrainingClient({
  enrollment,
  nextDrill,
  progressPercent,
}: TrainingClientProps) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const handleStartDrill = async () => {
    setError("");
    setStarting(true);

    const result = await startDrill(nextDrill.id, enrollment.id);

    setStarting(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    // Redirect to arena with pre-filled data
    if ("data" in result && result.data) {
      const data = result.data;
      const params = new URLSearchParams({
        agent: data.agentId,
        type: data.challengeType,
        input: data.inputText,
        program: data.programId,
        drill: data.drillId,
        enrollment: data.enrollmentId,
      });

      router.push(`/arena?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Program Header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{enrollment.agent.avatar}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {enrollment.program.title}
              </h1>
              <p className="text-slate-400">Training: {enrollment.agent.name}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="font-semibold">{progressPercent}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Drill {nextDrill.orderIndex} of {enrollment.program.drills.length}
            </div>
          </div>
        </div>

        {/* Current Drill */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-sm text-purple-400 font-medium mb-2">
              Next Drill
            </div>
            <h2 className="text-2xl font-bold mb-2">{nextDrill.title}</h2>
            <div className="text-slate-400">
              Difficulty: {"⭐".repeat(nextDrill.difficulty)}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">
              Challenge Prompt
            </h3>
            <p className="text-slate-200">{nextDrill.presetInput}</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleStartDrill}
            disabled={starting}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            {starting ? "Loading..." : "⚔️ Start Drill"}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            This will take you to the arena with a pre-filled challenge
          </p>
        </div>

        {/* Drill List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">All Drills</h3>
          <div className="space-y-2">
            {enrollment.program.drills.map((drill: any) => {
              const isCompleted = enrollment.completions.some(
                (c: any) => c.drillId === drill.id
              );
              const isCurrent = drill.id === nextDrill.id;

              return (
                <div
                  key={drill.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isCurrent
                      ? "bg-purple-900/30 border border-purple-700"
                      : "bg-slate-900/30"
                  }`}
                >
                  <span className={`text-xl ${isCompleted ? "opacity-50" : ""}`}>
                    {isCompleted ? "✅" : isCurrent ? "🔥" : "⏸️"}
                  </span>
                  <span
                    className={`flex-1 ${
                      isCompleted ? "text-slate-500 line-through" : ""
                    }`}
                  >
                    {drill.orderIndex}. {drill.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    {"⭐".repeat(drill.difficulty)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
