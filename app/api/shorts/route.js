import { NextResponse } from "next/server";
import { getShorts } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getShorts();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
