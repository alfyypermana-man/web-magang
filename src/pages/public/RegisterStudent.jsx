import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, PasswordField } from "../../components/FormFields";
import { Spinner } from "../../components/Loading";
import Logo from "../../components/Logo";
import { useAuth } from "../../contexts/AuthContext";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  whatsapp: "",
  schoolName: "",
  major: "",
  className: "",
};

export default function RegisterStudent() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signUpStudent } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const { error, needsEmailConfirmation } = await signUpStudent(form);
    setLoading(false);

    if (error) {
      setError(error.message || "Registrasi gagal. Silakan coba lagi.");
      return;
    }

    if (needsEmailConfirmation) {
      setSuccess(true);
    } else {
      navigate("/student/dashboard", { replace: true });
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-4 py-10">
        <div className="card w-full max-w-md p-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-xl font-bold text-ink-950">Registrasi berhasil!</h1>
          <p className="mt-2 text-sm text-ink-500">
            Silakan cek email <span className="font-medium text-ink-800">{form.email}</span> untuk melakukan verifikasi sebelum login.
          </p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">
            Ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-950">Daftar sebagai Student</h1>
          <p className="mt-1 text-sm text-ink-500">Buat akun untuk mulai mencari PKL & magang impianmu.</p>
        </div>

        <div className="card p-6">
          {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField label="Nama Lengkap" required value={form.fullName} onChange={update("fullName")} placeholder="Nama lengkap Anda" />
            <TextField label="Email" type="email" required value={form.email} onChange={update("email")} placeholder="nama@email.com" />
            <div className="grid grid-cols-2 gap-4">
              <PasswordField label="Password" required value={form.password} onChange={update("password")} placeholder="Minimal 6 karakter" />
              <PasswordField label="Konfirmasi Password" required value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Ulangi password" />
            </div>
            <TextField label="Nomor WhatsApp" required value={form.whatsapp} onChange={update("whatsapp")} placeholder="08xxxxxxxxxx" />
            <TextField label="Nama Sekolah / Universitas" required value={form.schoolName} onChange={update("schoolName")} placeholder="Contoh: SMK Negeri 1 Jakarta" />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Jurusan" required value={form.major} onChange={update("major")} placeholder="Contoh: Rekayasa Perangkat Lunak" />
              <TextField label="Kelas" value={form.className} onChange={update("className")} placeholder="Contoh: XII RPL 1" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size={16} /> : "Daftar Sekarang"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-ink-900 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
