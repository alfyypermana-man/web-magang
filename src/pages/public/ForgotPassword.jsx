import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextField } from "../../components/FormFields";
import { Spinner } from "../../components/Loading";
import Logo from "../../components/Logo";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error.message || "Gagal mengirim email reset password.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-950">Lupa Password</h1>
          <p className="mt-1 text-sm text-ink-500">Masukkan email Anda untuk menerima link reset password.</p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-ink-600">
                Link reset password telah dikirim ke <span className="font-medium text-ink-900">{email}</span>. Silakan cek inbox
                (atau folder spam) Anda.
              </p>
              <Link to="/login" className="btn-outline btn-sm mt-5 inline-flex">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
              <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Spinner size={16} /> : "Kirim Link Reset"}
              </button>
              <Link to="/login" className="block text-center text-sm font-medium text-ink-600 hover:underline">
                Kembali ke Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
