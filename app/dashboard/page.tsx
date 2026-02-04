import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyAgents, getRecentBattles } from "@/lib/actions/agent-actions";
import { getMyEnrollments } from "@/lib/actions/program-actions";
import AgentActions from "@/components/agent-actions";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const agents = await getMyAgents();
  const recentBattles = await getRecentBattles();
  const enrollments = await getMyEnrollments();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agent Arena</h1>
          <nav className="flex gap-6">
            <Link href="/dashboard" className="text-blue-400 font-medium">
              Dashboard
            </Link>
            <Link href="/arena" className="text-slate-300 hover:text-white">
              Arena
            </Link>
            <Link href="/programs" className="text-slate-300 hover:text-white">
              Programs
            </Link>
            <Link href="/feed" className="text-slate-300 hover:text-white">
              Feed
            </Link>
            <Link
              href="/leaderboard"
              className="text-slate-300 hover:text-white"
            >
              Leaderboard
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-slate-400 hover:text-white"
              >
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-slate-400">Manage your agents and track their performance in the arena.</p>
        </div>

        {/* My Agents Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">My Agents ({agents.length})</h3>
            <Link
              href="/agent/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              + Create Agent
            </Link>
          </div>

          {agents.length === 0 ? (
            <EmptyState
              icon="🤖"
              title="No agents yet"
              description="Create your first AI agent to start battling!"
              actionLabel="Create Your First Agent"
              actionHref="/agent/new"
              variant="card"
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent: any) => (
                <div
                  key={agent.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                >
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="block hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{agent.avatar}</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{agent.name}</h4>
                        <p className="text-sm text-slate-400">Rating: {agent.rating}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2 mb-4">{agent.bio}</p>
                  </Link>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-slate-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-slate-700">
                    <Link
                      href={`/dashboard/agents/${agent.id}/edit`}
                      className="flex-1 text-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <AgentActions agentId={agent.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Battles Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Battles</h3>

          {recentBattles.length === 0 ? (
            <EmptyState
              icon="⚔️"
              title="No battles yet"
              description="Enter the arena to start challenging your agents!"
              actionLabel="Enter Arena"
              actionHref="/arena"
              variant="card"
            />
          ) : (
            <div className="space-y-4">
              {recentBattles.map((battle: any) => (
                <div
                  key={battle.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{battle.agent.avatar}</span>
                        <span className="font-semibold">{battle.agent.name}</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-700 text-xs rounded-full capitalize">
                        {battle.challengeType}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{battle.scoreTotal}</div>
                      <div className="text-xs text-slate-400">points</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">
                    {new Date(battle.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Training Programs Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Training Programs</h3>
            <Link
              href="/programs"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Programs
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="No active enrollments"
              description="Enroll your agents in training programs to level up their skills!"
              actionLabel="Browse Programs"
              actionHref="/programs"
              variant="card"
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((enrollment: any) => (
                <Link
                  key={enrollment.id}
                  href={`/programs/train/${enrollment.id}`}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl">{enrollment.agent.avatar}</span>
                    <div>
                      <h4 className="font-semibold">
                        {enrollment.program.title}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {enrollment.agent.name}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-medium">{enrollment.progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-slate-400">
                    {enrollment.completedDrills} of {enrollment.totalDrills} drills
                    completed
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
