"use client";

import { useMemo, useState } from "react";
import { Tv } from "lucide-react";
import { Channel } from "@/types/channel";
import { useSphinxStore } from "@/store/useSphinxStore";
import { ChannelCard } from "./channel-card";

interface ChannelListProps {
  initialChannels: Channel[];
}

const ITEMS_PER_PAGE = 36;

export function ChannelList({ initialChannels }: ChannelListProps) {
  const {
    searchQuery,
    selectedCategory,
    selectedCountry,
    onlyFavorites,
    favorites,
    resetFilters,
  } = useSphinxStore();

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Filter channels based on state
  const filteredChannels = useMemo(() => {
    return initialChannels.filter((channel) => {
      // Favorites filter
      if (onlyFavorites && !favorites.includes(channel.id)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = channel.name.toLowerCase().includes(q);
        const matchesId = channel.id.toLowerCase().includes(q);
        const matchesCategory = channel.categories?.some((cat) =>
          cat.toLowerCase().includes(q)
        );
        const matchesCountry = channel.country.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCategory && !matchesCountry) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && selectedCategory !== "all") {
        const matchesCat = channel.categories?.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!matchesCat) return false;
      }

      // Country filter
      if (selectedCountry && selectedCountry !== "all") {
        if (channel.country.toLowerCase() !== selectedCountry.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [
    initialChannels,
    searchQuery,
    selectedCategory,
    selectedCountry,
    onlyFavorites,
    favorites,
  ]);

  const displayedChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  const hasMore = visibleCount < filteredChannels.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  if (filteredChannels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-surface/50 p-12 text-center my-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-zinc-400 mb-3 border border-white/[0.06]">
          <Tv className="h-6 w-6 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No channels found</h3>
        <p className="max-w-xs text-xs text-zinc-400 mb-5">
          {onlyFavorites
            ? "You haven't saved any favorites yet. Click the heart on any channel card to bookmark it."
            : "No channels match your current search or filter."}
        </p>
        <button
          onClick={resetFilters}
          className="rounded-lg bg-white/[0.08] hover:bg-white/[0.12] px-4 py-2 text-xs font-semibold text-white transition-colors"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Channels count summary */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <p>
          Showing <span className="font-semibold text-zinc-200">{displayedChannels.length}</span> of{" "}
          <span className="font-semibold text-zinc-200">{filteredChannels.length}</span> channels
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {displayedChannels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6 pb-8">
          <button
            onClick={handleLoadMore}
            className="rounded-xl border border-white/[0.1] bg-surface hover:bg-surface-hover px-6 py-2.5 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Load More Channels ({filteredChannels.length - displayedChannels.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
