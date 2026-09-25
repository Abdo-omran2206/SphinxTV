"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Channel } from "@/types/channel";
import { ChannelCard } from "./channel-card";

interface TrendingCarouselProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  channels: Channel[];
}

export function TrendingCarousel({
  title,
  subtitle,
  icon,
  channels,
}: TrendingCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!channels || channels.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-surface text-zinc-300 hover:bg-surface-hover hover:text-white transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-surface text-zinc-300 hover:bg-surface-hover hover:text-white transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="w-56 sm:w-64 shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <ChannelCard channel={channel} />
          </div>
        ))}
      </div>
    </section>
  );
}
