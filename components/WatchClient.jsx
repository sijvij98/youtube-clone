"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Avatar from "./Avatar";
import VideoRow from "./VideoRow";
import Toast from "./Toast";
import SaveDialog from "./SaveDialog";
import { WatchSkeleton } from "./Skeletons";
import {
  formatViews,
  formatCount,
  formatDate,
  timeAgo,
  parseChapters,
} from "../lib/format";
import {
  isSubscribed,
  toggleSub,
  addToHistory,
  isLiked,
  toggleLike,
  isWatchLater,
  toggleWatchLater,
} from "../lib/store";
import {
  LikeIcon,
  DislikeIcon,
  ShareIcon,
  SaveIcon,
  ClockIcon,
  MoreIcon,
  LinkIcon,
  PlayIcon,
  TheaterIcon,
  FullscreenIcon,
  ReplyIcon,
} from "./icons";

// ---- YouTube IFrame API, loaded once per page lifetime ----
let ytApiPromise = null;
function loadYouTubeApi() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => reject(new Error("api script failed"));
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve(window.YT);
    };
  });
  return ytApiPromise;
}

// ---- single comment row (also used for replies) ----
function CommentRow({ comment }) {
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState(null);
  const [hideToggle, setHideToggle] = useState(false);

  const toggleReplies = () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (replies !== null) {
      setOpen(true);
      return;
    }
    fetch(`/api/replies?parentId=${encodeURIComponent(comment.id)}`)
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        setReplies(items);
        if (items.length === 0) {
          setHideToggle(true);
          setOpen(false);
        } else {
          setOpen(true);
        }
      })
      .catch(() => {
        setReplies([]);
        setHideToggle(true);
      });
  };

  return (
    <div className="comment">
      <Avatar
        name={comment.author}
        src={comment.authorAvatar}
        color={comment.authorColor}
      />
      <div style={{ minWidth: 0 }}>
        <div className="author">
          {comment.author}
          <span>{timeAgo(comment.publishedAt)}</span>
        </div>
        <p>{comment.text}</p>
        <div className="c-actions">
          <button
            className="c-act"
            onClick={() => setLiked((l) => !l)}
            aria-pressed={liked}
            aria-label="Like this comment"
          >
            <LikeIcon size={14} />
            {formatCount((comment.likes || 0) + (liked ? 1 : 0))}
          </button>
          {!hideToggle && (
            <button
              className="reply-toggle"
              onClick={toggleReplies}
              aria-expanded={open}
            >
              <ReplyIcon size={14} /> Replies
            </button>
          )}
        </div>
        {open && replies && replies.length > 0 && (
          <div className="comment-replies">
            {replies.map((r) => (
              <CommentRow key={r.id} comment={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WatchClient() {
  const params = useSearchParams();
  const videoId = params.get("v") || "";

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [comments, setComments] = useState(null);
  const [related, setRelated] = useState(null);
  const [error, setError] = useState("");

  const [order, setOrder] = useState("relevance"); // 'relevance' | 'time'
  const [vote, setVote] = useState(null); // 'like' | 'dislike' | null
  const [subscribed, setSubscribed] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [theater, setTheater] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [relFilter, setRelFilter] = useState("all"); // 'all' | 'channel' | 'newest'

  // custom progress bar state
  const [showBar, setShowBar] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferFrac, setBufferFrac] = useState(0);
  const playerWrapRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);

  // ---- data: video + related on videoId change ----
  useEffect(() => {
    if (!videoId) return;
    setVideo(null);
    setChannel(null);
    setComments(null);
    setRelated(null);
    setError("");
    setVote(null);
    setExpanded(false);
    setOrder("relevance");
    setTheater(false);
    setMoreOpen(false);
    setSaveOpen(false);
    setRelFilter("all");

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
        setVote(isLiked(d.video.id) ? "like" : null);
        setWatchLater(isWatchLater(d.video.id));
        // record watch history (local only)
        addToHistory({
          id: d.video.id,
          title: d.video.title,
          thumbnail: d.video.thumbnail,
          channelName: d.video.channelName,
        });
      })
      .catch((e) => setError(e.message));

    fetch(`/api/related?videoId=${encodeURIComponent(videoId)}`)
      .then((r) => r.json())
      .then((d) => setRelated(d.items || []))
      .catch(() => setRelated([]));
  }, [videoId]);

  // ---- comments, refetched when sort order changes ----
  useEffect(() => {
    if (!videoId) return;
    setComments(null);
    fetch(
      `/api/comments?videoId=${encodeURIComponent(
        videoId
      )}&order=${encodeURIComponent(order)}`
    )
      .then((r) => r.json())
      .then((d) => setComments(d.items || []))
      .catch(() => setComments([]));
  }, [videoId, order]);

  // ---- YouTube player: custom progress tracking ----
  useEffect(() => {
    if (!video) return;
    setCurrentTime(0);
    setBufferFrac(0);
    setDuration(video.durationSec || 0);
    setShowBar(true);

    let cancelled = false;
    let timer = null;
    const timeout = setTimeout(() => {
      if (!cancelled && !playerRef.current) setShowBar(false);
    }, 8000);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !iframeRef.current) return;
        try {
          new YT.Player(iframeRef.current, {
            events: {
              onReady: (e) => {
                if (cancelled) return;
                clearTimeout(timeout);
                playerRef.current = e.target;
                try {
                  const d = e.target.getDuration();
                  if (d > 0) setDuration(d);
                } catch {
                  // duration unavailable — keep API value
                }
                timer = setInterval(() => {
                  if (cancelled) return;
                  try {
                    setCurrentTime(e.target.getCurrentTime() || 0);
                    setBufferFrac(
                      e.target.getVideoLoadedFraction
                        ? e.target.getVideoLoadedFraction()
                        : 0
                    );
                  } catch {
                    // player gone
                  }
                }, 500);
              },
              onError: () => {
                if (!cancelled) {
                  clearTimeout(timeout);
                  setShowBar(false);
                }
              },
            },
          });
        } catch {
          if (!cancelled) {
            clearTimeout(timeout);
            setShowBar(false);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timeout);
          setShowBar(false);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
      try {
        playerRef.current?.destroy();
      } catch {
        // already gone
      }
      playerRef.current = null;
    };
  }, [video?.id]);

  // ---- close the more-menu when clicking anywhere else ----
  useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [moreOpen]);

  if (!videoId) {
    return (
      <div className="error-box">
        <h3>No video selected</h3>
        <p>
          Add a video id, e.g. <code>/watch?v=aqz-KE-bpKQ</code>.
        </p>
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

  const desc = video.description || "";
  const chapters = parseChapters(desc);
  const hashtags = (desc.match(/#[\p{L}\p{N}_]+/gu) || []).slice(0, 3);
  const collapsedText = desc.length > 160 ? desc.slice(0, 160) + "…" : desc;

  const likeCount = (video.likes || 0) + (vote === "like" ? 1 : 0);

  const handleLike = () => {
    const target = vote !== "like";
    if (isLiked(video.id) !== target) toggleLike(video);
    setVote(target ? "like" : null);
  };
  const handleDislike = () =>
    setVote(vote === "dislike" ? null : "dislike");

  const handleSub = () => {
    if (!channel) return;
    setSubscribed(
      toggleSub({
        id: channel.id,
        name: channel.name,
        handle: channel.handle,
        color: channel.color,
        avatar: channel.avatar,
      })
    );
  };

  const handleWatchLater = () => {
    const now = toggleWatchLater(video);
    setWatchLater(now);
    setToast(now ? "Saved to Watch later" : "Removed from Watch later");
  };

  const watchUrl = `/watch?v=${video.id}`;
  const copyLink = async () => {
    const url = `${window.location.origin}${watchUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        setToast("Link copied to clipboard");
      } catch {
        setToast("Couldn't copy the link");
      }
    }
  };

  // seek via the JS player; if the API never loaded, fall back to
  // reloading the embed with ?start= (plain embed still plays)
  const seekTo = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const p = playerRef.current;
    if (p && typeof p.seekTo === "function") {
      p.seekTo(s, true);
    } else if (iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${video.id}?rel=0&enablejsapi=1&start=${s}&autoplay=1`;
    }
  };

  const onProgressClick = (e) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width)
    );
    seekTo(frac * duration);
  };

  const goFullscreen = () => {
    const el = playerWrapRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  let relItems = related || [];
  if (relFilter === "channel") {
    relItems = relItems.filter((v) => v.channelId === video.channelId);
  }
  if (relFilter === "newest") {
    relItems = [...relItems]
      .slice()
      .sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }

  const chips = [
    { id: "all", label: "All" },
    { id: "channel", label: `From ${video.channelName}` },
    { id: "newest", label: "Newest" },
  ];

  return (
    <div className="watch-ambient">
      <div
        className="ambient-glow"
        style={{ backgroundImage: `url("${video.thumbnail}")` }}
      />
      <div className={`watch${theater ? " theater" : ""}`}>
        <div className="watch-main">
          <div className="player-wrap" ref={playerWrapRef}>
            <iframe
              id="mytube-player"
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${video.id}?rel=0&enablejsapi=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {showBar && (
            <div
              className="progress"
              onClick={onProgressClick}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(currentTime)}
            >
              <div className="progress-track">
                <div
                  className="progress-buffer"
                  style={{ width: `${bufferFrac * 100}%` }}
                />
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              {duration > 0 &&
                chapters.map((ch) => (
                  <span
                    key={ch.sec}
                    className="ch-marker"
                    style={{ left: `${(ch.sec / duration) * 100}%` }}
                    title={ch.title}
                  />
                ))}
              <span className="progress-knob" style={{ left: `${pct}%` }} />
            </div>
          )}

          <h1 className="watch-title">{video.title}</h1>

          <div className="watch-row">
            <div className="watch-channel">
              <Link href={`/channel/${video.channelId}`}>
                <Avatar
                  name={video.channelName}
                  src={video.channelAvatar}
                  color={video.channelColor}
                />
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
                className={`sub-pill${subscribed ? " subscribed" : ""}`}
                aria-pressed={subscribed}
                onClick={handleSub}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            <div className="watch-actions">
              <div className="like-seg" role="group" aria-label="Rate this video">
                <button
                  className={vote === "like" ? "on" : ""}
                  onClick={handleLike}
                  aria-pressed={vote === "like"}
                  aria-label="Like this video"
                >
                  <LikeIcon size={18} /> {formatCount(likeCount)}
                </button>
                <span className="seg-sep" />
                <button
                  className={vote === "dislike" ? "on" : ""}
                  onClick={handleDislike}
                  aria-pressed={vote === "dislike"}
                  aria-label="Dislike this video"
                >
                  <DislikeIcon size={18} />
                </button>
              </div>

              <button className="action-pill" onClick={copyLink}>
                <ShareIcon size={18} /> Share
              </button>
              <button className="action-pill" onClick={() => setSaveOpen(true)}>
                <SaveIcon size={18} /> Save
              </button>
              <button
                className={`action-pill${watchLater ? " active" : ""}`}
                onClick={handleWatchLater}
                aria-pressed={watchLater}
              >
                <ClockIcon size={18} /> Watch Later
              </button>
              <button
                className="icon-btn"
                onClick={() => setTheater((t) => !t)}
                aria-pressed={theater}
                aria-label="Theater mode"
                title="Theater mode"
              >
                <TheaterIcon size={20} />
              </button>
              <button
                className="icon-btn"
                onClick={goFullscreen}
                aria-label="Fullscreen"
                title="Fullscreen"
              >
                <FullscreenIcon size={20} />
              </button>
              <div className="more-wrap">
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoreOpen((o) => !o);
                  }}
                  aria-label="More actions"
                  aria-expanded={moreOpen}
                >
                  <MoreIcon size={20} />
                </button>
                {moreOpen && (
                  <div
                    className="more-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="menu-item"
                      onClick={() => {
                        setMoreOpen(false);
                        copyLink();
                      }}
                    >
                      <LinkIcon size={18} /> Copy link
                    </button>
                    <a
                      className="menu-item"
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMoreOpen(false)}
                    >
                      <PlayIcon size={18} /> Open on YouTube
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="desc-box" onClick={() => setExpanded((e) => !e)}>
            <div className="desc-meta">
              {formatViews(video.views)} • {formatDate(video.publishedAt)}
              {video.demo && (
                <>
                  {" "}• <span className="demo-pill">DEMO</span>
                </>
              )}
            </div>
            {!expanded && hashtags.length > 0 && (
              <div className="desc-tags">{hashtags.join("  ")}</div>
            )}
            {expanded ? desc : collapsedText}
            {desc.length > 160 && (
              <div>{expanded ? "Show less" : "…more"}</div>
            )}
            {expanded && chapters.length > 0 && (
              <div className="chapters" onClick={(e) => e.stopPropagation()}>
                <h5>Chapters</h5>
                {chapters.map((ch) => (
                  <button
                    key={ch.sec}
                    className="chapter-row"
                    onClick={() => seekTo(ch.sec)}
                  >
                    <span className="ch-time">{ch.label}</span>
                    <span className="ch-title">{ch.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="comments">
            <div className="comments-head">
              <h3>
                {comments
                  ? `${comments.length} Comment${
                      comments.length === 1 ? "" : "s"
                    }`
                  : "Comments"}
              </h3>
              <div className="sort-pills">
                <button
                  className={`sort-pill${
                    order === "relevance" ? " active" : ""
                  }`}
                  onClick={() => setOrder("relevance")}
                >
                  Top comments
                </button>
                <button
                  className={`sort-pill${order === "time" ? " active" : ""}`}
                  onClick={() => setOrder("time")}
                >
                  Newest first
                </button>
              </div>
            </div>
            {(comments || []).map((c) => (
              <CommentRow key={c.id} comment={c} />
            ))}
            {comments && comments.length === 0 && (
              <div className="empty">
                Comments are turned off or unavailable.
              </div>
            )}
          </div>
        </div>

        <aside className="watch-side" aria-label="Related videos">
          <div className="related-chips">
            {chips.map((c) => (
              <button
                key={c.id}
                className={`chip${relFilter === c.id ? " active" : ""}`}
                onClick={() => setRelFilter(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          {relItems.map((v) => (
            <VideoRow key={v.id} v={v} compact />
          ))}
          {related && relItems.length === 0 && (
            <div className="empty">No related videos.</div>
          )}
        </aside>
      </div>

      <Toast msg={toast} onDone={() => setToast("")} />
      <SaveDialog
        video={video}
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
      />
    </div>
  );
}
