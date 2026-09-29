import { NextResponse } from "next/server";

// Search autocomplete proxy. No YouTube API key needed — this just proxies
// Google's suggestion endpoint. The response looks like:
//   window.google.ac.h(["q",[["suggestion",0],["other",0]],...])
// so we slice from the first "(" to the last ")" and JSON.parse the payload.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ suggestions: [] });
  try {
    const url =
      "https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=" +
      encodeURIComponent(q);
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ suggestions: [] });
    const text = await res.text();
    const start = text.indexOf("(");
    const end = text.lastIndexOf(")");
    if (start === -1 || end === -1 || end <= start) {
      return NextResponse.json({ suggestions: [] });
    }
    const payload = JSON.parse(text.slice(start + 1, end));
    const pairs = Array.isArray(payload) && Array.isArray(payload[1]) ? payload[1] : [];
    const suggestions = pairs
      .map((p) => (Array.isArray(p) ? p[0] : ""))
      .filter((s) => typeof s === "string" && s.length > 0);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
