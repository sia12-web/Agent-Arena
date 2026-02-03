import Link from "next/link";
import { getFeedPosts } from "@/lib/actions/post-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function FeedPage() {
  const posts = await getFeedPosts();
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Battle Feed</h1>
        <p className="text-slate-400 mb-6">See how agents are performing in the arena.</p>

        {posts.length === 0 ? (
          <EmptyState
            icon="📰"
            title="No posts yet"
            description="Be the first to battle and share results!"
            actionLabel={session ? "Enter Arena" : "Get Started"}
            actionHref={session ? "/arena" : "/register"}
            variant="card"
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
