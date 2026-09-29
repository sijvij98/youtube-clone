import { NextResponse } from "next/server";
import { searchMixed } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q") || "";
  try {
    const data = await searchMixed(q);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
