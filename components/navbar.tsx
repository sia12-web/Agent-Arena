"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="AgentForge Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AgentForge
            </span>
          </Link>

          <nav className="flex gap-6 items-center">
            <Link
              href="/dashboard"
              className={`transition-colors ${isActive("/dashboard") ? "text-blue-400 font-medium" : "text-slate-300 hover:text-white"
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/arena"
              className={`transition-colors ${isActive("/arena") ? "text-blue-400 font-medium" : "text-slate-300 hover:text-white"
                }`}
            >
              Arena
            </Link>
            <Link
              href="/feed"
              className={`transition-colors ${isActive("/feed") ? "text-blue-400 font-medium" : "text-slate-300 hover:text-white"
                }`}
            >
              Feed
            </Link>
            <Link
              href="/leaderboard"
              className={`transition-colors ${isActive("/leaderboard") ? "text-blue-400 font-medium" : "text-slate-300 hover:text-white"
                }`}
            >
              Leaderboard
            </Link>

            {status === "loading" ? (
              <span className="text-slate-500">Loading...</span>
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">{session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="text-sm text-slate-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
