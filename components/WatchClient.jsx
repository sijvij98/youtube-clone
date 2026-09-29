"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Avatar from "./Avatar";
import VideoRow from "./VideoRow";
import { WatchSkeleton } from "./Skeletons";
import { formatViews, formatCount, formatDate, timeAgo } from "../lib/format";
import { isSubscribed, toggleSub, addToHistory } from "../lib/store";

export default function WatchClient() {
  const params = useSearchParams();
  const videoId = params.get("v") || "";

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [comments, setComments] = useState(null);
  const [related, setRelated] = useState(null);
  const [error, setError] = useState("");

  const [vote, setVote] = useState(null); // 'like' | 'dislike' | null
  const [subscribed, setSubscribed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    setVideo(null);
    setChannel(null);
    setComments(null);
    setRelated(null);
    setError("");
    setVote(null);
    setExpanded(false);

    fetch(`/api/video?id=${encodeURIComponent(videoId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`video not found (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error || !d.video) throw new Error(d.error || "video not found");
        setVideo(d.video);
        setChannel(d.channel);
        setSubscribed(isSubscribed(d.channel?.id));
        // record watch history (local only)
        addToHistory({
          id: d.video.id,
          title: d.video.title,
          thumbnail: d.video.thumbnail,
          channelName: d.video.channelName,
        });
      })
      .catch((e) => setError(e.message));

    fetch(`/api/comments?videoId=${encodeURIComponent(videoId)}`)
      .then((r) => r.json())
      .then((d) => setComments(d.items || []))
      .catch(() => setComments([]));

    fetch(`/api/related?videoId=${encodeURIComponent(videoId)}`)
      .then((r) => r.json())
      .then((d) => setRelated(d.items || []))
      .catch(() => setRelated([]));
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="error-box">
        <h3>No video selected</h3>
        <p>Add a video id, e.g. <code>/watch?v=aqz-KE-bpKQ</code>.</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-box">
        <h3>Couldn&apos;t load this video</h3>
        <p>{error}</p>
        <button className="btn btn-dark" onClick={() => location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  if (!video) return <WatchSkeleton />;

  const likeCount = video.likes + (vote === "like" ? 1 : 0);
  const desc = video.description || "";
  const descShown = expanded || desc.length <= 220 ? desc : desc.slice(0, 220) + "…";

  return (
    <div className="watch">
      <div className="watch-main">
        <div className="player">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <h1 className="watch-title">{video.title}</h1>

        <div className="watch-row">
          <div className="watch-channel">
            <Link href={`/channel/${video.channelId}`}>
              <Avatar name={video.channelName} src={video.channelAvatar} color={video.channelColor} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <Link href={`/channel/${video.channelId}`}>
                <h4>{video.channelName}</h4>
              </Link>
              <div className="subs">
                {channel?.subs != null ? (
                  <>{formatCount(channel.subs)} subscribers</>
                ) : channel?.demo ? (
                  <>demo channel</>
                ) : (
                  <>&nbsp;</>
                )}
              </div>
            </div>
            <button
              className={subscribed ? "btn" : "btn btn-dark"}
              style={{ marginLeft: 12 }}
              aria-pressed={subscribed}
              onClick={() =>
                channel &&
                setSubscribed(
                  toggleSub({
                    id: channel.id,
                    name: channel.name,
                    handle: channel.handle,
                    color: channel.color,
                    avatar: channel.avatar,
                  })
                )
              }
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          <div className="watch-actions">
            <div className="like-group" role="group" aria-label="Rate this video">
              <button
                className={vote === "like" ? "on" : ""}
                onClick={() => setVote(vote === "like" ? null : "like")}
                aria-pressed={vote === "like"}
              >
                👍 {formatCount(likeCount)}
              </button>
              <span className="sep" />
              <button
                className={vote === "dislike" ? "on" : ""}
                onClick={() => setVote(vote === "dislike" ? null : "dislike")}
                aria-pressed={vote === "dislike"}
                aria-label="Dislike"
              >
                👎
              </button>
            </div>
          </div>
        </div>

        <div className="desc-box" onClick={() => setExpanded((e) => !e)}>
          <div className="desc-meta">
            {formatViews(video.views)} • {formatDate(video.publishedAt)}
            {video.demo && <> • <span className="demo-pill">DEMO</span></>}
          </div>
          {descShown}
          {desc.length > 220 && (
            <div style={{ fontWeight: 600, marginTop: 6 }}>
              {expanded ? "…Show less" : "…more"}
            </div>
          )}
        </div>

        <div className="comments">
          <h3>{comments ? `${comments.length} Comments` : "Comments"}</h3>
          {(comments || []).map((c) => (
            <div className="comment" key={c.id}>
              <Avatar name={c.author} src={c.authorAvatar} color={c.authorColor} />
              <div style={{ minWidth: 0 }}>
                <div className="author">
                  {c.author}
                  <span>{timeAgo(c.publishedAt)}</span>
                </div>
                <p>{c.text}</p>
                <div className="c-actions">👍 {formatCount(c.likes)}</div>
              </div>
            </div>
          ))}
          {comments && comments.length === 0 && (
            <div className="empty">Comments are turned off or unavailable.</div>
          )}
        </div>
      </div>

      <aside className="watch-side" aria-label="Related videos">
        {(related || []).map((v) => (
          <VideoRow key={v.id} v={v} compact />
        ))}
      </aside>
    </div>
  );
}
