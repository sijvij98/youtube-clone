// Shared client-side formatting helpers.

/** 1234 -> "1.2K", 2500000 -> "2.5M" */
export function formatCount(n) {
  n = Number(n) || 0;
  if (n >= 1_000_000_000) return trim(n / 1_000_000_000) + "B";
  if (n >= 1_000_000) return trim(n / 1_000_000) + "M";
  if (n >= 1_000) return trim(n / 1_000) + "K";
  return String(n);
}

function trim(v) {
  // One decimal, but drop the ".0"
  return (Math.round(v * 10) / 10).toString();
}

export function formatViews(n) {
  return `${formatCount(n)} views`;
}

/** ISO date string -> "3 days ago", "2 months ago", ... */
export function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [s, name] of units) {
    const v = Math.floor(secs / s);
    if (v >= 1) return `${v} ${name}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/** YouTube ISO-8601 duration ("PT4M13S") -> "4:13" */
export function isoDurationToSec(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return 0;
  return (
    parseInt(m[1] || "0", 10) * 3600 +
    parseInt(m[2] || "0", 10) * 60 +
    parseInt(m[3] || "0", 10)
  );
}

/** seconds -> "4:13" or "1:02:03" */
export function formatDuration(totalSec) {
  totalSec = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? h + ":" : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function tsToSec(h, m, s) {
  return (
    parseInt(h || "0", 10) * 3600 + parseInt(m || "0", 10) * 60 + parseInt(s || "0", 10)
  );
}

/**
 * Parse YouTube-style chapters from a description.
 * Matches lines like "0:00 Intro" or "1:02:03 Deep dive".
 * Returns [{label:"0:00", sec:0, title:"Intro"}] or [] when there are
 * fewer than 3 timestamped lines (avoids false positives).
 */
export function parseChapters(desc) {
  if (!desc) return [];
  const chapters = [];
  for (const line of desc.split("\n")) {
    const m = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s+(.{2,80}?)\s*$/.exec(line);
    if (!m) continue;
    const sec = tsToSec(m[1], m[2], m[3]);
    const title = m[4].trim();
    // skip duplicates of the same timestamp
    if (chapters.length && chapters[chapters.length - 1].sec === sec) continue;
    chapters.push({ label: `${m[1] ? m[1] + ":" : ""}${m[2]}:${m[3]}`, sec, title });
  }
  if (chapters.length < 3) return [];
  chapters.sort((a, b) => a.sec - b.sec);
  return chapters;
}
