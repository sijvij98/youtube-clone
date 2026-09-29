// Client-side localStorage helpers for subscriptions + watch history +
// playlists + liked videos + watch later.
// Everything here is local-only (no backend account) — the UI labels these
// "saved on this device".

const SUBS_KEY = "mytube-subs";
const HISTORY_KEY = "mytube-history";
const PLAYLISTS_KEY = "mytube-playlists";
const LIKED_KEY = "mytube-liked";
const WATCHLATER_KEY = "mytube-watchlater";

function read(key) {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — non-fatal
  }
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mytube-store-changed"));
  }
}

// ---- subscriptions ----
export function getSubs() {
  return read(SUBS_KEY);
}

export function isSubscribed(channelId) {
  return read(SUBS_KEY).some((s) => s.id === channelId);
}

/** Toggles; returns the new subscribed state (true = now subscribed). */
export function toggleSub(channel) {
  const subs = read(SUBS_KEY);
  const i = subs.findIndex((s) => s.id === channel.id);
  let now;
  if (i >= 0) {
    subs.splice(i, 1);
    now = false;
  } else {
    subs.unshift({
      id: channel.id,
      name: channel.name,
      handle: channel.handle || "",
      color: channel.color || "#555",
      avatar: channel.avatar || "",
    });
    now = true;
  }
  write(SUBS_KEY, subs);
  notify();
  return now;
}

// ---- watch history ----
export function getHistory() {
  return read(HISTORY_KEY);
}

export function addToHistory(video) {
  const h = read(HISTORY_KEY).filter((x) => x.id !== video.id);
  h.unshift({ ...video, watchedAt: new Date().toISOString() });
  write(HISTORY_KEY, h.slice(0, 50)); // cap at 50 entries
}

export function clearHistory() {
  write(HISTORY_KEY, []);
  notify();
}

// ---- playlists (local only) ----
function uid() {
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getPlaylists() {
  return read(PLAYLISTS_KEY);
}

export function getPlaylist(id) {
  return read(PLAYLISTS_KEY).find((p) => p.id === id) || null;
}

/** Creates a playlist; returns the new playlist object. */
export function createPlaylist(name) {
  const playlists = read(PLAYLISTS_KEY);
  const pl = {
    id: uid(),
    name: (name || "Untitled playlist").trim() || "Untitled playlist",
    createdAt: new Date().toISOString(),
    items: [],
  };
  playlists.unshift(pl);
  write(PLAYLISTS_KEY, playlists);
  notify();
  return pl;
}

export function renamePlaylist(id, name) {
  const playlists = read(PLAYLISTS_KEY);
  const pl = playlists.find((p) => p.id === id);
  if (pl && (name || "").trim()) {
    pl.name = name.trim();
    write(PLAYLISTS_KEY, playlists);
    notify();
  }
}

export function deletePlaylist(id) {
  write(PLAYLISTS_KEY, read(PLAYLISTS_KEY).filter((p) => p.id !== id));
  notify();
}

function slimVideo(video) {
  return {
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail,
    channelId: video.channelId,
    channelName: video.channelName,
    durationSec: video.durationSec || 0,
    views: video.views || 0,
    publishedAt: video.publishedAt || "",
  };
}

/** Adds a video to a playlist; returns true if added, false if already there. */
export function addToPlaylist(playlistId, video) {
  const playlists = read(PLAYLISTS_KEY);
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return false;
  if (pl.items.some((i) => i.id === video.id)) return false;
  pl.items.push(slimVideo(video));
  write(PLAYLISTS_KEY, playlists);
  notify();
  return true;
}

export function removeFromPlaylist(playlistId, videoId) {
  const playlists = read(PLAYLISTS_KEY);
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return;
  pl.items = pl.items.filter((i) => i.id !== videoId);
  write(PLAYLISTS_KEY, playlists);
  notify();
}

export function isInPlaylist(playlistId, videoId) {
  const pl = read(PLAYLISTS_KEY).find((p) => p.id === playlistId);
  return !!pl && pl.items.some((i) => i.id === videoId);
}

// ---- liked videos (local only) ----
export function getLiked() {
  return read(LIKED_KEY);
}

export function isLiked(videoId) {
  return read(LIKED_KEY).some((v) => v.id === videoId);
}

/** Toggles; returns the new liked state. */
export function toggleLike(video) {
  const liked = read(LIKED_KEY);
  const i = liked.findIndex((v) => v.id === video.id);
  let now;
  if (i >= 0) {
    liked.splice(i, 1);
    now = false;
  } else {
    liked.unshift({ ...slimVideo(video), likedAt: new Date().toISOString() });
    now = true;
  }
  write(LIKED_KEY, liked);
  notify();
  return now;
}

// ---- watch later (local only) ----
export function getWatchLater() {
  return read(WATCHLATER_KEY);
}

export function isWatchLater(videoId) {
  return read(WATCHLATER_KEY).some((v) => v.id === videoId);
}

/** Toggles; returns the new watch-later state. */
export function toggleWatchLater(video) {
  const wl = read(WATCHLATER_KEY);
  const i = wl.findIndex((v) => v.id === video.id);
  let now;
  if (i >= 0) {
    wl.splice(i, 1);
    now = false;
  } else {
    wl.unshift({ ...slimVideo(video), savedAt: new Date().toISOString() });
    now = true;
  }
  write(WATCHLATER_KEY, wl);
  notify();
  return now;
}
