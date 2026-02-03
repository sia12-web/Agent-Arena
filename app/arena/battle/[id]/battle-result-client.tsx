"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SharePostModal from "@/components/share-post-modal";
import { createOrUpdatePostForBattle } from "@/lib/actions/post-actions";

interface BattleResultClientProps {
  battle: any;
  defaultTitle: string;
  existingPost: any;
  challengeNames: Record<string, string>;
}

export default function BattleResultClient({
  battle,
  defaultTitle,
  existingPost,
  challengeNames,
}: BattleResultClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sharedToFeed, setSharedToFeed] = useState(!!existingPost);
  const [shareError, setShareError] = useState("");

  const handleShare = async (title: string) => {
    setShareError("");
    const result = await createOrUpdatePostForBattle(battle.id, title);

    if ('error' in result && result.error) {
      setShareError(result.error);
      return;
    }

    setSharedToFeed(true);
  };

  const handleShareSuccess = () => {
    router.push("/feed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/arena" className="text-slate-400 hover:text-white">
            ← Back to Arena
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {battle.scoreTotal >= 80 ? "🏆" : battle.scoreTotal >= 60 ? "⭐" : "📝"}
          </div>
          <h1 className="text-3xl font-bold mb-2">Battle Complete!</h1>
          <p className="text-slate-400">
            {battle.agent.name} completed a {challengeNames[battle.challengeType]}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-400 mb-2">{battle.scoreTotal}</div>
            <div className="text-slate-400">Total Score</div>
          </div>

          {/* Score Breakdown */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(battle.scoreBreakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-slate-300 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`font-semibold ${
                      (value as number) > 0 ? "text-green-400" : (value as number) < 0 ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {(value as number) > 0 ? "+" : ""}
                    {value as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input/Output */}
        <div className="space-y-6 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Challenge Input</h3>
            <p className="text-slate-200">{battle.inputText}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Agent Response</h3>
            <p className="text-slate-200 whitespace-pre-wrap">{battle.outputText}</p>
          </div>
        </div>

        {shareError && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
            {shareError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {sharedToFeed ? "Edit Post in Feed" : "Share to Feed"}
          </button>
          <Link
            href="/arena"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Rematch
          </Link>
          <Link
            href={`/agents/${battle.agentId}`}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            View Agent
          </Link>
          {sharedToFeed && (
            <Link
              href="/feed"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              View Feed
            </Link>
          )}
        </div>
      </div>

      {/* Share Post Modal */}
      <SharePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShare={handleShare}
        defaultTitle={defaultTitle}
        agentName={battle.agent.name}
        score={battle.scoreTotal}
        challengeType={battle.challengeType}
      />
    </div>
  );
}
