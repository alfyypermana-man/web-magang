import React from "react";

const VARIANTS = {
  neutral: "bg-ink-50 text-ink-600",
  success: "bg-teal-50 text-teal-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-ink-100 text-ink-700",
  outline: "border border-ink-200 text-ink-600",
};

export default function Badge({ children, variant = "neutral", className = "" }) {
  return <span className={`badge ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}>{children}</span>;
}

export function statusVariant(status) {
  const map = {
    applied: "info",
    "under review": "warning",
    under_review: "warning",
    shortlisted: "warning",
    interview: "info",
    accepted: "success",
    rejected: "danger",
    pending: "warning",
    verified: "success",
    active: "success",
    draft: "neutral",
    closed: "neutral",
    scheduled: "info",
    completed: "success",
    cancelled: "danger",
    resolved: "success",
    reviewing: "warning",
    suspended: "danger",
  };
  return map[String(status).toLowerCase()] || "neutral";
}
