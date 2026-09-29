"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header({ onMenu, demo }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/results?search_query=${encodeURIComponent(query)}`);
  };

  return (
    <header className="header">
      <button className="icon-btn" onClick={onMenu} aria-label="Toggle menu">
        ☰
      </button>
      <Link className="logo" href="/" aria-label="MyTube home">
        <span className="logo-play" />
        <span className="logo-text">MyTube</span>
      </Link>
      {demo && <span className="demo-pill">DEMO</span>}
      <div className="header-center">
        <form className="searchbar" onSubmit={submit} role="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search videos and channels"
            aria-label="Search"
          />
          <button type="submit" aria-label="Search">
            ⌕
          </button>
        </form>
      </div>
      {/* spacer keeps the search bar visually centered */}
      <div style={{ width: 40, flex: "none" }} />
    </header>
  );
}
