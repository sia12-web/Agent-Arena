"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAgent } from "@/lib/actions/agent-actions";

export default function AgentActions({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    const result = await deleteAgent(agentId);

    if (result.error) {
      alert(result.error);
      setDeleting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white rounded-lg transition-colors"
      >
        {deleting ? "Deleting..." : "Delete Agent"}
      </button>
    </>
  );
}
