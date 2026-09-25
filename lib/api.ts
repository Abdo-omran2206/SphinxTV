import { Channel } from "@/types/channel";

export async function fetchChannelsClient(): Promise<Channel[]> {
  try {
    const res = await fetch("/api/channels");
    if (!res.ok) {
      throw new Error(`Failed to fetch channels: ${res.statusText}`);
    }
    const data = await res.json();
    return data.channels || [];
  } catch (error) {
    console.error("Client fetch error:", error);
    return [];
  }
}

export async function fetchChannelByIdClient(id: string): Promise<Channel | null> {
  try {
    const res = await fetch(`/api/channels/${encodeURIComponent(id)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch channel ${id}`);
    }
    const data = await res.json();
    return data.channel || null;
  } catch (error) {
    console.error(`Client fetch error for channel ${id}:`, error);
    return null;
  }
}
