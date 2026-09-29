import { NextResponse } from "next/server";
import { getRelated } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const videoId = request.nextUrl.searchParams.get("videoId") || "";
  if (!videoId) return NextResponse.json({ error: "missing videoId" }, { status: 400 });
  try {
    const data = await getRelated(videoId);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
