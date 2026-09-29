"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Client wrapper around every page: fixed header, collapsible sidebar,
// mobile drawer, and the demo-mode banner.
export default function AppShell({ children }) {
  const pathname = usePathname();
  const [mini, setMini] = useState(false); // desktop: collapsed icon rail
  const [drawer, setDrawer] = useState(false); // mobile: overlay drawer
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setDemo(!!d.demo))
      .catch(() => {});
  }, []);

  // Watch and Shorts pages always use the slim icon rail,
  // regardless of the sidebar toggle state.
  const forceMini =
    pathname === "/watch" ||
    pathname.startsWith("/watch/") ||
    pathname === "/shorts" ||
    pathname.startsWith("/shorts/");
  const sidebarMini = forceMini || mini;

  const onMenu = () => {
    if (window.matchMedia("(max-width: 900px)").matches) setDrawer((d) => !d);
    else setMini((m) => !m);
  };

  return (
    <>
      <Header onMenu={onMenu} demo={demo} />
      <div className="app-body">
        <Sidebar
          mini={sidebarMini}
          open={drawer}
          onNavigate={() => setDrawer(false)}
        />
        <div
          className={`scrim${drawer ? " show" : ""}`}
          onClick={() => setDrawer(false)}
        />
        <main className={`main${sidebarMini ? " mini" : ""}`}>
          {demo && (
            <div className="demo-banner">
              <strong>Demo mode</strong> — no <code>YOUTUBE_API_KEY</code> found,
              so you&apos;re seeing built-in demo videos. Stats shown are
              illustrative. Add your free API key to <code>.env.local</code> for
              live YouTube data (see README).
            </div>
          )}
          {children}
        </main>
      </div>
    </>
  );
}
