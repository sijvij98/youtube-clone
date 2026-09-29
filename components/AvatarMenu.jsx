"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HistoryIcon, PlaylistIcon, WatchLaterIcon, LikeIcon } from "./icons";

// Local "account" menu — everything here is stored on this device only.
const ITEMS = [
  { href: "/history", label: "History", Icon: HistoryIcon },
  { href: "/playlists", label: "Playlists", Icon: PlaylistIcon },
  { href: "/feed/watchlater", label: "Watch Later", Icon: WatchLaterIcon },
  { href: "/feed/liked", label: "Liked videos", Icon: LikeIcon },
];

export default function AvatarMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

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

  return (
    <div className="avatar-wrap" ref={wrapRef}>
      <button
        className="avatar-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        M
      </button>
      {open && (
        <div className="avatar-menu" role="menu" aria-label="Account">
          {ITEMS.map(({ href, label, Icon }) => (
            <button
              key={href}
              type="button"
              className="menu-item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push(href);
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
          <div className="menu-note">
            Signed in locally — subscriptions, playlists, watch later and
            history are saved on this device only.
          </div>
        </div>
      )}
    </div>
  );
}
