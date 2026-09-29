"use client";

import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import ChannelRow from "./ChannelRow";
import ShortsShelf from "./ShortsShelf";
import { GridSkeleton, RowSkeleton } from "./Skeletons";

const CHIPS = [
  "All", "Music", "Gaming", "News", "Live", "Podcasts",
  "Coding", "Travel", "Comedy", "Sports", "Movies", "Fashion",
];

export default function HomeClient() {
  const [active, setActive] = useState("All");
  // "All" mode: trending videos
  const [videos, setVideos] = useState(null);
  // chip mode: inline search results
  const [channels, setChannels] = useState(null);
  const [chipVideos, setChipVideos] = useState(null);
  const [error, setError] = useState("");

  const loadTrending = () => {
    setVideos(null);
    setChannels(null);
    setChipVideos(null);
    setError("");
    fetch("/api/trending")
      .then((r) => {
        if (!r.ok) throw new Error(`request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setVideos(d.items || []);
      })
      .catch((e) => setError(e.message));
  };

  const loadChip = (chip) => {
    setChannels(null);
    setChipVideos(null);
    setError("");
    fetch(`/api/search?q=${encodeURIComponent(chip)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setChannels(d.channels || []);
        setChipVideos(d.videos || []);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    loadTrending();
  }, []);

  const pick = (chip) => {
    setActive(chip);
    window.scrollTo({ top: 0 });
    if (chip === "All") {
      loadTrending();
    } else {
      loadChip(chip);
    }
  };

  const loading = active === "All" ? !videos : !chipVideos;

  return (
    <>
      <div className="chips" role="tablist" aria-label="Categories">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            className={`chip${active === chip ? " active" : ""}`}
            onClick={() => pick(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-box">
          <h3>Couldn&apos;t load videos</h3>
          <p>{error}</p>
          <button className="btn btn-dark" onClick={() => pick(active)}>
            Retry
          </button>
        </div>
      )}

      {!error && loading && active === "All" && <GridSkeleton />}
      {!error && loading && active !== "All" && (
        <div className="results">
          {Array.from({ length: 8 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      )}

      {!error && !loading && active === "All" && (
        <>
          <div className="grid">
            {videos.slice(0, 8).map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
          <ShortsShelf />
          <div className="grid">
            {videos.slice(8).map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
        </>
      )}

      {!error && !loading && active !== "All" && (
        <>
          {channels.length > 0 && (
            <div className="results" style={{ paddingBottom: 0 }}>
              {channels.map((c) => (
                <ChannelRow key={c.id} c={c} />
              ))}
            </div>
          )}
          {channels.length > 0 && <hr className="results-divider" style={{ maxWidth: 1150, marginLeft: "auto", marginRight: "auto" }} />}
          <div className="grid">
            {chipVideos.map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
          {chipVideos.length === 0 && channels.length === 0 && (
            <div className="empty">
              <span className="big">🔍</span>
              No results for &ldquo;{active}&rdquo;.
            </div>
          )}
        </>
      )}
    </>
  );
}
