import React, { useState } from "react";
import { LogOut, Info } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { PasswordField } from "../../components/FormFields";
import { Spinner } from "../../components/Loading";
import { ConfirmDialog } from "../../components/Modal";

export default function AdminSettings() {
  const { signOut, updatePassword, profile } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (password !== confirmPassword) { showToast("Konfirmasi password tidak cocok.", "error"); return; }
    if (password.length < 6) { showToast("Password minimal 6 karakter.", "error"); return; }
    setSaving(true);
    const { error } = await updatePassword(password);
    setSaving(false);
    if (error) { showToast("Gagal memperbarui password.", "error"); return; }
    setPassword(""); setConfirmPassword("");
    showToast("Password berhasil diperbarui.", "success");
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-950">Pengaturan Admin</h1>
        <p className="mt-1 text-sm text-ink-500">Kelola akun admin Anda.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-semibold text-ink-900">Informasi Akun</h2>
        <div className="mt-3 space-y-1 text-sm text-ink-600">
          <p><span className="text-ink-400">Nama:</span> {profile?.full_name}</p>
          <p><span className="text-ink-400">Role:</span> Admin</p>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-ink-50 px-3 py-2.5 text-xs text-ink-500">
          <Info size={14} className="mt-0.5 shrink-0" />
          Akun admin baru hanya dapat dibuat melalui Supabase Dashboard oleh developer/pemilik proyek, bukan melalui halaman ini.
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="card space-y-4 p-6">
        <h2 className="font-display text-base font-semibold text-ink-900">Ubah Password</h2>
        <PasswordField label="Password Baru" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordField label="Konfirmasi Password Baru" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size={16} /> : "Perbarui Password"}</button>
      </form>

      <div className="card space-y-3 p-6">
        <h2 className="font-display text-base font-semibold text-ink-900">Sesi</h2>
        <button onClick={() => setConfirmLogout(true)} className="btn-outline"><LogOut size={15} /> Keluar dari Akun</button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={signOut}
        title="Keluar dari Akun"
        description="Anda akan keluar dari sesi ini dan perlu login kembali."
        confirmLabel="Keluar"
        danger
      />
    </div>
  );
}
