import { fetchAllChannels, getCategories, getCountries } from "@/lib/iptv";
import { HeroBanner } from "@/components/channel/hero-banner";
import { TrendingCarousel } from "@/components/channel/trending-carousel";
import { CategoryFilter } from "@/components/channel/category-filter";
import { ChannelList } from "@/components/channel/channel-list";

export const revalidate = 3600;

export default async function HomePage() {
  const [allChannels, categories, countries] = await Promise.all([
    fetchAllChannels(),
    getCategories(),
    getCountries(),
  ]);

  // Featured Hero Channel (Rotana, Nile, or first active channel)
  const featuredChannel =
    allChannels.find((c) => c.country === "EG" && c.logo) || allChannels[0];

  // Curated collections
  const egyptianChannels = allChannels
    .filter(
      (c) =>
        c.country === "EG" ||
        c.id.toLowerCase().includes("egypt") ||
        c.name.toLowerCase().includes("rotana") ||
        c.name.toLowerCase().includes("nile") ||
        c.name.toLowerCase().includes("al jazeera")
    )
    .slice(0, 10);

  const trendingChannels = allChannels.slice(0, 10);
  const movieChannels = allChannels
    .filter(
      (c) =>
        c.categories.includes("movies") ||
        c.categories.includes("entertainment") ||
        c.categories.includes("series")
    )
    .slice(0, 10);

  const newsChannels = allChannels
    .filter((c) => c.categories.includes("news"))
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10 pb-16">
      {/* 1. Hero Featured Channel Billboard */}
      {featuredChannel && <HeroBanner featuredChannel={featuredChannel} />}

      {/* 2. Egyptian Broadcasts & Cinema Spotlight */}
      {egyptianChannels.length > 0 && (
        <TrendingCarousel
          title="Egyptian & Arabic Channels"
          subtitle="Live broadcasts and cinema streams"
          channels={egyptianChannels}
        />
      )}

      {/* 3. Trending Now */}
      <TrendingCarousel
        title="Trending Live Channels"
        subtitle="Popular channels with active viewers"
        channels={trendingChannels}
      />

      {/* 4. Movies & Entertainment */}
      {movieChannels.length > 0 && (
        <TrendingCarousel
          title="Movies & Entertainment"
          subtitle="Feature films, drama, and comedy streams"
          channels={movieChannels}
        />
      )}

      {/* 5. News Channels */}
      {newsChannels.length > 0 && (
        <TrendingCarousel
          title="News & Current Affairs"
          subtitle="24/7 global and regional news coverage"
          channels={newsChannels}
        />
      )}

      {/* 6. All Channels Directory */}
      <section className="space-y-4 pt-4 border-t border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="text-lg font-bold text-white">All Channels</h2>
          <span className="text-xs text-zinc-400">
            {allChannels.length} total channels available
          </span>
        </div>

        {/* Filter & Search */}
        <CategoryFilter categories={categories} countries={countries} />

        {/* Channels Grid */}
        <ChannelList initialChannels={allChannels} />
      </section>
    </div>
  );
}
