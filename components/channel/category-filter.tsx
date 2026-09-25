"use client";

import { useRef } from "react";
import { Search, ChevronLeft, ChevronRight, Globe, X } from "lucide-react";
import { useSphinxStore } from "@/store/useSphinxStore";
import { CategoryOption, CountryOption } from "@/types/channel";

interface CategoryFilterProps {
  categories: CategoryOption[];
  countries: CountryOption[];
}

export function CategoryFilter({ categories, countries }: CategoryFilterProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCountry,
    setSelectedCountry,
    onlyFavorites,
    resetFilters,
  } = useSphinxStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedCountry !== "all" ||
    onlyFavorites;

  return (
    <div className="space-y-3 py-2">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search channels or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-surface py-2 pl-8 pr-8 text-xs text-white placeholder-zinc-500 transition-colors focus:border-gold/50 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Country Selector & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Globe className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-zinc-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="appearance-none rounded-lg border border-white/[0.08] bg-surface py-2 pl-8 pr-7 text-xs font-medium text-zinc-200 transition-colors hover:border-white/[0.2] focus:border-gold/50 focus:outline-none cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code} className="bg-surface text-white">
                  {c.code === "EG" ? "🇪🇬 Egypt (Featured)" : c.name} {c.count ? `(${c.count})` : ""}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-lg border border-white/[0.1] bg-surface px-2.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/[0.2] transition-colors"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="relative flex items-center">
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute -left-2 z-10 h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-zinc-300 shadow-sm hover:text-white transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-gold text-slate-950 font-semibold"
                    : "border border-white/[0.06] bg-surface/80 text-zinc-400 hover:text-white hover:bg-surface"
                }`}
              >
                {cat.name}
                {cat.count !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] ${
                      isSelected ? "text-slate-800" : "text-zinc-500"
                    }`}
                  >
                    ({cat.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute -right-2 z-10 h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-surface text-zinc-300 shadow-sm hover:text-white transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
