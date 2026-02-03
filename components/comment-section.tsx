"use client";

import { useState } from "react";
import { createComment, deleteComment } from "@/lib/actions/comment-actions";

export default function CommentSection({
  postId,
  comments: initialComments,
  session,
}: {
  postId: string;
  comments: any[];
  session: any;
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comments, setComments] = useState(initialComments);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!session) {
      setError("Please sign in to comment");
      return;
    }

    if (body.trim().length < 1) {
      setError("Comment cannot be empty");
      return;
    }

    setLoading(true);

    const result = await createComment(postId, body);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setBody("");
    setLoading(false);
    // Add new comment to list
    if (result.comment) {
      setComments([...comments, result.comment]);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const result = await deleteComment(commentId);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Remove comment from list
    setComments(comments.filter((c) => c.id !== commentId));
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500">{body.length}/1000</span>
            <button
              type="submit"
              disabled={loading || body.trim().length < 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-slate-900/30 rounded-lg text-center">
          <p className="text-slate-400 mb-2">Sign in to join the discussion</p>
          <a
            href="/login"
            className="text-blue-400 hover:text-blue-300"
          >
            Sign In →
          </a>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div
              key={comment.id}
              className="border-l-2 border-slate-700 pl-4 py-2"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    {comment.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{comment.user.email}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {session?.user?.id === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-slate-300">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
