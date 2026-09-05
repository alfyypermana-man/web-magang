import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display text-lg font-bold text-ink-900 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-amber-400">
        <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
          <path d="M16 40 L32 20 L48 40" stroke="currentColor" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="46" r="4" fill="#3fb598" />
        </svg>
      </span>
      Magang<span className="text-amber-500">Ku</span>
    </Link>
  );
}
