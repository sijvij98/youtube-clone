"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlaylistIcon,
  PlusIcon,
  PencilIcon,
  CheckIcon,
  TrashIcon,
} from "./icons";
import {
  getPlaylists,
  createPlaylist,
  renamePlaylist,
  deletePlaylist,
} from "../lib/store";

export default function PlaylistsClient() {
  const [playlists, setPlaylists] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setPlaylists(getPlaylists());
    const refresh = () => setPlaylists(getPlaylists());
    window.addEventListener("mytube-store-changed", refresh);
    return () => window.removeEventListener("mytube-store-changed", refresh);
  }, []);

  const create = () => {
    if (!name.trim()) return;
    createPlaylist(name);
    setName("");
    setShowNew(false);
  };

  const startRename = (p) => {
    setRenaming(p.id);
    setDraft(p.name);
  };

  const confirmRename = (id) => {
    if (draft.trim()) renamePlaylist(id, draft);
    setRenaming(null);
    setDraft("");
  };

  const remove = (p) => {
    if (window.confirm(`Delete playlist "${p.name}"? This can't be undone.`)) {
      deletePlaylist(p.id);
    }
  };

  return (
    <div className="page">
      <h1>Playlists</h1>
      <div className="local-note" style={{ padding: "0 0 4px" }}>
        Saved on this device — only you can see these.
      </div>

      <div style={{ margin: "10px 0 20px" }}>
        {!showNew ? (
          <button className="btn" onClick={() => setShowNew(true)}>
            <PlusIcon size={16} /> New playlist
          </button>
        ) : (
          <div className="dialog-new" style={{ padding: 0 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") create();
                if (e.key === "Escape") {
                  setShowNew(false);
                  setName("");
                }
              }}
              placeholder="Playlist name"
              maxLength={120}
              autoFocus
            />
            <button className="btn btn-dark" onClick={create}>
              Create
            </button>
            <button
              className="btn"
              onClick={() => {
                setShowNew(false);
                setName("");
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {!playlists && <div className="empty">Loading…</div>}

      {playlists && playlists.length === 0 && (
        <div className="empty">
          <span className="big">
            <PlaylistIcon size={44} />
          </span>
          No playlists yet — create one, or save videos from any watch page.
        </div>
      )}

      {playlists && playlists.length > 0 && (
        <div className="pl-grid" style={{ padding: "0 0 48px" }}>
          {playlists.map((p) => (
            <div className="pl-card" key={p.id}>
              <Link href={`/playlists/${encodeURIComponent(p.id)}`}>
                <div className="pl-thumb">
                  {p.items[0]?.thumbnail ? (
                    <img src={p.items[0].thumbnail} alt="" loading="lazy" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(135deg, #3a3a3a, #1a1a1a)",
                      }}
                    />
                  )}
                  <div className="pl-stack">
                    <PlaylistIcon size={26} />
                    <span>{p.items.length}</span>
                    <span>videos</span>
                  </div>
                </div>
              </Link>
              {renaming === p.id ? (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename(p.id);
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    maxLength={120}
                    autoFocus
                    aria-label="Playlist name"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: 38,
                      padding: "0 12px",
                      background: "#121212",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text)",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                  <button
                    className="icon-act"
                    title="Save name"
                    aria-label="Save name"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmRename(p.id);
                    }}
                  >
                    <CheckIcon size={18} />
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <Link
                    href={`/playlists/${encodeURIComponent(p.id)}`}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <h3>{p.name}</h3>
                    <div className="meta">
                      {p.items.length} video
                      {p.items.length === 1 ? "" : "s"}
                    </div>
                  </Link>
                  <div className="pl-row-actions">
                    <button
                      className="icon-act"
                      title="Rename playlist"
                      aria-label={`Rename ${p.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(p);
                      }}
                    >
                      <PencilIcon size={17} />
                    </button>
                    <button
                      className="icon-act"
                      title="Delete playlist"
                      aria-label={`Delete ${p.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(p);
                      }}
                    >
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
