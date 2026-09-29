"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VideoCard from "./VideoCard";
import { GridSkeleton } from "./Skeletons";

const CHIPS = [
  "All", "Music", "Gaming", "News", "Sports", "Movies",
  "Live", "Podcasts", "Comedy", "Technology", "Cooking", "Travel",
];

export default function HomeClient() {
  const router = useRouter();
  const [videos, setVideos] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState("All");

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => {
        if (!r.ok) throw new Error(`request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setVideos(d.items || []);
      })
      .catch((e) => setError(e.message));
  }, []);

  const pick = (chip) => {
    setActive(chip);
    if (chip === "All") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(`/results?search_query=${encodeURIComponent(chip)}`);
    }
  };

  return (
    <>
      <div className="chips" role="tablist" aria-label="Categories">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            className={`chip${active === chip ? " active" : ""}`}
            onClick={() => pick(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
      {error && (
        <div className="error-box">
          <h3>Couldn&apos;t load trending videos</h3>
          <p>{error}</p>
          <button className="btn btn-dark" onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      )}
      {!error && !videos && <GridSkeleton />}
      {!error && videos && (
        <div className="grid">
          {videos.map((v) => (
            <VideoCard key={v.id} v={v} />
          ))}
        </div>
      )}
    </>
  );
}
