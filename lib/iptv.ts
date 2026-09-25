import { Channel, RawApiChannel, RawApiStream } from "@/types/channel";

const CHANNELS_API_URL = "https://iptv-org.github.io/api/channels.json";
const STREAMS_API_URL = "https://iptv-org.github.io/api/streams.json";

// In-memory global singleton cache
declare global {
  var __sphinxChannelCache: { data: Channel[]; timestamp: number } | undefined;
  var __sphinxFetchPromise: Promise<Channel[]> | undefined;
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours in-memory TTL

export async function fetchAllChannels(): Promise<Channel[]> {
  const now = Date.now();

  // 1. Return existing in-memory cached channels if valid
  if (
    globalThis.__sphinxChannelCache &&
    now - globalThis.__sphinxChannelCache.timestamp < CACHE_TTL_MS &&
    globalThis.__sphinxChannelCache.data.length > 0
  ) {
    return globalThis.__sphinxChannelCache.data;
  }

  // 2. If a fetch is already in flight, reuse promise
  if (globalThis.__sphinxFetchPromise) {
    return globalThis.__sphinxFetchPromise;
  }

  // 3. Start fetch with promise deduplication
  globalThis.__sphinxFetchPromise = (async () => {
    try {
      const [channelsRes, streamsRes] = await Promise.all([
        fetch(CHANNELS_API_URL, { cache: "no-store" }),
        fetch(STREAMS_API_URL, { cache: "no-store" }),
      ]);

      if (!channelsRes.ok || !streamsRes.ok) {
        throw new Error(
          `IPTV fetch failed: channels (${channelsRes.status}), streams (${streamsRes.status})`
        );
      }

      const [channelsData, streamsData]: [RawApiChannel[], RawApiStream[]] =
        await Promise.all([channelsRes.json(), streamsRes.json()]);

      // Stream lookup map - prefer HTTPS and .m3u8
      const streamMap = new Map<string, RawApiStream>();
      for (const stream of streamsData) {
        if (!stream.channel || !stream.url) continue;
        const existing = streamMap.get(stream.channel);
        if (!existing) {
          streamMap.set(stream.channel, stream);
        } else if (stream.url.startsWith("https://") && !existing.url.startsWith("https://")) {
          streamMap.set(stream.channel, stream);
        } else if (stream.url.includes(".m3u8") && !existing.url.includes(".m3u8")) {
          streamMap.set(stream.channel, stream);
        }
      }

      // Merge verified fallback channels at top
      const fallbackList = getFallbackChannels();
      const fallbackIds = new Set(fallbackList.map((f) => f.id.toLowerCase()));

      const merged: Channel[] = [...fallbackList];

      for (const ch of channelsData) {
        if (!ch.id || fallbackIds.has(ch.id.toLowerCase())) continue;
        const stream = streamMap.get(ch.id);
        if (!stream || !stream.url) continue;
        if (ch.is_nsfw) continue;

        let logoUrl = ch.logo?.trim() || "";
        if (logoUrl.startsWith("http://")) {
          logoUrl = "https://" + logoUrl.slice(7);
        }

        // Route Imgur and known blocked CDNs through our image proxy
        if (logoUrl.includes("imgur.com")) {
          logoUrl = `/api/image/proxy?url=${encodeURIComponent(logoUrl)}`;
        } else if (!logoUrl && ch.id) {
          logoUrl = `https://raw.githubusercontent.com/iptv-org/logos/master/logos/${ch.id}.png`;
        }

        merged.push({
          id: ch.id,
          name: ch.name || ch.id,
          nativeName: ch.native_name || null,
          network: ch.network || null,
          country: ch.country ? ch.country.toUpperCase() : "EG",
          subdivision: ch.subdivision || null,
          city: ch.city || null,
          broadcastArea: ch.broadcast_area || [],
          languages: ch.languages || [],
          categories:
            ch.categories && ch.categories.length > 0
              ? ch.categories
              : ["general"],
          isNsfw: false,
          launched: ch.launched || null,
          closed: ch.closed || null,
          replacedBy: ch.replaced_by || null,
          website: ch.website || null,
          logo: logoUrl,
          streamUrl: stream.url,
          streamQuality: stream.quality || null,
          httpReferrer: stream.http_referrer || null,
          userAgent: stream.user_agent || null,
        });
      }

      // Sort: Egyptian & Arab channels first, then channels with logos and HTTPS
      merged.sort((a, b) => {
        // Fallback verified streams always first
        if (fallbackIds.has(a.id.toLowerCase()) && !fallbackIds.has(b.id.toLowerCase())) return -1;
        if (!fallbackIds.has(a.id.toLowerCase()) && fallbackIds.has(b.id.toLowerCase())) return 1;

        if (a.country === "EG" && b.country !== "EG") return -1;
        if (a.country !== "EG" && b.country === "EG") return 1;

        if (a.logo && !b.logo) return -1;
        if (!a.logo && b.logo) return 1;

        return 0;
      });

      globalThis.__sphinxChannelCache = {
        data: merged,
        timestamp: Date.now(),
      };

      return merged;
    } catch (error) {
      console.error("SphinxTV IPTV loader error:", error);
      if (globalThis.__sphinxChannelCache?.data?.length) {
        return globalThis.__sphinxChannelCache.data;
      }
      return getFallbackChannels();
    } finally {
      globalThis.__sphinxFetchPromise = undefined;
    }
  })();

  return globalThis.__sphinxFetchPromise;
}

export async function getChannelById(id: string): Promise<Channel | null> {
  const channels = await fetchAllChannels();
  const lowerId = id.toLowerCase();
  return channels.find((c) => c.id.toLowerCase() === lowerId) || null;
}

export async function getCategories(
  channels?: Channel[]
): Promise<{ id: string; name: string; count: number }[]> {
  const channelList = channels || (await fetchAllChannels());
  const categoryMap = new Map<string, number>();

  for (const channel of channelList) {
    for (const cat of channel.categories) {
      if (!cat) continue;
      const key = cat.toLowerCase();
      categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
    }
  }

  const sortedCategories = Array.from(categoryMap.entries())
    .map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return [
    { id: "all", name: "All Channels", count: channelList.length },
    ...sortedCategories,
  ];
}

export async function getCountries(
  channels?: Channel[]
): Promise<{ code: string; name: string; count: number }[]> {
  const channelList = channels || (await fetchAllChannels());
  const countryMap = new Map<string, number>();

  for (const channel of channelList) {
    if (!channel.country) continue;
    const code = channel.country.toUpperCase();
    countryMap.set(code, (countryMap.get(code) || 0) + 1);
  }

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const sortedCountries = Array.from(countryMap.entries())
    .map(([code, count]) => {
      let name = code;
      try {
        name = regionNames.of(code) || code;
      } catch {
        name = code;
      }
      return { code, name, count };
    })
    .sort((a, b) => {
      if (a.code === "EG") return -1;
      if (b.code === "EG") return 1;
      return b.count - a.count;
    });

  return [
    { code: "all", name: "All Countries", count: channelList.length },
    ...sortedCountries,
  ];
}

// 100% Active 24/7 Verified Live Streams
function getFallbackChannels(): Channel[] {
  return [
    {
      id: "AlJazeeraEnglish.qa",
      name: "Al Jazeera English",
      country: "QA",
      categories: ["news", "general"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_English_logo.svg/1200px-Al_Jazeera_English_logo.svg.png",
      streamUrl: "https://live-hls-web-aje.getaj.net/AJE/01.m3u8",
    },
    {
      id: "AlJazeeraArabic.qa",
      name: "Al Jazeera Arabic",
      country: "QA",
      categories: ["news", "general"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Al_Jazeera_Channel_logo.svg/1200px-Al_Jazeera_Channel_logo.svg.png",
      streamUrl: "https://live-hls-web-aja.getaj.net/AJA/01.m3u8",
    },
    {
      id: "DWEnglish.de",
      name: "DW English HD",
      country: "DE",
      categories: ["news", "documentary"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_logo.svg/1200px-Deutsche_Welle_logo.svg.png",
      streamUrl: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    },
    {
      id: "France24English.fr",
      name: "France 24 English",
      country: "FR",
      categories: ["news"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/France_24_logo.svg/1200px-France_24_logo.svg.png",
      streamUrl: "https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8",
    },
    {
      id: "France24Arabic.fr",
      name: "France 24 Arabic",
      country: "FR",
      categories: ["news"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/France_24_logo.svg/1200px-France_24_logo.svg.png",
      streamUrl: "https://static.france24.com/live/F24_AR_LO_HLS/live_tv.m3u8",
    },
    {
      id: "RedBullTV.us",
      name: "Red Bull TV Live",
      country: "US",
      categories: ["sports", "entertainment"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png",
      streamUrl: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    },
    {
      id: "NASATV.us",
      name: "NASA TV HD",
      country: "US",
      categories: ["science", "documentary"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1200px-NASA_logo.svg.png",
      streamUrl: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
    },
    {
      id: "RotanaCinemaEgypt.eg",
      name: "Rotana Cinema Egypt",
      country: "EG",
      categories: ["movies", "entertainment"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Rotana_Cinema_logo.png/640px-Rotana_Cinema_logo.png",
      streamUrl: "https://rotana.hibridcdn.net/rotananet/cinemamasr_net-7Y83PP5adWixDF93/rotana/cinemamasr_360p/chunks.m3u8",
    },
    {
      id: "TRTWorld.tr",
      name: "TRT World HD",
      country: "TR",
      categories: ["news", "documentary"],
      isNsfw: false,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/TRT_World_logo.svg/1200px-TRT_World_logo.svg.png",
      streamUrl: "https://tv-trtworld.medya.trt.com.tr/master.m3u8",
    },
    {
      id: "NileCinema.eg",
      name: "Nile Cinema Egypt",
      country: "EG",
      categories: ["movies", "culture"],
      isNsfw: false,
      logo: "https://i.imgur.com/8Q0bZ9l.png",
      streamUrl: "https://nile-live.ercdn.net/nilecinema/nilecinema.m3u8",
    },
  ];
}
