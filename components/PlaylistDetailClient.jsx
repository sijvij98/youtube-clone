"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoRow from "./VideoRow";
import { PlayIcon, TrashIcon } from "./icons";
import { getPlaylist, deletePlaylist, removeFromPlaylist } from "../lib/store";
import { timeAgo } from "../lib/format";

export default function PlaylistDetailClient({ id }) {
  const router = useRouter();
  const [pl, setPl] = useState(() => getPlaylist(id));

  useEffect(() => {
    setPl(getPlaylist(id));
    const refresh = () => setPl(getPlaylist(id));
    window.addEventListener("mytube-store-changed", refresh);
    return () => window.removeEventListener("mytube-store-changed", refresh);
  }, [id]);

  if (!pl) {
    return (
      <div className="error-box">
        <h3>Playlist not found</h3>
        <p>This playlist may have been deleted.</p>
        <Link className="btn btn-dark" href="/playlists">
          Back to playlists
        </Link>
      </div>
    );
  }

  const onDelete = () => {
    if (window.confirm(`Delete playlist "${pl.name}"? This can't be undone.`)) {
      deletePlaylist(id);
      router.push("/playlists");
    }
  };

  const first = pl.items[0];

  return (
    <div>
      <div className="pl-detail-head">
        <div
          className="pl-thumb"
          style={
            first?.thumbnail
              ? undefined
              : {
                  background: "linear-gradient(135deg, #3a3a3a, #1a1a1a)",
                }
          }
        >
          {first?.thumbnail && (
            <img src={first.thumbnail} alt="" loading="lazy" />
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1>{pl.name}</h1>
          <div className="meta">
            {pl.items.length} video{pl.items.length === 1 ? "" : "s"}
            {pl.createdAt && <> • created {timeAgo(pl.createdAt)}</>} • saved
            on this device
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {first && (
              <Link className="btn btn-dark" href={`/watch?v=${first.id}`}>
                <PlayIcon size={18} /> Play
              </Link>
            )}
            <button className="btn" onClick={onDelete}>
              <TrashIcon size={16} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="results">
        {pl.items.map((v) => (
          <div
            key={v.id}
            style={{ display: "flex", alignItems: "flex-start", gap: 4 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <VideoRow v={v} />
            </div>
            <button
              className="icon-act"
              title="Remove from playlist"
              aria-label={`Remove ${v.title} from playlist`}
              onClick={() => removeFromPlaylist(id, v.id)}
              style={{ marginTop: 6, flex: "none" }}
            >
              <TrashIcon size={18} />
            </button>
          </div>
        ))}
        {pl.items.length === 0 && (
          <div className="empty">No videos in this playlist yet.</div>
        )}
      </div>
    </div>
  );
}
