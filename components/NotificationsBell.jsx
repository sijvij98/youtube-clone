"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "./icons";
import { getSubs } from "../lib/store";
import { timeAgo } from "../lib/format";

// Bell showing the latest upload from each subscribed channel.
// Subscriptions are local-only; the dot appears whenever there are any.
export default function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subs, setSubs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  const fetchLatest = useCallback(async () => {
    const list = getSubs().slice(0, 10);
    setSubs(list);
    if (!list.length) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        list.map(async (sub) => {
          try {
            const r = await fetch(
              `/api/channel-videos?channelId=${encodeURIComponent(sub.id)}`
            );
            const d = await r.json();
            const first =
              Array.isArray(d.items) && d.items.length ? d.items[0] : null;
            return first ? { sub, video: first } : null;
          } catch {
            return null;
          }
        })
      );
      setItems(results.filter(Boolean));
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh when the panel opens, and whenever subscriptions change.
  useEffect(() => {
    if (open) fetchLatest();
  }, [open, fetchLatest]);

  useEffect(() => {
    const onChange = () => {
      setSubs(getSubs().slice(0, 10));
      if (open) fetchLatest();
    };
    setSubs(getSubs().slice(0, 10));
    window.addEventListener("mytube-store-changed", onChange);
    return () => window.removeEventListener("mytube-store-changed", onChange);
  }, [open, fetchLatest]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const openVideo = (videoId) => {
    setOpen(false);
    router.push(`/watch?v=${videoId}`);
  };

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <BellIcon />
        {subs.length > 0 && <span className="bell-dot" />}
      </button>
      {open && (
        <div className="notif-panel" role="menu" aria-label="Notifications">
          <div className="notif-head">Notifications</div>
          {loading && <div className="notif-empty">Loading latest uploads…</div>}
          {!loading && subs.length === 0 && (
            <div className="notif-empty">
              No subscriptions yet — subscribe to channels and their latest
              uploads will appear here.
            </div>
          )}
          {!loading &&
            subs.length > 0 &&
            items.length === 0 && (
              <div className="notif-empty">
                Couldn&apos;t load the latest uploads right now. Please try
                again in a moment.
              </div>
            )}
          {!loading &&
            items.map(({ sub, video }) => (
              <div
                key={video.id}
                className="notif-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => openVideo(video.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openVideo(video.id);
                }}
              >
                <span
                  className="avatar"
                  style={{ background: sub.color || "#555" }}
                >
                  {sub.avatar ? (
                    <img src={sub.avatar} alt="" />
                  ) : (
                    (sub.name || "?").charAt(0).toUpperCase()
                  )}
                </span>
                {video.thumbnail && (
                  <img
                    className="n-thumb"
                    src={video.thumbnail}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="n-body">
                  <div className="n-title">{video.title}</div>
                  <div className="n-sub">
                    {sub.name} • {timeAgo(video.publishedAt)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
