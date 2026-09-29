"use client";

import { useEffect, useState } from "react";
import VideoRow from "./VideoRow";
import { getHistory, clearHistory } from "../lib/store";

export default function HistoryClient() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    setItems(getHistory());
    const refresh = () => setItems(getHistory());
    window.addEventListener("mytube-store-changed", refresh);
    return () => window.removeEventListener("mytube-store-changed", refresh);
  }, []);

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h1 style={{ marginRight: "auto" }}>Watch history</h1>
        {items && items.length > 0 && (
          <button className="btn" onClick={() => { clearHistory(); setItems([]); }}>
            Clear all
          </button>
        )}
      </div>
      {!items && <div className="empty">Loading…</div>}
      {items && items.length === 0 && (
        <div className="empty">
          Nothing here yet — videos you watch will show up in this list.
        </div>
      )}
      {(items || []).map((v) => (
        <VideoRow key={v.id + v.watchedAt} v={v} />
      ))}
    </div>
  );
}
