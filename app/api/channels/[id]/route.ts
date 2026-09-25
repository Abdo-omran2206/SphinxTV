import { NextResponse } from "next/server";
import { getChannelById } from "@/lib/iptv";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const channel = await getChannelById(decodedId);

    if (!channel) {
      return NextResponse.json(
        { success: false, error: "Channel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      channel,
    });
  } catch (error) {
    console.error("API /api/channels/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load channel details" },
      { status: 500 }
    );
  }
}
