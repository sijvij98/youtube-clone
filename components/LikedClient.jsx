"use client";

import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import { getLiked } from "../lib/store";
import { LikeIcon } from "./icons";

// Local-only "Liked videos" list — stored in this browser only.
export default function LikedClient() {
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    const load = () => setVideos(getLiked());
    load();
    window.addEventListener("mytube-store-changed", load);
    return () => window.removeEventListener("mytube-store-changed", load);
  }, []);

  return (
    <div className="page">
      <h1>Liked videos</h1>
      <div className="sub">Videos you marked as liked on this device.</div>
      <div className="local-note">Saved on this device — only you can see this.</div>

      {videos && videos.length === 0 && (
        <div className="empty">
          <span className="big">
            <LikeIcon size={44} />
          </span>
          No liked videos yet.
          <br />
          Tap the like button on any video to add it here.
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
