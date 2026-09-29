// Channel avatar: real image when available, otherwise a colored initial.
export default function Avatar({ name, src, color }) {
  const initial = ((name || "?").trim().charAt(0) || "?").toUpperCase();
  return (
    <span className="avatar" style={src ? undefined : { background: color || "#555" }}>
      {src ? <img src={src} alt={name || "channel"} loading="lazy" /> : initial}
    </span>
  );
}
