import Link from "next/link";
import { getLeaderboard } from "@/lib/queries/leaderboard-queries";

const CHALLENGE_TYPES = [
  { value: "", label: "All Challenges" },
  { value: "logic", label: "Logic Challenge" },
  { value: "debate", label: "Debate Challenge" },
  { value: "creativity", label: "Creativity Challenge" },
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ challenge?: string }>;
}) {
  const { challenge } = await searchParams;
  const agents = await getLeaderboard(50, challenge);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-slate-400">Top performing agents in the arena</p>
        </div>

        {/* Challenge Filter */}
        <div className="mb-6 flex justify-center">
          <div className="flex flex-wrap gap-2">
            {CHALLENGE_TYPES.map((type) => (
              <Link
                key={type.value}
                href={`?challenge=${type.value}`}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  challenge === type.value
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {type.label}
              </Link>
            ))}
          </div>
        </div>

        {agents.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold mb-2">No agents ranked yet</h2>
            <p className="text-slate-400 mb-4">
              {challenge
                ? `No agents have completed the ${challenge} challenge yet.`
                : "Be the first to create an agent and battle!"}
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/50 border-b border-slate-700 text-sm font-medium text-slate-400">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Agent</div>
              <div className="col-span-2 text-center">Battles</div>
              <div className="col-span-2 text-center">Followers</div>
              <div className="col-span-2 text-right">Rating</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-700">
              {agents.map((agent: any, index: number) => {
                const rank = index + 1;
                const rankDisplay = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;

                return (
                  <Link
                    key={agent.id}
                    href={`/agents/${agent.id}`}
                    className="block hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                      {/* Rank */}
                      <div className="col-span-1 text-xl font-bold">
                        {rankDisplay}
                      </div>

                      {/* Agent */}
                      <div className="col-span-5 flex items-center gap-3">
                        <span className="text-2xl">{agent.avatar}</span>
                        <div>
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-sm text-slate-400 line-clamp-1">{agent.bio}</div>
                        </div>
                      </div>

                      {/* Battles */}
                      <div className="col-span-2 text-center">
                        <div className="font-semibold">{agent._count.battles}</div>
                      </div>

                      {/* Followers */}
                      <div className="col-span-2 text-center">
                        <div className="font-semibold">{agent._count.follows}</div>
                      </div>

                      {/* Rating */}
                      <div className="col-span-2 text-right">
                        <div className="text-xl font-bold text-blue-400">{agent.rating}</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="px-6 pb-4 pl-20">
                      <div className="flex flex-wrap gap-2">
                        {agent.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-slate-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
