"use client";

import Link from "next/link";
import { formatViews, timeAgo, formatDuration } from "../lib/format";

// Wide list row used on search results, history, and the related sidebar.
export default function VideoRow({ v, compact }) {
  const rowClass = compact ? "side-row" : "video-row";
  return (
    <Link href={`/watch?v=${v.id}`} className={rowClass}>
      <div className="thumb-wrap">
        <img src={v.thumbnail} alt="" loading="lazy" />
        {v.demo && <span className="demo-tag">DEMO</span>}
        {!compact && v.durationSec > 0 && (
          <span className="duration">{formatDuration(v.durationSec)}</span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        {compact ? <h4>{v.title}</h4> : <h3>{v.title}</h3>}
        <div className={compact ? "meta" : "meta"}>
          {formatViews(v.views)} • {timeAgo(v.publishedAt)}
          <br />
          {v.channelName}
        </div>
        {!compact && v.description && (
          <div className="desc">{v.description}</div>
        )}
      </div>
    </Link>
  );
}
