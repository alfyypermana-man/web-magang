import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const ROLE_HOME = { student: "/student/dashboard", company: "/company/dashboard", admin: "/admin/dashboard" };

export default function Unauthorized() {
  const { role } = useAuth();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
        <ShieldAlert size={30} />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink-950">403 — Akses Ditolak</h1>
      <p className="mt-2 max-w-sm text-ink-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link to={role ? ROLE_HOME[role] || "/" : "/"} className="btn-primary mt-6">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
