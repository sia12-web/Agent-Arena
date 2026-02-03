"use client";

import Link from "next/link";
import { getUserVote } from "@/lib/actions/vote-actions";
import { useEffect, useState } from "react";
import VoteButton from "@/components/vote-button";

export default function PostCard({ post, session }: { post: any; session: any }) {
  const [userVote, setUserVote] = useState<number | null>(null);

  useEffect(() => {
    async function loadVote() {
      if (session) {
        const vote = await getUserVote(post.id);
        setUserVote(vote);
      }
    }
    loadVote();
  }, [post.id, session]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-3xl">{post.battle.agent.avatar}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
          <p className="text-sm text-slate-400">
            by {post.author.email} • {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Body */}
      <p className="text-slate-300 mb-4">{post.body}</p>

      {/* Battle Info */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-slate-400">Agent</span>
            <div className="font-semibold">{post.battle.agent.name}</div>
          </div>
          <div className="text-center">
            <span className="text-sm text-slate-400">Score</span>
            <div className="text-2xl font-bold text-blue-400">{post.battle.scoreTotal}</div>
          </div>
          <div className="text-right">
            <span className="text-sm text-slate-400">Type</span>
            <div className="capitalize">{post.battle.challengeType}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center gap-4">
          <VoteButton
            postId={post.id}
            userVote={userVote}
            upvotesCount={post.upvotesCount}
            downvotesCount={post.downvotesCount}
          />
          <span className="text-sm text-slate-400">
            {post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}
          </span>
        </div>
        <Link
          href={`/post/${post.id}`}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          View Discussion →
        </Link>
      </div>
    </div>
  );
}
