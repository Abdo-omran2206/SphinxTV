import { NextResponse } from "next/server";
import { fetchAllChannels } from "@/lib/iptv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();
    const category = searchParams.get("category");
    const country = searchParams.get("country");
    const limitParam = searchParams.get("limit");

    let channels = await fetchAllChannels();

    if (query) {
      channels = channels.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.categories.some((cat) => cat.toLowerCase().includes(query))
      );
    }

    if (category && category !== "all") {
      channels = channels.filter((c) =>
        c.categories.some((cat) => cat.toLowerCase() === category.toLowerCase())
      );
    }

    if (country && country !== "all") {
      channels = channels.filter(
        (c) => c.country.toLowerCase() === country.toLowerCase()
      );
    }

    const total = channels.length;

    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        channels = channels.slice(0, limit);
      }
    }

    return NextResponse.json({
      success: true,
      total,
      count: channels.length,
      channels,
    });
  } catch (error) {
    console.error("API /api/channels error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load channels" },
      { status: 500 }
    );
  }
}
