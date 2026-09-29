"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import VideoCard from "./VideoCard";
import HoverPreview from "./HoverPreview";
import { ChannelSkeleton } from "./Skeletons";
import { PlaylistIcon } from "./icons";
import { formatCount, formatViews, timeAgo, formatDate, formatDuration } from "../lib/format";
import { isSubscribed, toggleSub } from "../lib/store";

const TABS = ["home", "videos", "shorts", "playlists", "about"];
const TAB_LABELS = {
  home: "Home",
  videos: "Videos",
  shorts: "Shorts",
  playlists: "Playlists",
  about: "About",
};

export default function ChannelClient({ channelId }) {
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState(null);
  const [shorts, setShorts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("home");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setChannel(null);
    setVideos(null);
    setShorts([]);
    setPlaylists([]);
    setError("");
    setTab("home");
    setSubscribed(false);
    const cid = encodeURIComponent(channelId);

    fetch(`/api/channel?id=${cid}`)
      .then((r) => {
        if (!r.ok) throw new Error(`channel not found (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        if (d.error || !d.channel) throw new Error(d.error || "channel not found");
        setChannel(d.channel);
        setSubscribed(isSubscribed(d.channel.id));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    // Videos, shorts, and playlists load independently of the channel header.
    const get = (url) =>
      fetch(url)
        .then((r) => r.json())
        .catch(() => ({ items: [] }));
    Promise.all([
      get(`/api/channel-videos?channelId=${cid}`),
      get(`/api/channel-shorts?channelId=${cid}`),
      get(`/api/channel-playlists?channelId=${cid}`),
    ]).then(([v, s, p]) => {
      if (cancelled) return;
      setVideos(v.items || []);
      setShorts(s.items || []);
      setPlaylists(p.items || []);
    });

    return () => {
      cancelled = true;
    };
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

  const snippet = channel.description
    ? channel.description.slice(0, 140) +
      (channel.description.length > 140 ? "…" : "")
    : "";

  const featured = videos && videos.length > 0 ? videos[0] : null;

  const onToggleSub = () =>
    setSubscribed(
      toggleSub({
        id: channel.id,
        name: channel.name,
        handle: channel.handle,
        color: channel.color,
        avatar: channel.avatar,
      })
    );

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
            {channel.subs != null && (
              <> • {formatCount(channel.subs)} subscribers</>
            )}
            {channel.videoCount != null && (
              <> • {formatCount(channel.videoCount)} videos</>
            )}
            {channel.demo && <> • demo channel — stats hidden</>}
          </div>
          {snippet && <div className="meta">{snippet}</div>}
          <div style={{ marginTop: 10 }}>
            <button
              className={`sub-pill${subscribed ? " subscribed" : ""}`}
              aria-pressed={subscribed}
              onClick={onToggleSub}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <div>
          {featured && (
            <Link href={`/watch?v=${featured.id}`} className="ch-home-featured">
              <div className="thumb-wrap">
                <HoverPreview
                  videoId={featured.id}
                  thumbnail={featured.thumbnail}
                  demo={featured.demo}
                  durationLabel={
                    featured.durationSec > 0 && (
                      <span className="duration">
                        {formatDuration(featured.durationSec)}
                      </span>
                    )
                  }
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3>{featured.title}</h3>
                <div className="meta">
                  {formatViews(featured.views)} • {timeAgo(featured.publishedAt)}
                </div>
                {featured.description && (
                  <div className="desc">{featured.description}</div>
                )}
              </div>
            </Link>
          )}
          <div className="section-title">Latest videos</div>
          <div className="grid">
            {(videos || []).slice(1, 9).map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
          {videos && videos.length === 0 && (
            <div className="empty">No videos found for this channel.</div>
          )}
        </div>
      )}

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

      {tab === "shorts" && (
        <div>
          {shorts.length > 0 ? (
            <div className="shorts-grid">
              {shorts.map((s) => (
                <Link key={s.id} href={`/watch?v=${s.id}`} className="short-card">
                  <div className="short-thumb">
                    <img src={s.thumbnail} alt="" loading="lazy" />
                    {s.demo && <span className="demo-tag">DEMO</span>}
                  </div>
                  <h4>{s.title}</h4>
                  <div className="meta">{formatViews(s.views)}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">No shorts found.</div>
          )}
        </div>
      )}

      {tab === "playlists" && (
        <div>
          {playlists.length > 0 ? (
            <div className="pl-grid">
              {playlists.map((p) => (
                <div
                  key={p.id}
                  className="pl-card"
                  role="link"
                  tabIndex={0}
                  title="Open on YouTube"
                  onClick={() =>
                    window.open(
                      `https://www.youtube.com/playlist?list=${p.id}`,
                      "_blank"
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.open(
                        `https://www.youtube.com/playlist?list=${p.id}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  <div className="pl-thumb">
                    {p.thumbnail && (
                      <img src={p.thumbnail} alt="" loading="lazy" />
                    )}
                    <div className="pl-stack">
                      <PlaylistIcon size={26} />
                      <span>{p.itemCount ?? "—"}</span>
                      <span>videos</span>
                    </div>
                  </div>
                  <h3>{p.title}</h3>
                  <div className="meta">
                    {p.itemCount != null
                      ? `${p.itemCount} video${p.itemCount === 1 ? "" : "s"}`
                      : ""}
                    {p.publishedAt ? ` • ${timeAgo(p.publishedAt)}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No playlists found for this channel.</div>
          )}
        </div>
      )}

      {tab === "about" && (
        <div className="about">
          <h3>Description</h3>
          {channel.description || "No description."}
          <h3>Details</h3>
          <div className="stat">
            {channel.handle && (
              <>
                {channel.handle}
                <br />
              </>
            )}
            {channel.subs != null ? (
              <>Subscribers: {formatCount(channel.subs)}</>
            ) : (
              <>Subscribers: — (demo mode hides stats)</>
            )}
            <br />
            {channel.videoCount != null ? (
              <>Videos: {formatCount(channel.videoCount)}</>
            ) : (
              <>Videos: — (demo mode hides stats)</>
            )}
            {channel.joinedAt && (
              <>
                <br />
                Joined {formatDate(channel.joinedAt)}
              </>
            )}
          </div>
          {channel.demo && (
            <p className="local-note" style={{ padding: 0, marginTop: 16 }}>
              Demo channel — real subscriber and video counts aren&apos;t
              available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
