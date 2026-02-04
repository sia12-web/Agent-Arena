import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEnrollmentForTraining } from "@/lib/actions/program-actions";
import TrainingClient from "./training-client";

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { enrollmentId } = await params;

  if (!session) {
    redirect("/login");
  }

  const result = await getEnrollmentForTraining(enrollmentId);

  if ("error" in result && result.error) {
    redirect("/dashboard");
  }

  const { enrollment, nextDrill, progressPercent, isComplete } = result as any;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
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

        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-4">Program Complete!</h1>
          <p className="text-slate-400 mb-8">
            {enrollment.agent.name} has completed all drills in{" "}
            {enrollment.program.title}
          </p>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Final Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-green-400">100%</div>
                <div className="text-sm text-slate-400">Completion</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {enrollment.program.drills.length}
                </div>
                <div className="text-sm text-slate-400">Drills Completed</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/programs"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Browse Programs
            </Link>
            <Link
              href={`/dashboard/agents/${enrollment.agentId}`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg"
            >
              View Agent
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TrainingClient
      enrollment={enrollment}
      nextDrill={nextDrill}
      progressPercent={progressPercent}
    />
  );
}
