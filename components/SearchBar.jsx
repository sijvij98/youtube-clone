"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

// Centered search with debounced autocomplete suggestions.
// Exposes `search(text)` + `setQuery(text)` via ref (used by voice search).
const SearchBar = forwardRef(function SearchBar(props, ref) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef(null);
  const timer = useRef(null);

  // Debounced suggestion fetch — 250ms after the user stops typing.
  useEffect(() => {
    clearTimeout(timer.current);
    const query = q.trim();
    if (!query) {
      setSuggestions([]);
      setOpen(false);
      setActive(-1);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
        const d = await r.json();
        const list = Array.isArray(d.suggestions) ? d.suggestions : [];
        setSuggestions(list);
        setOpen(list.length > 0);
        setActive(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 250);
    return () => clearTimeout(timer.current);
  }, [q]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (text) => {
    const query = (text ?? q).trim();
    if (!query) return;
    setOpen(false);
    setActive(-1);
    router.push(`/results?search_query=${encodeURIComponent(query)}`);
  };

  useImperativeHandle(ref, () => ({
    search: (text) => {
      setQ(text || "");
      go(text);
    },
    setQuery: (text) => setQ(text || ""),
  }));

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    } else if (e.key === "Enter" && open && active >= 0 && active < suggestions.length) {
      e.preventDefault();
      const picked = suggestions[active];
      setQ(picked);
      go(picked);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <form
        className="searchbar"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search videos and channels"
          aria-label="Search"
          autoComplete="off"
        />
        <button type="submit" aria-label="Search">
          <SearchIcon size={20} />
        </button>
      </form>
      {open && suggestions.length > 0 && (
        <div className="suggest" role="listbox" aria-label="Search suggestions">
          {suggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              type="button"
              role="option"
              aria-selected={i === active}
              className={`suggest-item${i === active ? " active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                setQ(s);
                go(s);
              }}
            >
              <SearchIcon size={16} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default SearchBar;
