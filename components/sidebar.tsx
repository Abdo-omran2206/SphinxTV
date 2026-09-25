"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, Heart, Compass, Search, Tv, Flame } from "lucide-react";
import { useSphinxStore } from "@/store/useSphinxStore";

export function Sidebar() {
  const pathname = usePathname();
  const { onlyFavorites, setOnlyFavorites, favorites } = useSphinxStore();

  const isHome = pathname === "/" || pathname === "/live";

  return (
    <aside className="group fixed top-0 left-0 bottom-0 z-40 hidden md:flex flex-col justify-between w-16 hover:w-60 bg-[#0B0F1A]/95 border-r border-white/[0.06] backdrop-blur-2xl transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) py-5 px-3 select-none">
      {/* Top Logo */}
      <div className="flex flex-col gap-6">
        <Link
          href="/live"
          className="flex items-center gap-3.5 px-2 py-1 transition-transform group-hover:scale-105"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface p-1.5 border border-gold/40 shadow-gold">
            <img src="/icon.png" alt="SphinxTV" className="h-full w-full object-contain" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-80"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan"></span>
            </span>
          </div>

          <div className="hidden group-hover:flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300">
            <span className="text-base font-black tracking-wider text-white">
              <span className="gold-text-gradient">SPHINX</span>
              <span className="text-cyan">TV</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
              Live Cinema
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {/* Home / Live TV */}
          <Link
            href="/live"
            onClick={() => {
              if (onlyFavorites) setOnlyFavorites(false);
            }}
            className={`flex items-center gap-3.5 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
              isHome && !onlyFavorites
                ? "bg-gradient-to-r from-gold/20 to-transparent text-gold border-l-2 border-gold"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <Radio className={`h-5 w-5 shrink-0 ${isHome && !onlyFavorites ? "text-cyan animate-pulse" : ""}`} />
            <span className="hidden group-hover:inline whitespace-nowrap">Live TV</span>
          </Link>

          {/* Favorites */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-3.5 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
              onlyFavorites
                ? "bg-gradient-to-r from-gold/20 to-transparent text-gold border-l-2 border-gold"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <div className="relative shrink-0">
              <Heart className={`h-5 w-5 ${onlyFavorites ? "fill-gold text-gold" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-black text-slate-950">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="hidden group-hover:inline whitespace-nowrap">Favorites</span>
          </button>
        </nav>
      </div>

      {/* Bottom Profile / Quick Guide info */}
      <div className="border-t border-white/[0.06] pt-4 px-2 hidden group-hover:block whitespace-nowrap">
        <p className="text-[10px] text-zinc-500 font-semibold">
          SphinxTV Live Platform
        </p>
        <p className="text-[9px] text-gold font-bold">
          © {new Date().getFullYear()} Cinematic Stream
        </p>
      </div>
    </aside>
  );
}
