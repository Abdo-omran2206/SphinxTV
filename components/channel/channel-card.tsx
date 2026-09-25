"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Play } from "lucide-react";
import { Channel } from "@/types/channel";
import { useSphinxStore } from "@/store/useSphinxStore";
import { getCountryFlagEmoji } from "@/lib/utils";

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const [triedProxy, setTriedProxy] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const { toggleFavorite, isFavorite } = useSphinxStore();
  const favorite = isFavorite(channel.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(channel.id);
  };

  const getLogoSrc = () => {
    if (logoFailed) return "/icon.png";
    if (triedProxy && channel.logo && !channel.logo.startsWith("/api/image/proxy")) {
      return `/api/image/proxy?url=${encodeURIComponent(channel.logo)}`;
    }
    if (channel.logo) {
      return channel.logo;
    }
    return "/icon.png";
  };

  const handleLogoError = () => {
    if (!triedProxy && channel.logo && !channel.logo.startsWith("/api/image/proxy")) {
      setTriedProxy(true);
    } else {
      setLogoFailed(true);
    }
  };

  const showFallbackIcon = logoFailed;

  return (
    <Link
      href={`/watch/${encodeURIComponent(channel.id)}`}
      className="group stream-card relative flex flex-col overflow-hidden rounded-xl"
    >
      {/* Thumbnail / Logo Preview Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#111722] p-4 flex items-center justify-center border-b border-white/[0.04]">
        {/* Channel Logo or App Icon Fallback */}
        {!showFallbackIcon ? (
          <img
            src={getLogoSrc()}
            alt={channel.name}
            onError={handleLogoError}
            referrerPolicy="no-referrer"
            className="max-h-16 max-w-[70%] object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <img
              src="/icon.png"
              alt="SphinxTV"
              className="h-10 w-10 object-contain opacity-90"
            />
            <span className="text-[10px] font-semibold text-zinc-300">
              {channel.name.slice(0, 14)}
            </span>
          </div>
        )}

        {/* Subtle Live Dot Top-Left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-accent-red">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* Favorite Button Top-Right */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
            favorite
              ? "bg-gold text-slate-950"
              : "bg-black/50 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-slate-950" : ""}`} />
        </button>

        {/* Clean Hover Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-slate-950 shadow-md">
            <Play className="h-4 w-4 ml-0.5 fill-slate-950" />
          </div>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="line-clamp-1 text-xs font-semibold text-zinc-100 group-hover:text-gold transition-colors">
              {channel.name}
            </h3>
            <span className="text-sm shrink-0" title={`Country: ${channel.country}`}>
              {getCountryFlagEmoji(channel.country)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1">
            {channel.categories?.slice(0, 1).map((category) => (
              <span
                key={category}
                className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-400 capitalize"
              >
                {category}
              </span>
            ))}
            {channel.country === "EG" && (
              <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                Egypt
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
