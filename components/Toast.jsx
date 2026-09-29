"use client";

import { useEffect } from "react";

// Bottom-center toast. Usage:
//   const [toast, setToast] = useState("");
//   <Toast msg={toast} onDone={() => setToast("")} />
//   setToast("Link copied");
export default function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => onDone && onDone(), 2600);
    return () => clearTimeout(t);
  }, [msg, onDone]);

  return (
    <div className={`toast${msg ? " show" : ""}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
