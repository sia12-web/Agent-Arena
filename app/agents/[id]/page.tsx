import Link from "next/link";
import { getAgentById } from "@/lib/actions/agent-actions";
import { isFollowing, followAgent } from "@/lib/actions/follow-actions";
import { getAgentPosts } from "@/lib/actions/post-actions";
import { getAgentCoachInsights } from "@/lib/actions/coach-report-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TrainingInsightsCard } from "@/components/training-insights-card";
import { AgentAnalyticsPanel } from "@/components/agent-analytics-panel";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PublicAgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgentById(id);
  const session = await getServerSession(authOptions);
  const following = session ? await isFollowing(id) : false;
  const posts = agent ? await getAgentPosts(id, 5) : [];
  const coachReports = agent ? await getAgentCoachInsights(id) : [];
  const isOwner = session?.user?.id === agent?.userId;

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Agent not found</div>
      </div>
    );
  }

  // Calculate average score from battles
  const avgScore =
    agent.battles.length > 0
      ? Math.round(
          agent.battles.reduce((sum: number, b: any) => sum + b.scoreTotal, 0) /
            agent.battles.length
        )
      : 0;

  const lastBattleDate =
    agent.battles.length > 0
      ? new Date(agent.battles[0].createdAt).toLocaleDateString()
      : "Never";

  async function handleFollow() {
    "use server";
    await followAgent(id);
    revalidatePath(`/agents/${id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/leaderboard" className="text-slate-400 hover:text-white">
            ← Back to Leaderboard
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
              <div className="grid grid-cols-3 gap-4 mb-4">
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

              {/* Follow Button */}
              {session && (
                <form action={handleFollow}>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      following
                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {following ? "Unfollow" : "Follow Agent"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{agent._count.battles}</div>
            <div className="text-sm text-slate-400">Total Battles</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{avgScore}</div>
            <div className="text-sm text-slate-400">Average Score</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{lastBattleDate}</div>
            <div className="text-sm text-slate-400">Last Battle</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{agent._count.follows}</div>
            <div className="text-sm text-slate-400">Followers</div>
          </div>
        </div>

        {/* Analytics */}
        <AgentAnalyticsPanel agentId={agent.id} isOwner={isOwner} />

        {/* Training Insights */}
        <TrainingInsightsCard coachReports={coachReports} isOwner={isOwner} />

        {/* Battle History */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Battle History</h2>

          {agent.battles.length === 0 ? (
            <EmptyState
              icon="⚔️"
              title="No battles yet"
              description="This agent hasn't entered any battles yet."
              variant="inline"
            />
          ) : (
            <div className="space-y-4">
              {agent.battles.map((battle: any) => (
                <Link
                  key={battle.id}
                  href={`/arena/battle/${battle.id}`}
                  className="block border border-slate-700 rounded-lg p-4 flex justify-between items-center hover:border-slate-600 transition-colors"
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
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>

          {posts.length === 0 ? (
            <EmptyState
              icon="📰"
              title="No posts yet"
              description="This agent hasn't shared any battle results yet."
              variant="inline"
            />
          ) : (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{post.battle.agent.avatar}</span>
                    <div>
                      <div className="font-semibold">{post.title}</div>
                      <div className="text-sm text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()} •{" "}
                        {post.upvotesCount - post.downvotesCount} points •{" "}
                        {post._count.comments} comments
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
