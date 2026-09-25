import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Helper to resolve relative URLs against base URL
function resolveUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return relativeUrl;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const referer = searchParams.get("referer");
    const userAgent = searchParams.get("ua");

    if (!targetUrl) {
      return new NextResponse("Missing 'url' query parameter", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const decodedTargetUrl = decodeURIComponent(targetUrl).trim();

    // Setup headers
    const headers: Record<string, string> = {
      "User-Agent":
        userAgent ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Encoding": "identity",
    };

    if (referer) {
      headers["Referer"] = referer;
    } else {
      try {
        const parsed = new URL(decodedTargetUrl);
        headers["Referer"] = `${parsed.protocol}//${parsed.host}/`;
      } catch {
        // ignore
      }
    }

    // Set timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(decodedTargetUrl, {
        headers,
        redirect: "follow",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstreamResponse.ok) {
      return new NextResponse(
        `Upstream error status: ${upstreamResponse.status}`,
        {
          status: upstreamResponse.status,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          },
        }
      );
    }

    const rawContentType =
      upstreamResponse.headers.get("content-type") || "";
    const isM3u8 =
      decodedTargetUrl.includes(".m3u8") ||
      rawContentType.includes("application/vnd.apple.mpegurl") ||
      rawContentType.includes("application/x-mpegurl") ||
      rawContentType.includes("text/plain");

    // If it's an M3U8 manifest, parse and rewrite all URI lines
    if (isM3u8) {
      const originalText = await upstreamResponse.text();

      // Check if it's actually an m3u8 playlist
      if (originalText.includes("#EXTM3U") || decodedTargetUrl.includes(".m3u8")) {
        const lines = originalText.split(/\r?\n/);
        const rewrittenLines = lines.map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "";

          // Tags
          if (trimmed.startsWith("#")) {
            // Rewrite URI="..." attributes in tags like #EXT-X-MEDIA, #EXT-X-KEY, #EXT-X-MAP
            if (trimmed.includes('URI="')) {
              return trimmed.replace(/URI="([^"]+)"/g, (_, uri) => {
                const full = resolveUrl(decodedTargetUrl, uri);
                const proxied = `/api/stream/proxy?url=${encodeURIComponent(full)}${
                  referer ? `&referer=${encodeURIComponent(referer)}` : ""
                }`;
                return `URI="${proxied}"`;
              });
            }
            return line;
          }

          // Segments and Sub-playlists
          const fullUrl = resolveUrl(decodedTargetUrl, trimmed);
          return `/api/stream/proxy?url=${encodeURIComponent(fullUrl)}${
            referer ? `&referer=${encodeURIComponent(referer)}` : ""
          }`;
        });

        return new NextResponse(rewrittenLines.join("\n"), {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      }
    }

    // For media segments (.ts, .aac, .m4s, .mp4), return binary ArrayBuffer
    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const contentType =
      rawContentType ||
      (decodedTargetUrl.includes(".ts")
        ? "video/mp2t"
        : decodedTargetUrl.includes(".m4s")
        ? "video/iso.segment"
        : decodedTargetUrl.includes(".mp4")
        ? "video/mp4"
        : "application/octet-stream");

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("Stream proxy fetch error:", err?.message || err);
    return new NextResponse(`Stream connection error: ${err?.message || "Failed to reach host"}`, {
      status: 502,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
