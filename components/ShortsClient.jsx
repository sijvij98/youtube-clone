"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Avatar from "./Avatar";
import Toast from "./Toast";
import {
  LikeIcon,
  DislikeIcon,
  ShareIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "./icons";
import { formatCount } from "../lib/format";
import { isLiked, toggleLike, isSubscribed, toggleSub } from "../lib/store";

function embedSrc(id, muted) {
  return (
    `https://www.youtube.com/embed/${id}` +
    `?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${id}` +
    `&controls=1&rel=0&enablejsapi=1`
  );
}

function sendCommand(iframe, func) {
  try {
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func }),
      "*"
    );
  } catch {
    // iframe not ready yet — non-fatal
  }
}

function ShortItem({ v, muted, onToggleMute, onShare }) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subbed, setSubbed] = useState(false);

  useEffect(() => {
    setLiked(isLiked(v.id));
    setSubbed(isSubscribed(v.channelId));
  }, [v.id, v.channelId]);

  const doLike = () => {
    const now = toggleLike(v);
    setLiked(now);
    if (now) setDisliked(false);
  };

  const doSub = () => {
    setSubbed(toggleSub({ id: v.channelId, name: v.channelName, avatar: v.channelAvatar }));
  };

  return (
    <>
      <div className="short-player-wrap">
        <iframe
          src={embedSrc(v.id, muted)}
          title={v.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <button
          className="short-mute"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeMuteIcon size={20} /> : <VolumeIcon size={20} />}
        </button>
        <div className="short-overlay">
          <div className="short-channel-row">
            <Link href={`/channel/${v.channelId}`} aria-label={v.channelName}>
              <Avatar name={v.channelName} src={v.channelAvatar} />
            </Link>
            <h4>{v.channelName}</h4>
            <button
              className={`sub-pill${subbed ? " subscribed" : ""}`}
              style={{ padding: "8px 14px", fontSize: 13 }}
              onClick={doSub}
              aria-pressed={subbed}
            >
              {subbed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
          <div className="short-title">{v.title}</div>
        </div>
      </div>
      <div className="short-actions">
        <button
          className={`short-act${liked ? " on" : ""}`}
          onClick={doLike}
          aria-pressed={liked}
        >
          <span className="act-circle">
            <LikeIcon size={22} />
          </span>
          {formatCount(v.likes || 0)}
        </button>
        <button
          className={`short-act${disliked ? " on" : ""}`}
          onClick={() => setDisliked((d) => !d)}
          aria-pressed={disliked}
        >
          <span className="act-circle">
            <DislikeIcon size={22} />
          </span>
          Dislike
        </button>
        <Link href={`/watch?v=${v.id}`} className="short-act">
          <span className="act-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12z" />
            </svg>
          </span>
          {formatCount(v.commentCount || 0)}
        </Link>
        <button className="short-act" onClick={() => onShare(v)}>
          <span className="act-circle">
            <ShareIcon size={22} />
          </span>
          Share
        </button>
      </div>
    </>
  );
}

export default function ShortsClient() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(true);
  const [toast, setToast] = useState("");
  const containerRef = useRef(null);
  const itemElsRef = useRef(new Map()); // videoId -> .short-item element
  const iframesRef = useRef(new Map()); // videoId -> iframe element

  useEffect(() => {
    fetch("/api/shorts")
      .then((r) => {
        if (!r.ok) throw new Error(`request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setItems(d.items || []);
      })
      .catch((e) => setError(e.message));
  }, []);

  // scroll to ?start=<videoId> on mount
  const startId = searchParams.get("start");
  useEffect(() => {
    if (!items || !startId) return;
    const el = itemElsRef.current.get(startId);
    if (el) el.scrollIntoView({ block: "start" });
  }, [items, startId]);

  // IntersectionObserver: play on-screen, pause off-screen
  useEffect(() => {
    if (!items) return;
    const container = containerRef.current;
    if (!container) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const id = en.target.getAttribute("data-id");
          const iframe = iframesRef.current.get(id);
          if (!iframe) return;
          sendCommand(iframe, en.isIntersecting ? "playVideo" : "pauseVideo");
        });
      },
      { root: container, threshold: 0.6 }
    );
    itemElsRef.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  const goTo = useCallback(
    (dir) => {
      const container = containerRef.current;
      if (!container || !items) return;
      const order = items.map((v) => v.id);
      const els = order.map((id) => itemElsRef.current.get(id)).filter(Boolean);
      if (!els.length) return;
      const top = container.scrollTop + container.clientHeight / 2;
      let current = 0;
      els.forEach((el, i) => {
        if (el.offsetTop <= top) current = i;
      });
      const next = Math.min(els.length - 1, Math.max(0, current + dir));
      els[next].scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [items]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goTo(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goTo(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  const onShare = (v) => {
    const url = `${window.location.origin}/watch?v=${v.id}`;
    const done = () => setToast("Link copied");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(() => setToast("Couldn't copy link"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch {
        setToast("Couldn't copy link");
      }
      document.body.removeChild(ta);
    }
  };

  if (error) {
    return (
      <div className="error-box">
        <h3>Couldn&apos;t load Shorts</h3>
        <p>{error}</p>
        <button className="btn btn-dark" onClick={() => location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="shorts-page">
        <div className="short-item">
          <div className="short-player-wrap">
            <div className="skel" style={{ width: "100%", height: "100%", borderRadius: 24 }} />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <span className="big">🎬</span>
        No Shorts right now.
      </div>
    );
  }

  return (
    <div className="shorts-page" ref={containerRef} style={{ position: "relative" }}>
      {items.map((v) => (
        <div
          key={v.id}
          className="short-item"
          data-id={v.id}
          ref={(el) => {
            if (el) {
              itemElsRef.current.set(v.id, el);
              const iframe = el.querySelector("iframe");
              if (iframe) iframesRef.current.set(v.id, iframe);
            } else {
              itemElsRef.current.delete(v.id);
              iframesRef.current.delete(v.id);
            }
          }}
        >
          <ShortItem
            v={v}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onShare={onShare}
          />
        </div>
      ))}
      <div className="shorts-nav-hint">↑ ↓ to navigate</div>
      <Toast msg={toast} onDone={() => setToast("")} />
    </div>
  );
}
