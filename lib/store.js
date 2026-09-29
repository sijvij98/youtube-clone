// Client-side localStorage helpers for subscriptions + watch history.
// Everything here is local-only (no backend account).

const SUBS_KEY = "mytube-subs";
const HISTORY_KEY = "mytube-history";

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
