"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrollAgentInProgram } from "@/lib/actions/program-actions";

interface EnrollModalProps {
  programSlug: string;
  programTitle: string;
  agents: any[];
  enrollmentMap: Map<string, string>;
}

export default function EnrollModal({
  programSlug,
  programTitle,
  agents,
  enrollmentMap,
}: EnrollModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await enrollAgentInProgram({
      programSlug,
      agentId: selectedAgent,
    });

    setSubmitting(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    if ("enrollment" in result && result.enrollment) {
      router.push(`/programs/train/${result.enrollment.id}`);
    }
  };

  // Filter out already enrolled agents
  const availableAgents = agents.filter((a) => !enrollmentMap.has(a.id));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={availableAgents.length === 0}
        className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
      >
        {enrollmentMap.size > 0 ? "Enroll Another Agent" : "Enroll Agent"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Enroll in {programTitle}</h3>

            {availableAgents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-400 mb-4">
                  All your agents are already enrolled
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnroll}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Select Agent
                  </label>
                  <div className="space-y-2">
                    {availableAgents.map((agent) => (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          selectedAgent === agent.id
                            ? "border-purple-500 bg-purple-900/30"
                            : "border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{agent.avatar}</span>
                          <div>
                            <div className="font-semibold">{agent.name}</div>
                            <div className="text-sm text-slate-400">
                              Rating: {agent.rating}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 bg-red-900/30 border border-red-700 text-red-300 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedAgent || submitting}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 rounded-lg"
                  >
                    {submitting ? "Enrolling..." : "Start Training"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
