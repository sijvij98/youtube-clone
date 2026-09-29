import { NextResponse } from "next/server";
import { getReplies } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const parentId = request.nextUrl.searchParams.get("parentId") || "";
  if (!parentId) return NextResponse.json({ error: "missing parentId" }, { status: 400 });
  try {
    const data = await getReplies(parentId);
    return NextResponse.json(data);
  } catch (e) {
    // Replies are optional; degrade gracefully instead of failing the page.
    return NextResponse.json({ demo: false, items: [] });
  }
}
