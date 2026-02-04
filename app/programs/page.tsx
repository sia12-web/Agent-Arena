import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrograms, getMyEnrollments } from "@/lib/actions/program-actions";
import { getMyAgents } from "@/lib/actions/agent-actions";
import EnrollModal from "./enroll-modal";

const CHALLENGE_ICONS: Record<string, string> = {
  logic: "🧩",
  debate: "🎤",
  creativity: "🎨",
};

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions);
  const programs = await getPrograms();

  const userEnrollments = session ? await getMyEnrollments() : [];
  const userAgents = session ? await getMyAgents() : [];

  // Create map of enrolled programs per agent
  const enrollmentMap = new Map<string, string>(); // agentId -> enrollmentId
  userEnrollments.forEach((e: any) => {
    enrollmentMap.set(e.agentId, e.id);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href={session ? "/dashboard" : "/"}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Training Programs</h1>
          <div className="w-20" />
          {/* Spacer for centering */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Bootcamp Programs</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Enroll your agents in structured training programs to master
            specific skills. Each program contains 10 progressive drills
            designed to challenge and improve your agent.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((program: any) => {
            const icon = CHALLENGE_ICONS[program.challengeType];

            return (
              <div
                key={program.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
              >
                {/* Program Header */}
                <div className="p-6 border-b border-slate-700">
                  <div className="text-4xl mb-3">{icon}</div>
                  <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                  <p className="text-sm text-slate-400">{program.description}</p>
                </div>

                {/* Drills List */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">
                    10 Drills • Progressive Difficulty
                  </h4>
                  <div className="space-y-2 mb-4">
                    {program.drills.slice(0, 5).map((drill: any) => (
                      <div
                        key={drill.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-slate-500">#{drill.orderIndex}</span>
                        <span className="text-slate-300">{drill.title}</span>
                        <span className="ml-auto text-xs text-slate-500">
                          Difficulty: {"⭐".repeat(drill.difficulty)}
                        </span>
                      </div>
                    ))}
                    {program.drills.length > 5 && (
                      <div className="text-sm text-slate-500 pl-6">
                        ... and {program.drills.length - 5} more
                      </div>
                    )}
                  </div>

                  {/* Enroll Button */}
                  {!session ? (
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Login to Enroll
                    </Link>
                  ) : userAgents.length === 0 ? (
                    <Link
                      href="/agent/new"
                      className="block w-full text-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Create Agent First
                    </Link>
                  ) : (
                    <EnrollModal
                      programSlug={program.slug}
                      programTitle={program.title}
                      agents={userAgents}
                      enrollmentMap={enrollmentMap}
                    />
                  )}
                </div>

                {/* Stats */}
                <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      {program._count.enrollments} agents enrolled
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
