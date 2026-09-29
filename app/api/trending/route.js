import { NextResponse } from "next/server";
import { getTrending } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTrending();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
