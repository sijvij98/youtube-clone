"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  HomeIcon,
  ShortsIcon,
  SubsIcon,
  HistoryIcon,
  PlaylistIcon,
  WatchLaterIcon,
  LikeIcon,
  TrendingIcon,
  MusicIcon,
  GamingIcon,
  NewsIcon,
  SportsIcon,
} from "./icons";
import { getSubs } from "../lib/store";

const MAIN = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/shorts", label: "Shorts", Icon: ShortsIcon },
  { href: "/subscriptions", label: "Subscriptions", Icon: SubsIcon },
];

const YOU = [
  { href: "/history", label: "History", Icon: HistoryIcon },
  { href: "/playlists", label: "Playlists", Icon: PlaylistIcon },
  { href: "/feed/watchlater", label: "Watch Later", Icon: WatchLaterIcon },
  { href: "/feed/liked", label: "Liked videos", Icon: LikeIcon },
];

const EXPLORE = [
  { href: "/feed/trending", label: "Trending", Icon: TrendingIcon },
  { href: "/feed/music", label: "Music", Icon: MusicIcon },
  { href: "/feed/gaming", label: "Gaming", Icon: GamingIcon },
  { href: "/feed/news", label: "News", Icon: NewsIcon },
  { href: "/feed/sports", label: "Sports", Icon: SportsIcon },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href === "/playlists") return pathname.startsWith("/playlists");
  if (href.startsWith("/feed")) return pathname.startsWith(href);
  return pathname === href;
}

function NavItem({ href, label, icon, active, onNavigate }) {
  return (
    <Link
      href={href}
      className={`nav-item${active ? " active" : ""}`}
      onClick={onNavigate}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </Link>
  );
}

function Section({ items, pathname, onNavigate }) {
  return items.map((it) => (
    <NavItem
      key={it.href}
      href={it.href}
      label={it.label}
      icon={<it.Icon size={22} />}
      active={isActive(pathname, it.href)}
      onNavigate={onNavigate}
    />
  ));
}

export default function Sidebar({ mini, open, onNavigate }) {
  const pathname = usePathname();
  const [subs, setSubs] = useState([]);

  const load = useCallback(() => setSubs(getSubs().slice(0, 12)), []);

  useEffect(() => {
    load();
    window.addEventListener("mytube-store-changed", load);
    return () => window.removeEventListener("mytube-store-changed", load);
  }, [load]);

  return (
    <aside className={`sidebar${mini ? " mini" : ""}${open ? " open" : ""}`}>
      <nav>
        <Section items={MAIN} pathname={pathname} onNavigate={onNavigate} />
        <hr className="nav-divider" />
        <div className="nav-sec-title">You</div>
        <Section items={YOU} pathname={pathname} onNavigate={onNavigate} />
        <hr className="nav-divider" />
        <div className="nav-sec-title">Explore</div>
        <Section items={EXPLORE} pathname={pathname} onNavigate={onNavigate} />
        {subs.length > 0 && (
          <>
            <hr className="nav-divider" />
            <div className="nav-sec-title">Subscriptions</div>
            {subs.map((s) => (
              <Link
                key={s.id}
                href={`/channel/${s.id}`}
                className={`nav-item${
                  pathname === `/channel/${s.id}` ? " active" : ""
                }`}
                onClick={onNavigate}
              >
                <span
                  className="sub-avatar"
                  style={{ background: s.color || "#555" }}
                >
                  {s.avatar ? (
                    <img src={s.avatar} alt="" />
                  ) : (
                    (s.name || "?").charAt(0).toUpperCase()
                  )}
                </span>
                <span className="nav-label">{s.name}</span>
              </Link>
            ))}
          </>
        )}
        <hr className="nav-divider" />
        <div className="nav-section">
          MyTube is a demo front-end for the YouTube Data API v3. Subscriptions
          and history are stored only in this browser.
        </div>
      </nav>
    </aside>
  );
}
