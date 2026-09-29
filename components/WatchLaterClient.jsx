"use client";

import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import { getWatchLater } from "../lib/store";
import { WatchLaterIcon } from "./icons";

// Local-only "Watch Later" list — stored in this browser only.
export default function WatchLaterClient() {
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    const load = () => setVideos(getWatchLater());
    load();
    window.addEventListener("mytube-store-changed", load);
    return () => window.removeEventListener("mytube-store-changed", load);
  }, []);

  return (
    <div className="page">
      <h1>Watch Later</h1>
      <div className="sub">Videos you saved to watch later on this device.</div>
      <div className="local-note">Saved on this device — only you can see this.</div>

      {videos && videos.length === 0 && (
        <div className="empty">
          <span className="big">
            <WatchLaterIcon size={44} />
          </span>
          Nothing saved yet.
          <br />
          Use the Save option on any video to add it here.
        </div>
      )}

      {videos && videos.length > 0 && (
        <div className="grid">
          {videos.map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
        </div>
      )}
    </div>
  );
}
