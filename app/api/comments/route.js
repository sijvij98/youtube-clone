import { NextResponse } from "next/server";
import { getComments } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const videoId = request.nextUrl.searchParams.get("videoId") || "";
  if (!videoId) return NextResponse.json({ error: "missing videoId" }, { status: 400 });
  const order = request.nextUrl.searchParams.get("order") === "time" ? "time" : "relevance";
  try {
    const data = await getComments(videoId, order);
    return NextResponse.json(data);
  } catch (e) {
    // Comments are often disabled; degrade gracefully instead of failing the page.
    return NextResponse.json({ demo: false, items: [], disabled: true });
  }
}
