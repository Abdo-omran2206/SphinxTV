"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Heart, Radio, Sparkles, Tv } from "lucide-react";
import { Channel } from "@/types/channel";
import { useSphinxStore } from "@/store/useSphinxStore";
import { getCountryFlagEmoji, formatCountryName } from "@/lib/utils";

interface HeroBannerProps {
  featuredChannel: Channel;
}

export function HeroBanner({ featuredChannel }: HeroBannerProps) {
  const [logoError, setLogoError] = useState(false);
  const [triedProxy, setTriedProxy] = useState(false);

  const { toggleFavorite, isFavorite } = useSphinxStore();
  const favorite = isFavorite(featuredChannel.id);

  // Logo source resolution
  const getLogoSrc = () => {
    if (logoError) return "/icon.png";
    if (triedProxy && featuredChannel.logo && !featuredChannel.logo.startsWith("/api/image/proxy")) {
      return `/api/image/proxy?url=${encodeURIComponent(featuredChannel.logo)}`;
    }
    if (featuredChannel.logo) {
      return featuredChannel.logo;
    }
    return "/icon.png";
  };

  const handleLogoError = () => {
    if (!triedProxy && featuredChannel.logo && !featuredChannel.logo.startsWith("/api/image/proxy")) {
      setTriedProxy(true);
    } else {
      setLogoError(true);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111827] shadow-card min-h-[340px] sm:min-h-[400px] flex items-center">
      {/* Ambient Egyptian Heritage Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A] via-[#111827] to-[#0A1F44] opacity-95" />
      
      {/* Decorative Subtle Background Elements */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
      
      {/* Right side large watermark logo */}
      <div className="absolute right-6 sm:right-16 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center opacity-15 pointer-events-none">
        <img
          src={getLogoSrc()}
          alt=""
          referrerPolicy="no-referrer"
          onError={handleLogoError}
          className="max-h-72 max-w-72 object-contain filter grayscale"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col justify-between w-full p-6 sm:p-10 lg:p-14 gap-6">
        <div className="max-w-2xl space-y-4">
          {/* Live Badge & Category Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full bg-accent-red px-3 py-1 text-xs font-black text-white shadow-sm uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>LIVE NOW</span>
            </span>

            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
              {featuredChannel.country === "EG" ? "🇪🇬 Egyptian Spotlight" : "⭐ Featured Broadcast"}
            </span>

            {featuredChannel.categories?.[0] && (
              <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold text-zinc-300 capitalize border border-white/[0.06]">
                {featuredChannel.categories[0]}
              </span>
            )}
          </div>

          {/* Channel Logo + Title Header */}
          <div className="flex items-center gap-4 pt-1">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-surface/90 p-2.5 border border-white/[0.1] shadow-card">
              <img
                src={getLogoSrc()}
                alt={featuredChannel.name}
                referrerPolicy="no-referrer"
                onError={handleLogoError}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                {featuredChannel.name}
              </h1>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                <span>
                  {getCountryFlagEmoji(featuredChannel.country)}{" "}
                  {formatCountryName(featuredChannel.country)}
                </span>
                <span>•</span>
                <span className="text-cyan font-bold">1080p HD</span>
                <span>•</span>
                <span>Adaptive Live Stream</span>
              </div>
            </div>
          </div>

          {/* Subtitle / Details */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2 max-w-lg">
            Stream live broadcasts seamlessly on SphinxTV with adaptive bitrate, full-screen playback, and crystal-clear audio quality.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href={`/watch/${encodeURIComponent(featuredChannel.id)}`}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold via-gold-glow to-gold-dark px-7 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-gold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              Watch Live Now
            </Link>

            <button
              onClick={() => toggleFavorite(featuredChannel.id)}
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs sm:text-sm font-bold backdrop-blur-md transition-all ${
                favorite
                  ? "border-gold bg-gold/15 text-gold shadow-gold"
                  : "border-white/[0.12] bg-surface/80 text-zinc-200 hover:border-gold/40 hover:text-white"
              }`}
            >
              <Heart className={`h-4 w-4 ${favorite ? "fill-gold text-gold" : "text-zinc-400"}`} />
              <span>{favorite ? "Saved to Favorites" : "Add to Favorites"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
