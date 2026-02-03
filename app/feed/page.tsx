import Link from "next/link";
import { getFeedPosts } from "@/lib/actions/post-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";

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
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">📰</div>
            <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
            <p className="text-slate-400 mb-4">Be the first to battle and share results!</p>
            <Link
              href={session ? "/arena" : "/register"}
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              {session ? "Enter Arena" : "Get Started"}
            </Link>
          </div>
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
