"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { getSubs, toggleSub } from "../lib/store";

export default function SubsClient() {
  const [subs, setSubs] = useState(null);

  useEffect(() => {
    setSubs(getSubs());
    const refresh = () => setSubs(getSubs());
    window.addEventListener("mytube-store-changed", refresh);
    return () => window.removeEventListener("mytube-store-changed", refresh);
  }, []);

  return (
    <div className="page">
      <h1>Subscriptions</h1>
      {!subs && <div className="empty">Loading…</div>}
      {subs && subs.length === 0 && (
        <div className="empty">
          You haven&apos;t subscribed to any channels yet. Hit Subscribe on a
          video or channel page.
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {(subs || []).map((c) => (
          <div
            key={c.id}
            style={{
              background: "#1c1c1c",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
            }}
          >
            <Link href={`/channel/${c.id}`}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <span style={{ width: 72, height: 72, fontSize: 28, display: "inline-flex" }}>
                  <Avatar name={c.name} src={c.avatar} color={c.color} />
                </span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
              <div style={{ color: "#aaa", fontSize: 13, marginBottom: 12 }}>{c.handle}</div>
            </Link>
            <button
              className="btn"
              onClick={() => { toggleSub(c); setSubs(getSubs()); }}
            >
              Subscribed
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
