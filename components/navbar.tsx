"use client";

import Link from "next/link";
import { Search, Heart, Radio } from "lucide-react";
import { useSphinxStore } from "@/store/useSphinxStore";

export function Navbar() {
  const { searchQuery, setSearchQuery, favorites, onlyFavorites, setOnlyFavorites } =
    useSphinxStore();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#0B0F1A]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/live"
            className="flex items-center gap-2.5 transition-transform hover:scale-105"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-surface p-1.5 border border-gold/40 shadow-gold">
              <img src="/icon.png" alt="SphinxTV" className="h-full w-full object-contain" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-80"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan"></span>
              </span>
            </div>
            <span className="text-lg font-black tracking-wider text-white">
              <span className="gold-text-gradient">SPHINX</span>
              <span className="text-cyan font-black">TV</span>
            </span>
          </Link>
        </div>

        {/* Center/Right: Search Bar & Favorites */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-44 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-surface/90 py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 transition-all focus:border-gold focus:bg-surface focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {/* Favorites Button */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              onlyFavorites
                ? "border-gold bg-gold/15 text-gold shadow-gold"
                : "border-white/[0.08] bg-surface text-zinc-300 hover:border-gold/40 hover:text-white"
            }`}
            title="Favorites"
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                onlyFavorites ? "fill-gold text-gold" : "text-zinc-400"
              }`}
            />
            <span className="hidden sm:inline">Favorites</span>
            {favorites.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-slate-950">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
