import { NextResponse } from "next/server";
import { isDemo } from "../_lib/youtube.js";

export const dynamic = "force-dynamic";

// Lets the client know whether to show the demo-mode banner/pill.
export async function GET() {
  return NextResponse.json({ demo: isDemo() });
}
