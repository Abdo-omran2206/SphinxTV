import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return new NextResponse("Missing 'url' query parameter", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const decodedUrl = decodeURIComponent(targetUrl).trim();

    // Validate URL
    if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    // Try server-side direct fetch first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const parsedUrl = new URL(decodedUrl);
      const isImgur = parsedUrl.hostname.includes("imgur.com");

      const response = await fetch(decodedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          Referer: isImgur ? "https://imgur.com/" : `${parsedUrl.protocol}//${parsedUrl.host}/`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/png";
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400, immutable",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } catch {
      // If direct fetch fails (e.g. ISP block on imgur), fallback to edge CDN
    }

    // Edge CDN proxy fallback (wsrv.nl / Cloudflare cache)
    try {
      const edgeProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(decodedUrl)}&output=webp&q=85`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const edgeRes = await fetch(edgeProxyUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (edgeRes.ok) {
        const contentType = edgeRes.headers.get("content-type") || "image/webp";
        const buffer = await edgeRes.arrayBuffer();

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400, immutable",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } catch {
      // Fallback
    }

    // If both fail, redirect to default icon
    return NextResponse.redirect(new URL("/icon.png", request.url));
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.redirect(new URL("/icon.png", request.url));
  }
}
