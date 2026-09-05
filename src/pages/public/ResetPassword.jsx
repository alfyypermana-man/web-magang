import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordField } from "../../components/FormFields";
import { Spinner } from "../../components/Loading";
import Logo from "../../components/Logo";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setError(error.message || "Gagal memperbarui password. Link mungkin sudah kedaluwarsa.");
      return;
    }

    showToast("Password berhasil diperbarui. Silakan login kembali.", "success");
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-950">Buat Password Baru</h1>
          <p className="mt-1 text-sm text-ink-500">Masukkan password baru untuk akun Anda.</p>
        </div>

        <div className="card p-6">
          {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField label="Password Baru" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" />
            <PasswordField label="Konfirmasi Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size={16} /> : "Simpan Password Baru"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
