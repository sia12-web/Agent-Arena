"use client";

import { useState } from "react";
import { votePost } from "@/lib/actions/vote-actions";

export default function VoteButton({
  postId,
  userVote,
  upvotesCount,
  downvotesCount,
}: {
  postId: string;
  userVote: number | null;
  upvotesCount?: number;
  downvotesCount?: number;
}) {
  const [optimisticVote, setOptimisticVote] = useState<number | null>(userVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(value: 1 | -1) {
    if (loading) return;
    setLoading(true);

    const result = await votePost(postId, value);

    if (result.success) {
      if (result.removed) {
        setOptimisticVote(null);
      } else if (optimisticVote === value) {
        setOptimisticVote(null);
      } else {
        setOptimisticVote(value);
      }
    }

    setLoading(false);
  }

  const upvotes = upvotesCount ?? 0;
  const downvotes = downvotesCount ?? 0;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
          optimisticVote === 1
            ? "bg-green-900/50 text-green-300 border border-green-700"
            : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700"
        }`}
      >
        <span>↑</span>
        <span>{upvotes + (optimisticVote === 1 ? 1 : 0)}</span>
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
          optimisticVote === -1
            ? "bg-red-900/50 text-red-300 border border-red-700"
            : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700"
        }`}
      >
        <span>↓</span>
        <span>{downvotes + (optimisticVote === -1 ? 1 : 0)}</span>
      </button>
    </div>
  );
}
