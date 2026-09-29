"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { formatCount } from "../lib/format";
import { isSubscribed, toggleSub } from "../lib/store";

// Channel result row (search results): avatar, name, stats, subscribe button.
export default function ChannelRow({ c }) {
  const router = useRouter();
  const [sub, setSub] = useState(false);

  useEffect(() => {
    setSub(isSubscribed(c.id));
  }, [c.id]);

  const onSubscribe = (e) => {
    e.stopPropagation();
    setSub(toggleSub(c));
  };

  return (
    <div className="channel-row" onClick={() => router.push(`/channel/${c.id}`)}>
      <Avatar name={c.name} src={c.avatar} color={c.color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3>
          {c.name}{" "}
          {c.demo && <span className="demo-pill">DEMO</span>}
        </h3>
        <div className="meta">
          {c.handle}
          {c.subs != null && <> • {formatCount(c.subs)} subscribers</>}
          {c.videoCount != null && <> • {formatCount(c.videoCount)} videos</>}
          {c.demo && <> • demo entry — stats hidden</>}
        </div>
        {c.description && (
          <div className="meta" style={{ marginTop: 6 }}>
            {c.description.slice(0, 140)}
            {c.description.length > 140 ? "…" : ""}
          </div>
        )}
      </div>
      <button
        className={sub ? "btn" : "btn btn-dark"}
        onClick={onSubscribe}
        aria-pressed={sub}
      >
        {sub ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  );
}
