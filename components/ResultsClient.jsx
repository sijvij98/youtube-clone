"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChannelRow from "./ChannelRow";
import VideoRow from "./VideoRow";
import { RowSkeleton } from "./Skeletons";

export default function ResultsClient() {
  const params = useSearchParams();
  const q = params.get("search_query") || "";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [q]);

  return (
    <div className="results">
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "8px 0" }}>
        {q ? <>Results for “{q}”</> : "Search"}
      </h2>

      {error && (
        <div className="error-box">
          <h3>Search failed</h3>
          <p>{error}</p>
          <button className="btn btn-dark" onClick={() => location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!error && !data && (
        <>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </>
      )}

      {!error && data && (
        <>
          {(data.channels || []).map((c) => (
            <ChannelRow key={c.id} c={c} />
          ))}
          {data.channels?.length > 0 && data.videos?.length > 0 && (
            <hr className="results-divider" />
          )}
          {(data.videos || []).map((v) => (
            <VideoRow key={v.id} v={v} />
          ))}
          {!data.channels?.length && !data.videos?.length && (
            <div className="empty">No results found. Try a different search.</div>
          )}
        </>
      )}
    </div>
  );
}
