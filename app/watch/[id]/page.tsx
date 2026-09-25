import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getChannelById, fetchAllChannels } from "@/lib/iptv";
import { VideoPlayer } from "@/components/player/video-player";
import { ChannelCard } from "@/components/channel/channel-card";
import { getCountryFlagEmoji, formatCountryName } from "@/lib/utils";

export const revalidate = 3600;

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [channel, allChannels] = await Promise.all([
    getChannelById(decodedId),
    fetchAllChannels(),
  ]);

  if (!channel) {
    notFound();
  }

  // Related channels by category or country
  const relatedChannels = allChannels
    .filter(
      (c) =>
        c.id.toLowerCase() !== channel.id.toLowerCase() &&
        (c.categories.some((cat) => channel.categories.includes(cat)) ||
          c.country === channel.country)
    )
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/live"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Channels</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Player & Info */}
        <div className="space-y-4 lg:col-span-2">
          {/* Player */}
          <VideoPlayer channel={channel} />

          {/* Channel Details Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-surface p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {channel.logo ? (
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-xl bg-[#111722] p-1.5 object-contain border border-white/[0.06]"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111722] border border-white/[0.06] p-2">
                    <img src="/icon.png" alt="SphinxTV" className="h-full w-full object-contain" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {channel.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>{getCountryFlagEmoji(channel.country)} {formatCountryName(channel.country)}</span>
                    {channel.network && (
                      <>
                        <span>•</span>
                        <span>{channel.network}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap items-center gap-1.5">
                {channel.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 capitalize"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/[0.06] pt-3.5 text-xs">
              <div>
                <span className="text-zinc-500 block">Language</span>
                <span className="font-medium text-zinc-200">
                  {channel.languages?.length ? channel.languages.join(", ") : "Standard"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Stream Format</span>
                <span className="font-medium text-zinc-200">HLS (Adaptive)</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Official Site</span>
                {channel.website ? (
                  <a
                    href={channel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gold hover:underline font-medium"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-zinc-500">Not listed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Channels */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Similar Channels
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {relatedChannels.map((relChannel) => (
              <ChannelCard key={relChannel.id} channel={relChannel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
