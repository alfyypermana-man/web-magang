import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-400">
        <Compass size={30} />
      </div>
      <h1 className="font-display text-4xl font-bold text-ink-950">404</h1>
      <p className="mt-2 max-w-sm text-ink-500">Halaman yang Anda cari tidak ditemukan atau sudah dipindahkan.</p>
      <Link to="/" className="btn-primary mt-6">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
