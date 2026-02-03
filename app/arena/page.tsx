"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserAgents, createBattle, generateAgentResponse } from "@/lib/actions/battle-actions";

const CHALLENGE_TYPES = [
  { id: "logic", name: "Logic Challenge", icon: "🧩", description: "Test analytical reasoning and problem-solving" },
  { id: "debate", name: "Debate Challenge", icon: "🎤", description: "Construct persuasive arguments and counterarguments" },
  { id: "creativity", name: "Creativity Challenge", icon: "🎨", description: "Generate original and imaginative content" },
];

export default function ArenaPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<"logic" | "debate" | "creativity">("logic");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    const result = await getUserAgents();
    setAgents(result);
    if (result.length > 0) {
      setSelectedAgent(result[0].id);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedAgent) {
      setError("Please select an agent");
      return;
    }

    if (inputText.length < 10) {
      setError("Challenge input must be at least 10 characters");
      return;
    }

    setSubmitting(true);

    // Get agent details for prompt
    const agent = agents.find((a) => a.id === selectedAgent);
    const outputText = await generateAgentResponse(selectedChallenge, inputText, agent?.prompt || "");

    const result = await createBattle({
      agentId: selectedAgent,
      challengeType: selectedChallenge,
      inputText,
      outputText,
    });

    setSubmitting(false);

    if ('error' in result && result.error) {
      setError(result.error);
      return;
    }

    if ('battle' in result && result.battle) {
      router.push(`/arena/battle/${result.battle.id}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">⚔️ The Arena</h1>
        <p className="text-slate-400 mb-8">Select your agent and challenge type to begin the battle.</p>

        {agents.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold mb-2">No agents available</h2>
            <p className="text-slate-400 mb-4">Create an agent first to enter the arena!</p>
            <Link
              href="/agent/new"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Your First Agent
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Select Your Agent</label>
              <div className="grid md:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAgent === agent.id
                        ? "border-blue-500 bg-blue-900/30"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{agent.avatar}</span>
                      <span className="font-semibold">{agent.name}</span>
                    </div>
                    <div className="text-sm text-slate-400">Rating: {agent.rating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Challenge Type</label>
              <div className="grid md:grid-cols-3 gap-4">
                {CHALLENGE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedChallenge(type.id as any)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedChallenge === type.id
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-semibold mb-1">{type.name}</div>
                    <div className="text-sm text-slate-400">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge Input */}
            <div>
              <label htmlFor="input" className="block text-sm font-medium mb-2">
                Challenge Input
              </label>
              <textarea
                id="input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={
                  selectedChallenge === "logic"
                    ? "Enter a logic problem or puzzle..."
                    : selectedChallenge === "debate"
                    ? "Enter a topic and your stance..."
                    : "Enter a creative writing prompt..."
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                {inputText.length}/2000 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              {submitting ? "Battling..." : "⚔️ Enter Battle"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
