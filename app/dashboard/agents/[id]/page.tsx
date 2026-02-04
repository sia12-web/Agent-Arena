import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAgentById } from "@/lib/actions/agent-actions";
import { getAgentProgramProgress } from "@/lib/actions/program-actions";
import AgentActions from "@/components/agent-actions";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const agent = await getAgentById(id);
  const programProgress = await getAgentProgramProgress(id);

  if (!agent) {
    redirect("/dashboard");
  }

  const isOwner = session?.user?.id === agent.userId;

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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Agent Header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{agent.avatar}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                  <p className="text-slate-400">{agent.bio}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">{agent.rating}</div>
                  <div className="text-sm text-slate-400">Rating</div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-900/30 border border-blue-700 text-blue-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Traits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Analytical</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${agent.traits.analytical}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Calm</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${agent.traits.calm}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Fast</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${agent.traits.fast}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Prompt */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-2">System Prompt</h3>
            <p className="text-sm text-slate-300 italic">&quot;{agent.prompt}&quot;</p>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="mt-6 pt-6 border-t border-slate-700 flex gap-3">
              <Link
                href={`/dashboard/agents/${agent.id}/edit`}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Edit Agent
              </Link>
              <Link
                href="/arena"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Enter Battle
              </Link>
              <AgentActions agentId={agent.id} />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{agent._count.battles}</div>
            <div className="text-sm text-slate-400">Total Battles</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{agent._count.follows}</div>
            <div className="text-sm text-slate-400">Followers</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{agent.rating}</div>
            <div className="text-sm text-slate-400">Current Rating</div>
          </div>
        </div>

        {/* Program Progress */}
        {programProgress.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Training Progress</h2>
            <div className="space-y-4">
              {programProgress.map((progress) => (
                <div key={progress.programSlug}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{progress.programTitle}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">
                        {progress.progress}%
                      </span>
                      {progress.isComplete && (
                        <span className="text-green-400 text-sm">✓ Complete</span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Battle History */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Battle History</h2>

          {agent.battles.length === 0 ? (
            <EmptyState
              icon="⚔️"
              title="No battles yet"
              description="Enter the arena to start!"
              actionLabel={isOwner ? "Enter Arena" : undefined}
              actionHref="/arena"
              variant="inline"
            />
          ) : (
            <div className="space-y-4">
              {agent.battles.map((battle: any) => (
                <div
                  key={battle.id}
                  className="border border-slate-700 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-slate-700 text-xs rounded-full capitalize">
                        {battle.challengeType}
                      </span>
                      <span className="text-sm text-slate-400">
                        {new Date(battle.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-1">{battle.inputText}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{battle.scoreTotal}</div>
                    <div className="text-xs text-slate-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
