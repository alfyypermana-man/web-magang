import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "Terjadi kesalahan",
  description = "Kami tidak dapat memuat data ini. Silakan coba lagi.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-red-100 bg-red-50/50 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-400">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline btn-sm mt-4">
          <RefreshCw size={14} /> Coba Lagi
        </button>
      )}
    </div>
  );
}
