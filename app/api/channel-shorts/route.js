import { NextResponse } from "next/server";
import { getChannelShorts } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const channelId = request.nextUrl.searchParams.get("channelId") || "";
  if (!channelId) return NextResponse.json({ error: "missing channelId" }, { status: 400 });
  try {
    const data = await getChannelShorts(channelId);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
