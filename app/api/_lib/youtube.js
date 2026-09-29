// Server-side helper: talks to the YouTube Data API v3, or falls back to the
// built-in demo dataset when YOUTUBE_API_KEY is missing. The key never leaves
// the server — every function below runs inside API route handlers only.

import {
  DEMO_VIDEOS,
  DEMO_CHANNELS,
  DEMO_COMMENTS,
} from "./demo-data.js";

export const isDemo = () => !process.env.YOUTUBE_API_KEY;

const API_BASE = "https://www.googleapis.com/youtube/v3";

async function yt(path, params = {}) {
  const url = new URL(`${API_BASE}/${path}`);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`YouTube API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/** "PT4M13S" -> seconds */
export function isoToSec(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return 0;
  return (
    parseInt(m[1] || "0", 10) * 3600 +
    parseInt(m[2] || "0", 10) * 60 +
    parseInt(m[3] || "0", 10)
  );
}

const bestThumb = (t) =>
  t?.maxres?.url || t?.high?.url || t?.medium?.url || t?.default?.url || "";

// ---- normalizers: API shapes -> the shapes our UI consumes ----

function mapVideo(v, channelExtras = {}) {
  const id = typeof v.id === "string" ? v.id : v.id?.videoId;
  const extra = channelExtras[v.snippet?.channelId] || {};
  return {
    id,
    title: v.snippet?.title || "",
    channelId: v.snippet?.channelId || "",
    channelName: v.snippet?.channelTitle || "",
    channelAvatar: extra.avatar || "",
    thumbnail:
      bestThumb(v.snippet?.thumbnails) ||
      (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ""),
    durationSec: isoToSec(v.contentDetails?.duration),
    views: Number(v.statistics?.viewCount || 0),
    likes: Number(v.statistics?.likeCount || 0),
    commentCount: Number(v.statistics?.commentCount || 0),
    publishedAt: v.snippet?.publishedAt || "",
    description: v.snippet?.description || "",
  };
}

function mapChannel(c) {
  const s = c.snippet || {};
  return {
    id: c.id,
    name: s.title || "",
    handle: s.customUrl ? `@${s.customUrl.replace(/^@/, "")}` : "",
    avatar: bestThumb(s.thumbnails),
    banner: c.brandingSettings?.image?.bannerExternalUrl || "",
    subs: c.statistics?.subscriberCount ? Number(c.statistics.subscriberCount) : null,
    videoCount: c.statistics?.videoCount ? Number(c.statistics.videoCount) : null,
    description: s.description || "",
  };
}

// ---- demo shapes (same fields the UI expects) ----

function demoChannelById(id) {
  return DEMO_CHANNELS.find((c) => c.id === id);
}

function demoVideoShape(v) {
  const ch = demoChannelById(v.channelId) || {};
  return {
    id: v.id,
    title: v.title,
    channelId: v.channelId,
    channelName: ch.name || "",
    channelAvatar: "",
    channelColor: ch.color || "#666",
    thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    durationSec: v.durationSec,
    views: v.views,
    likes: v.likes,
    commentCount: DEMO_COMMENTS.length,
    publishedAt: v.publishedAt,
    description: v.description,
    demo: true,
  };
}

function demoChannelShape(c) {
  const videos = DEMO_VIDEOS.filter((v) => v.channelId === c.id);
  return {
    id: c.id,
    name: c.name,
    handle: c.handle,
    avatar: "",
    color: c.color,
    banner: "",
    subs: null, // never fabricate channel stats in demo mode
    videoCount: null,
    description: c.description,
    demo: true,
    _videoCount: videos.length,
  };
}

function tokenize(q) {
  return (q || "").toLowerCase().split(/\s+/).filter(Boolean);
}

// ---- public API used by route handlers ----

export async function getTrending() {
  if (isDemo()) {
    return { demo: true, items: DEMO_VIDEOS.map(demoVideoShape) };
  }
  const data = await yt("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    regionCode: "IN",
    maxResults: 24,
  });
  const channelIds = [...new Set((data.items || []).map((v) => v.snippet?.channelId).filter(Boolean))];
  const extras = await channelExtras(channelIds);
  return { demo: false, items: (data.items || []).map((v) => mapVideo(v, extras)) };
}

export async function searchMixed(q) {
  if (isDemo()) {
    const tokens = tokenize(q);
    const match = (text) => {
      const t = (text || "").toLowerCase();
      return tokens.length === 0 || tokens.every((tok) => t.includes(tok));
    };
    const channels = DEMO_CHANNELS.filter(
      (c) => match(c.name) || match(c.handle)
    ).map(demoChannelShape);
    const videos = DEMO_VIDEOS.filter(
      (v) =>
        match(v.title) ||
        match((demoChannelById(v.channelId) || {}).name)
    ).map(demoVideoShape);
    return { demo: true, query: q, channels, videos };
  }
  const data = await yt("search", {
    part: "snippet",
    q,
    type: "video,channel",
    maxResults: 25,
    regionCode: "IN",
  });
  const items = data.items || [];
  const videoItems = items.filter((i) => i.id?.kind === "youtube#video");
  const channelItems = items.filter((i) => i.id?.kind === "youtube#channel");

  // Enrich videos with durations + stats, channels with stats + avatars.
  const videoIds = videoItems.map((i) => i.id.videoId).filter(Boolean);
  let videoMap = {};
  if (videoIds.length) {
    const vd = await yt("videos", {
      part: "snippet,contentDetails,statistics",
      id: videoIds.join(","),
    });
    videoMap = Object.fromEntries((vd.items || []).map((v) => [v.id, v]));
  }
  const channelIds = [
    ...new Set([
      ...channelItems.map((i) => i.id.channelId),
      ...videoItems.map((i) => i.snippet?.channelId),
    ].filter(Boolean)),
  ];
  const extras = await channelExtras(channelIds);

  const videos = videoItems.map((i) =>
    mapVideo(videoMap[i.id.videoId] || { id: i.id.videoId, snippet: i.snippet }, extras)
  );
  const channels = channelItems.map((i) => {
    const full = extras[i.id.channelId]?.full;
    return full
      ? mapChannel(full)
      : { id: i.id.channelId, name: i.snippet?.title || "", handle: "", avatar: bestThumb(i.snippet?.thumbnails), banner: "", subs: null, videoCount: null, description: i.snippet?.description || "" };
  });
  return { demo: false, query: q, channels, videos };
}

export async function getVideo(id) {
  if (isDemo()) {
    const v = DEMO_VIDEOS.find((x) => x.id === id);
    if (!v) return { demo: true, video: null };
    const shaped = demoVideoShape(v);
    const ch = demoChannelShape(demoChannelById(v.channelId));
    return { demo: true, video: shaped, channel: ch };
  }
  const data = await yt("videos", {
    part: "snippet,contentDetails,statistics",
    id,
  });
  const v = (data.items || [])[0];
  if (!v) return { demo: false, video: null };
  const extras = await channelExtras([v.snippet.channelId]);
  const channel = extras[v.snippet.channelId]?.full
    ? mapChannel(extras[v.snippet.channelId].full)
    : null;
  return { demo: false, video: mapVideo(v, extras), channel };
}

export async function getComments(videoId) {
  if (isDemo()) {
    return { demo: true, items: DEMO_COMMENTS };
  }
  const data = await yt("commentThreads", {
    part: "snippet",
    videoId,
    maxResults: 20,
    order: "relevance",
    textFormat: "plainText",
  });
  const items = (data.items || []).map((c) => {
    const s = c.snippet?.topLevelComment?.snippet || {};
    return {
      id: c.id,
      author: s.authorDisplayName || "",
      authorAvatar: s.authorProfileImageUrl || "",
      text: s.textDisplay || "",
      likes: Number(s.likeCount || 0),
      publishedAt: s.publishedAt || "",
    };
  });
  return { demo: false, items };
}

export async function getRelated(videoId) {
  if (isDemo()) {
    const items = DEMO_VIDEOS.filter((v) => v.id !== videoId).map(demoVideoShape);
    return { demo: true, items };
  }
  try {
    const data = await yt("search", {
      part: "snippet",
      relatedToVideoId: videoId,
      type: "video",
      maxResults: 15,
      regionCode: "IN",
    });
    const ids = (data.items || []).map((i) => i.id?.videoId).filter(Boolean);
    if (!ids.length) throw new Error("empty");
    const vd = await yt("videos", { part: "snippet,contentDetails,statistics", id: ids.join(",") });
    const extras = await channelExtras([...new Set((vd.items || []).map((v) => v.snippet?.channelId).filter(Boolean))]);
    return { demo: false, items: (vd.items || []).map((v) => mapVideo(v, extras)) };
  } catch {
    // relatedToVideoId can be flaky/restricted; fall back to trending.
    const t = await getTrending();
    return { demo: false, items: t.items.filter((v) => v.id !== videoId) };
  }
}

export async function getChannel(idOrHandle) {
  const wantHandle = idOrHandle.startsWith("@");
  const handle = idOrHandle.replace(/^@/, "");
  if (isDemo()) {
    const c =
      DEMO_CHANNELS.find((x) => x.id === idOrHandle) ||
      DEMO_CHANNELS.find((x) => x.handle.toLowerCase() === `@${handle.toLowerCase()}`);
    if (!c) return { demo: true, channel: null };
    return { demo: true, channel: demoChannelShape(c) };
  }
  const params = { part: "snippet,statistics,brandingSettings" };
  if (wantHandle) params.forHandle = handle;
  else params.id = idOrHandle;
  const data = await yt("channels", params);
  const c = (data.items || [])[0];
  if (!c) return { demo: false, channel: null };
  return { demo: false, channel: mapChannel(c) };
}

export async function getChannelVideos(channelId) {
  if (isDemo()) {
    const items = DEMO_VIDEOS.filter((v) => v.channelId === channelId).map(demoVideoShape);
    return { demo: true, items };
  }
  const data = await yt("search", {
    part: "snippet",
    channelId,
    order: "date",
    type: "video",
    maxResults: 24,
  });
  const ids = (data.items || []).map((i) => i.id?.videoId).filter(Boolean);
  if (!ids.length) return { demo: false, items: [] };
  const vd = await yt("videos", { part: "snippet,contentDetails,statistics", id: ids.join(",") });
  const extras = await channelExtras([channelId]);
  return { demo: false, items: (vd.items || []).map((v) => mapVideo(v, extras)) };
}

// Bulk-fetch channel avatars (+ keep the full channel object for stats reuse).
async function channelExtras(channelIds) {
  const out = {};
  const ids = [...new Set(channelIds)].filter(Boolean);
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    try {
      const data = await yt("channels", { part: "snippet,statistics", id: chunk.join(",") });
      for (const c of data.items || []) {
        out[c.id] = { avatar: bestThumb(c.snippet?.thumbnails), full: c };
      }
    } catch {
      // Non-fatal: videos still render without avatars.
    }
  }
  return out;
}
