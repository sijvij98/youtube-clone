"use client";

import { useEffect, useState } from "react";
import {
  getPlaylists,
  createPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  isInPlaylist,
} from "../lib/store";
import { CheckIcon, CloseIcon } from "./icons";

// Save-to-playlist dialog. Local only — playlists live in this browser.
export default function SaveDialog({ video, open, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    const refresh = () => setPlaylists(getPlaylists());
    refresh();
    window.addEventListener("mytube-store-changed", refresh);
    return () => window.removeEventListener("mytube-store-changed", refresh);
  }, [open]);

  if (!open) return null;

  const handleToggle = (pl) => {
    if (!video) return;
    if (isInPlaylist(pl.id, video.id)) {
      removeFromPlaylist(pl.id, video.id);
    } else {
      addToPlaylist(pl.id, video);
    }
    setPlaylists(getPlaylists());
  };

  const handleCreate = () => {
    const pl = createPlaylist(name);
    if (video) addToPlaylist(pl.id, video);
    setName("");
    setPlaylists(getPlaylists());
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Save to playlist"
      >
        <div className="dialog-head">
          <h3>Save to playlist</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="dialog-list">
          {playlists.map((pl) => {
            const checked = video ? isInPlaylist(pl.id, video.id) : false;
            const count = (pl.items || []).length;
            return (
              <button
                key={pl.id}
                className={`dialog-row${checked ? " checked" : ""}`}
                onClick={() => handleToggle(pl)}
                aria-pressed={checked}
              >
                <span className="check">
                  <CheckIcon size={14} />
                </span>
                <span>{pl.name}</span>
                <span className="row-count">
                  {count} video{count === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}
          {playlists.length === 0 && (
            <div className="dialog-note">
              No playlists yet — create one below.
            </div>
          )}
        </div>

        <div className="dialog-new">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New playlist name"
            maxLength={80}
            aria-label="New playlist name"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <button className="btn" onClick={handleCreate}>
            Create
          </button>
        </div>

        <div className="dialog-foot">
          <button className="btn" onClick={onClose}>
            Done
          </button>
        </div>

        <div className="dialog-note">
          Playlists are saved on this device only.
        </div>
      </div>
    </div>
  );
}
