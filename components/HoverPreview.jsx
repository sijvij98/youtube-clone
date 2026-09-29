"use client";

import { useEffect, useRef, useState } from "react";
import { MuteIcon, UnmuteIcon } from "./icons";

// Inline video preview on hover (YouTube-style).
// After a short hover delay the still thumbnail is replaced by a muted,
// autoplaying embed. A mute/unmute toggle lets the viewer turn sound on.
// Only activates on devices with a real hover capability (desktops) so
// touch taps keep navigating normally. The iframe is pointer-transparent
// so clicking the preview still opens the watch page; only the mute
// button is clickable (and it stops the click from navigating).
export default function HoverPreview({
  videoId,
  thumbnail,
  durationLabel = null,
  demo = false,
  delay = 600,
}) {
  const [previewing, setPreviewing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hoverable, setHoverable] = useState(false);
  const timer = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      setHoverable(true);
    }
    return () => clearTimeout(timer.current);
  }, []);

  const start = () => {
    if (!hoverable || !videoId) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPreviewing(true), delay);
  };

  const stop = () => {
    clearTimeout(timer.current);
    if (previewing) {
      setPreviewing(false);
      setMuted(true);
    }
  };

  const sendPlayerCommand = (func) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args: [] }),
        "*"
      );
    } catch {
      /* preview gone — nothing to do */
    }
  };

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextMuted = !muted;
    setMuted(nextMuted);
    sendPlayerCommand(nextMuted ? "mute" : "unMute");
  };

  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&mute=1&controls=0&rel=0&playsinline=1` +
    `&iv_load_policy=3&disablekb=1&enablejsapi=1`;

  return (
    <div className="hover-preview" onMouseEnter={start} onMouseLeave={stop}>
      <img src={thumbnail} alt="" loading="lazy" />
      {demo && <span className="demo-tag">DEMO</span>}
      {!previewing && durationLabel}
      {previewing && (
        <>
          <iframe
            ref={iframeRef}
            src={src}
            className="hover-iframe"
            title="Video preview"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
          />
          <button
            type="button"
            className="hover-mute"
            onClick={toggleMute}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label={muted ? "Unmute preview" : "Mute preview"}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <MuteIcon size={18} /> : <UnmuteIcon size={18} />}
          </button>
        </>
      )}
    </div>
  );
}
