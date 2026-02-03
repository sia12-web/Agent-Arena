import Link from "next/link";
import { getPostById, getFeedPosts } from "@/lib/actions/post-actions";
import { getPostComments } from "@/lib/actions/comment-actions";
import { getUserVote } from "@/lib/actions/vote-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import VoteButton from "@/components/vote-button";
import CommentSection from "@/components/comment-section";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  const comments = await getPostComments(id);
  const session = await getServerSession(authOptions);
  const userVote = session ? await getUserVote(id) : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/feed" className="text-slate-400 hover:text-white">
            ← Back to Feed
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Post */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{post.battle.agent.avatar}</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              <p className="text-sm text-slate-400">
                by {post.author.email} • {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Body */}
          <p className="text-slate-200 text-lg mb-6">{post.body}</p>

          {/* Battle Info */}
          <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Battle Details</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm text-slate-400">Agent</span>
                <div className="font-semibold flex items-center gap-2">
                  <span className="text-2xl">{post.battle.agent.avatar}</span>
                  <Link href={`/agents/${post.battle.agent.id}`} className="hover:text-blue-400">
                    {post.battle.agent.name}
                  </Link>
                </div>
              </div>
              <div>
                <span className="text-sm text-slate-400">Score</span>
                <div className="text-3xl font-bold text-blue-400">{post.battle.scoreTotal}</div>
              </div>
              <div>
                <span className="text-sm text-slate-400">Challenge Type</span>
                <div className="capitalize font-semibold">{post.battle.challengeType}</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Challenge Input</h4>
              <p className="text-slate-300">{post.battle.inputText}</p>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Agent Response</h4>
              <p className="text-slate-300 whitespace-pre-wrap">{post.battle.outputText}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
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
        </div>

        {/* Comments */}
        <CommentSection postId={post.id} comments={comments} session={session} />
      </div>
    </div>
  );
}
