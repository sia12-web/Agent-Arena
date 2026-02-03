"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAgentById, updateAgent } from "@/lib/actions/agent-actions";

const AVATAR_OPTIONS = ["🤖", "🧠", "⚡", "🔥", "💎", "🎯", "🚀", "⚔️", "🛡️", "👑"];
const SKILL_OPTIONS = ["Strategist", "Creator", "Analyst", "Diplomat", "Solver"];

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [traits, setTraits] = useState({ analytical: 50, calm: 50, fast: 50 });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState("🤖");

  useEffect(() => {
    loadAgent();
  }, []);

  async function loadAgent() {
    setLoading(true);
    const result = await getAgentById(id);

    if (!result) {
      router.push("/dashboard");
      return;
    }

    setAgent(result);
    setSelectedAvatar(result.avatar);
    setTraits(result.traits);
    setSelectedSkills(result.skills);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
      avatar: selectedAvatar,
      traits,
      skills: selectedSkills as ("Strategist" | "Creator" | "Analyst" | "Diplomat" | "Solver")[],
      prompt: formData.get("prompt") as string,
    };

    const result = await updateAgent(id, data);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/agents/${id}`);
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      }
      if (prev.length >= 3) return prev;
      return [...prev, skill];
    });
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
          <Link href={`/dashboard/agents/${id}`} className="text-slate-400 hover:text-white">
            ← Back to Agent
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Edit Agent</h1>
        <p className="text-slate-400 mb-6">Update your agent's configuration.</p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Choose Avatar</label>
            <div className="flex flex-wrap gap-3">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                    selectedAvatar === avatar
                      ? "border-blue-500 bg-blue-900/30"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Agent Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={50}
              defaultValue={agent?.name}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., LogicMaster"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Short Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              required
              minLength={10}
              maxLength={500}
              rows={3}
              defaultValue={agent?.bio}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your agent's strengths and personality..."
            />
          </div>

          {/* Traits */}
          <div>
            <label className="block text-sm font-medium mb-3">Personality Traits</label>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Analytical</span>
                  <span className="text-sm text-slate-400">{traits.analytical}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.analytical}
                  onChange={(e) => setTraits({ ...traits, analytical: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Creative</span>
                  <span>Analytical</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Calm</span>
                  <span className="text-sm text-slate-400">{traits.calm}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.calm}
                  onChange={(e) => setTraits({ ...traits, calm: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Bold</span>
                  <span>Calm</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Fast</span>
                  <span className="text-sm text-slate-400">{traits.fast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={traits.fast}
                  onChange={(e) => setTraits({ ...traits, fast: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Deep</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-3">Skills (select up to 3)</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  disabled={!selectedSkills.includes(skill) && selectedSkills.length >= 3}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedSkills.includes(skill)
                      ? "border-blue-500 bg-blue-900/30 text-white"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 disabled:opacity-50"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Agent System Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              required
              minLength={20}
              maxLength={1000}
              rows={5}
              defaultValue={agent?.prompt}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="You are a logical and analytical AI. Approach problems step-by-step..."
            />
            <p className="text-xs text-slate-500 mt-1">This prompt guides how your agent responds to challenges.</p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || selectedSkills.length === 0}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/dashboard/agents/${id}`}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
