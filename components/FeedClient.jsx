"use client";

import { useEffect, useState } from "react";
import VideoRow from "./VideoRow";
import ChannelRow from "./ChannelRow";
import { RowSkeleton } from "./Skeletons";
import {
  TrendingIcon,
  MusicIcon,
  GamingIcon,
  NewsIcon,
  SportsIcon,
} from "./icons";

const FEEDS = {
  trending: {
    title: "Trending",
    Icon: TrendingIcon,
    sub: "Today's most-watched videos",
  },
  music: { title: "Music", Icon: MusicIcon, q: "music" },
  gaming: { title: "Gaming", Icon: GamingIcon, q: "gaming" },
  news: { title: "News", Icon: NewsIcon, q: "news" },
  sports: { title: "Sports", Icon: SportsIcon, q: "sports" },
};

export default function FeedClient({ slug }) {
  const config = FEEDS[slug];
  const [videos, setVideos] = useState(null);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!config) return;
    setVideos(null);
    setChannels([]);
    setError("");
    const url = slug === "trending" ? "/api/trending" : `/api/search?q=${encodeURIComponent(config.q)}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setVideos(d.items || d.videos || []);
        setChannels(d.channels || []);
      })
      .catch((e) => setError(e.message));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!config) {
    return (
      <div className="error-box">
        <h3>Unknown feed</h3>
        <p>There is no feed for &ldquo;{slug}&rdquo;.</p>
      </div>
    );
  }

  const { title, Icon, sub } = config;

  return (
    <>
      <div className="feed-head">
        <span className="feed-icon">
          <Icon size={28} />
        </span>
        <div>
          <h1>{title}</h1>
          {sub && <div className="sub">{sub}</div>}
        </div>
      </div>

      {error && (
        <div className="error-box">
          <h3>Couldn&apos;t load {title}</h3>
          <p>{error}</p>
          <button className="btn btn-dark" onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!error && !videos && (
        <div className="results">
          {Array.from({ length: 8 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      )}

      {!error && videos && slug === "trending" && (
        <div className="results">
          {videos.map((v, i) => (
            <div key={v.id} className="rank-row">
              <div className="rank-num">{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <VideoRow v={v} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!error && videos && slug !== "trending" && (
        <div className="results">
          {channels.map((c) => (
            <ChannelRow key={c.id} c={c} />
          ))}
          {channels.length > 0 && <hr className="results-divider" />}
          {videos.map((v) => (
            <VideoRow key={v.id} v={v} />
          ))}
        </div>
      )}
    </>
  );
}
