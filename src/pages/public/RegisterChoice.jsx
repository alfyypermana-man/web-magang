import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";
import Logo from "../../components/Logo";

export default function RegisterChoice() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-950">Daftar ke MagangKu</h1>
        <p className="mt-1 text-sm text-ink-500">Pilih jenis akun yang ingin Anda buat.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/register/student" className="card group p-6 text-left transition-shadow hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <GraduationCap size={24} />
            </div>
            <h3 className="font-display text-lg font-semibold text-ink-900">Student / Pelamar</h3>
            <p className="mt-1 text-sm text-ink-500">
              Cari dan lamar lowongan PKL, magang, dan internship dari perusahaan terpercaya.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-900">
              Daftar sebagai Student <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link to="/register/company" className="card group p-6 text-left transition-shadow hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Building2 size={24} />
            </div>
            <h3 className="font-display text-lg font-semibold text-ink-900">Company / Perusahaan</h3>
            <p className="mt-1 text-sm text-ink-500">
              Buka lowongan PKL/magang dan temukan talenta terbaik dari siswa & mahasiswa.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-900">
              Daftar sebagai Perusahaan <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        <p className="mt-6 text-sm text-ink-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-ink-900 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
