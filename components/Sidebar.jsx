"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/history", label: "History", icon: "◷" },
  { href: "/subscriptions", label: "Subscriptions", icon: "▤" },
];

export default function Sidebar({ mini, open, onNavigate }) {
  const pathname = usePathname();
  return (
    <aside className={`sidebar${mini ? " mini" : ""}${open ? " open" : ""}`}>
      <nav>
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`nav-item${pathname === it.href ? " active" : ""}`}
            onClick={onNavigate}
          >
            <span className="nav-icon">{it.icon}</span>
            <span className="nav-label">{it.label}</span>
          </Link>
        ))}
      </nav>
      <div className="nav-section">
        MyTube is a demo front-end for the YouTube Data API v3. Subscriptions and
        history are stored only in this browser.
      </div>
    </aside>
  );
}
