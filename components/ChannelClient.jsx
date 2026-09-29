"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import VideoCard from "./VideoCard";
import { ChannelSkeleton } from "./Skeletons";
import { formatCount } from "../lib/format";
import { isSubscribed, toggleSub } from "../lib/store";

export default function ChannelClient({ channelId }) {
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("videos");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setChannel(null);
    setVideos(null);
    setError("");
    setTab("videos");

    fetch(`/api/channel?id=${encodeURIComponent(channelId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`channel not found (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error || !d.channel) throw new Error(d.error || "channel not found");
        setChannel(d.channel);
        setSubscribed(isSubscribed(d.channel.id));
      })
      .catch((e) => setError(e.message));

    fetch(`/api/channel-videos?channelId=${encodeURIComponent(channelId)}`)
      .then((r) => r.json())
      .then((d) => setVideos(d.items || []))
      .catch(() => setVideos([]));
  }, [channelId]);

  if (error) {
    return (
      <div className="error-box">
        <h3>Couldn&apos;t load this channel</h3>
        <p>{error}</p>
        <button className="btn btn-dark" onClick={() => location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  if (!channel) return <ChannelSkeleton />;

  const bannerStyle = channel.banner
    ? { backgroundImage: `url(${channel.banner})` }
    : {
        background: `linear-gradient(100deg, ${channel.color || "#444"} 0%, #1c1c1c 90%)`,
      };

  return (
    <div>
      <div className="channel-banner" style={bannerStyle} />

      <div className="channel-head">
        <Avatar name={channel.name} src={channel.avatar} color={channel.color} />
        <div style={{ minWidth: 0 }}>
          <h1>
            {channel.name}{" "}
            {channel.demo && <span className="demo-pill">DEMO</span>}
          </h1>
          <div className="meta">
            {channel.handle}
            {channel.subs != null && <> • {formatCount(channel.subs)} subscribers</>}
            {channel.videoCount != null && <> • {formatCount(channel.videoCount)} videos</>}
            {channel.demo && <> • demo channel — stats hidden</>}
          </div>
          <div className="meta">
            {channel.description
              ? channel.description.slice(0, 120) + (channel.description.length > 120 ? "…" : "")
              : ""}
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              className={subscribed ? "btn" : "btn btn-dark"}
              aria-pressed={subscribed}
              onClick={() =>
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
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button
          className={`tab${tab === "videos" ? " active" : ""}`}
          onClick={() => setTab("videos")}
          role="tab"
          aria-selected={tab === "videos"}
        >
          Videos
        </button>
        <button
          className={`tab${tab === "about" ? " active" : ""}`}
          onClick={() => setTab("about")}
          role="tab"
          aria-selected={tab === "about"}
        >
          About
        </button>
      </div>

      {tab === "videos" && (
        <div className="grid" style={{ paddingTop: 20 }}>
          {(videos || []).map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
          {videos && videos.length === 0 && (
            <div className="empty">No videos found for this channel.</div>
          )}
        </div>
      )}

      {tab === "about" && (
        <div className="about">
          <h3>Description</h3>
          {channel.description || "No description."}
          <h3>Details</h3>
          <div className="stat">
            {channel.handle && <>Handle: {channel.handle}<br /></>}
            {channel.subs != null ? (
              <>Subscribers: {formatCount(channel.subs)}<br /></>
            ) : (
              <>Subscribers: — (demo mode hides stats)<br /></>
            )}
            {channel.videoCount != null ? (
              <>Videos: {formatCount(channel.videoCount)}</>
            ) : (
              <>Videos: {videos ? videos.length : "—"} in demo set</>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
