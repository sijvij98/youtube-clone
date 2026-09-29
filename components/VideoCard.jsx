"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import HoverPreview from "./HoverPreview";
import { formatViews, timeAgo, formatDuration } from "../lib/format";

// Grid thumbnail card (home feed, channel videos tab).
export default function VideoCard({ v }) {
  return (
    <div className="card">
      <Link href={`/watch?v=${v.id}`}>
        <div className="thumb-wrap">
          <HoverPreview
            videoId={v.id}
            thumbnail={v.thumbnail}
            demo={v.demo}
            durationLabel={
              v.durationSec > 0 && (
                <span className="duration">{formatDuration(v.durationSec)}</span>
              )
            }
          />
        </div>
      </Link>
      <div className="card-meta">
        <Link href={`/channel/${v.channelId}`} aria-label={v.channelName}>
          <Avatar name={v.channelName} src={v.channelAvatar} color={v.channelColor} />
        </Link>
        <div style={{ minWidth: 0 }}>
          <Link href={`/watch?v=${v.id}`}>
            <h3 className="card-title">{v.title}</h3>
          </Link>
          <div className="card-sub">
            <Link href={`/channel/${v.channelId}`}>{v.channelName}</Link>
            <br />
            {formatViews(v.views)} • {timeAgo(v.publishedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
