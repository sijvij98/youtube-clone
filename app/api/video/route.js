import { NextResponse } from "next/server";
import { getVideo } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  try {
    const data = await getVideo(id);
    if (!data.video) return NextResponse.json({ error: "video not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
