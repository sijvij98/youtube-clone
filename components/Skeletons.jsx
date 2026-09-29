// Loading skeletons shown while API data is being fetched.

export function VideoCardSkeleton() {
  return (
    <div>
      <div className="skel" style={{ aspectRatio: "16/9" }} />
      <div style={{ display: "flex", gap: 12, padding: "12px 0" }}>
        <div className="skel skel-circle" style={{ width: 36, height: 36, flex: "none" }} />
        <div style={{ flex: 1 }}>
          <div className="skel skel-line" style={{ width: "90%", marginBottom: 8 }} />
          <div className="skel skel-line" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div style={{ display: "flex", gap: 16, padding: 8 }}>
      <div className="skel" style={{ width: 380, aspectRatio: "16/9", flex: "none" }} />
      <div style={{ flex: 1 }}>
        <div className="skel skel-line" style={{ width: "80%", marginBottom: 10 }} />
        <div className="skel skel-line" style={{ width: "40%", marginBottom: 10 }} />
        <div className="skel skel-line" style={{ width: "95%" }} />
      </div>
    </div>
  );
}

export function WatchSkeleton() {
  return (
    <div className="watch">
      <div className="watch-main">
        <div className="skel" style={{ aspectRatio: "16/9" }} />
        <div className="skel skel-line" style={{ width: "70%", margin: "16px 0" }} />
        <div className="skel skel-line" style={{ width: "40%" }} />
      </div>
      <div className="watch-side">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            <div className="skel" style={{ width: 168, aspectRatio: "16/9", flex: "none" }} />
            <div style={{ flex: 1 }}>
              <div className="skel skel-line" style={{ marginBottom: 8 }} />
              <div className="skel skel-line" style={{ width: "60%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelSkeleton() {
  return (
    <div>
      <div className="skel channel-banner" style={{ borderRadius: 12 }} />
      <div className="channel-head">
        <div className="skel skel-circle" style={{ width: 140, height: 140 }} />
        <div style={{ flex: 1 }}>
          <div className="skel skel-line" style={{ width: 280, height: 28, marginBottom: 12 }} />
          <div className="skel skel-line" style={{ width: 180 }} />
        </div>
      </div>
      <GridSkeleton count={8} />
    </div>
  );
}
