"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, Heart, Search } from "lucide-react";
import { useSphinxStore } from "@/store/useSphinxStore";

export function MobileNav() {
  const pathname = usePathname();
  const { onlyFavorites, setOnlyFavorites, favorites, searchQuery, setSearchQuery } =
    useSphinxStore();

  const isLive = pathname === "/live" || pathname === "/" || pathname.startsWith("/watch");

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#0B0F1A]/95 backdrop-blur-2xl px-6 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Link
          href="/live"
          onClick={() => {
            if (onlyFavorites) setOnlyFavorites(false);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            isLive && !onlyFavorites ? "text-gold" : "text-zinc-400"
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        {/* Live TV */}
        <Link
          href="/live"
          onClick={() => {
            if (onlyFavorites) setOnlyFavorites(false);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
            isLive && !onlyFavorites ? "text-cyan" : "text-zinc-400"
          }`}
        >
          <Radio className="h-4 w-4 animate-pulse" />
          <span>Live TV</span>
        </Link>

        {/* Favorites */}
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors relative ${
            onlyFavorites ? "text-gold" : "text-zinc-400"
          }`}
        >
          <div className="relative">
            <Heart className={`h-4 w-4 ${onlyFavorites ? "fill-gold text-gold" : ""}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-black text-slate-950">
                {favorites.length}
              </span>
            )}
          </div>
          <span>Favorites</span>
        </button>

        {/* Search */}
        <button
          onClick={() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) input.focus();
          }}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
}
