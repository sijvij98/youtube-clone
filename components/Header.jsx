"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";
import NotificationsBell from "./NotificationsBell";
import AvatarMenu from "./AvatarMenu";
import { MenuIcon, MicIcon } from "./icons";

export default function Header({ onMenu, demo }) {
  const [voiceOK, setVoiceOK] = useState(false);
  const [listening, setListening] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const w = typeof window !== "undefined" ? window : null;
    setVoiceOK(!!(w && (w.SpeechRecognition || w.webkitSpeechRecognition)));
  }, []);

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || "";
      if (text.trim() && searchRef.current) {
        searchRef.current.search(text.trim());
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onMenu} aria-label="Toggle menu">
          <MenuIcon />
        </button>
        <Link className="logo" href="/" aria-label="MyTube home">
          <span className="logo-play" />
          <span className="logo-text">MyTube</span>
          <sup>IN</sup>
        </Link>
      </div>
      <div className="header-center">
        <SearchBar ref={searchRef} />
        {voiceOK && (
          <button
            className={`mic-btn${listening ? " listening" : ""}`}
            onClick={startVoice}
            aria-label="Search by voice"
            title="Search by voice"
          >
            <MicIcon size={20} />
          </button>
        )}
      </div>
      <div className="header-right">
        <NotificationsBell />
        <AvatarMenu />
        {demo && <span className="demo-pill">DEMO</span>}
      </div>
    </header>
  );
}
