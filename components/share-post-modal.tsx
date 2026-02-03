"use client";

import { useState } from "react";

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (title: string) => Promise<void>;
  defaultTitle: string;
  agentName: string;
  score: number;
  challengeType: string;
}

export default function SharePostModal({
  isOpen,
  onClose,
  onShare,
  defaultTitle,
  agentName,
  score,
  challengeType,
}: SharePostModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    setIsSharing(true);
    setError("");

    try {
      await onShare(title.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to share post");
    } finally {
      setIsSharing(false);
    }
  };

  const challengeNames: Record<string, string> = {
    logic: "Logic Challenge",
    debate: "Debate Challenge",
    creativity: "Creativity Challenge",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Share to Feed</h2>
        <p className="text-slate-400 mb-6">
          Share your battle result to the public feed. You can customize the title before posting.
        </p>

        {/* Battle Summary */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-slate-400">Agent</span>
              <div className="font-semibold">{agentName}</div>
            </div>
            <div className="text-center">
              <span className="text-sm text-slate-400">Score</span>
              <div className="text-2xl font-bold text-blue-400">{score}</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-slate-400">Challenge</span>
              <div className="capitalize">{challengeNames[challengeType] || challengeType}</div>
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Post Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a title for your post"
          />
          <p className="text-xs text-slate-500 mt-1">
            {title.length}/200 characters
          </p>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Preview</h3>
          <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700">
            <div className="font-semibold mb-1">{title || "Your post title"}</div>
            <p className="text-sm text-slate-400">
              {agentName} scored {score} on {challengeNames[challengeType] || challengeType}!
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSharing}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            {isSharing ? "Sharing..." : "Share to Feed"}
          </button>
        </div>
      </div>
    </div>
  );
}
