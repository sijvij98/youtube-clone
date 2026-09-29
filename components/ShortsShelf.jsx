"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShortsIcon } from "./icons";
import { formatViews } from "../lib/format";

// Shorts shelf shown on the home feed (after the first 8 videos).
export default function ShortsShelf() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    fetch("/api/shorts")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`request failed (${r.status})`))))
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setItems(d.items || []);
      })
      .catch(() => setItems([])); // hide the shelf on error
  }, []);

  if (!items) {
    // skeleton strip while loading
    return (
      <section className="shorts-shelf" aria-busy="true">
        <div className="shorts-shelf-head">
          <ShortsIcon size={22} />
          Shorts
        </div>
        <div className="shorts-strip">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="short-card">
              <div className="skel short-thumb" style={{ borderRadius: 16 }} />
              <div className="skel skel-line" style={{ width: "85%", margin: "8px 2px 0" }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="shorts-shelf">
      <div className="shorts-shelf-head">
        <ShortsIcon size={22} />
        Shorts
      </div>
      <div className="shorts-strip">
        {items.map((v) => (
          <Link key={v.id} href={`/shorts?start=${v.id}`} className="short-card">
            <div className="short-thumb">
              <img src={v.thumbnail} alt="" loading="lazy" />
              {v.demo && <span className="demo-tag">DEMO</span>}
            </div>
            <h4>{v.title}</h4>
            <div className="meta">{formatViews(v.views)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
