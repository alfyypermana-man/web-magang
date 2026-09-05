import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Building2 } from "lucide-react";
import { TextField, PasswordField } from "../../components/FormFields";
import { Spinner } from "../../components/Loading";
import Logo from "../../components/Logo";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const ROLE_HOME = { student: "/student/dashboard", company: "/company/dashboard", admin: "/admin/dashboard" };

export default function Login() {
  const [loginAs, setLoginAs] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error, profile, data } = await signIn(form.email, form.password);
    setLoading(false);

    if (error) {
      setError(error.message || "Email atau password salah.");
      return;
    }

    const role = profile?.role;
    if (!role) {
      setError("Profil pengguna tidak ditemukan. Hubungi admin.");
      return;
    }

    if (role !== "admin" && role !== loginAs) {
      setError(`Akun ini terdaftar sebagai ${role === "student" ? "Student/Pelamar" : "Company/Perusahaan"}. Silakan pilih opsi login yang sesuai.`);
      return;
    }

    showToast(`Selamat datang kembali, ${profile.full_name || "Pengguna"}!`, "success");
    const redirectTo = location.state?.from?.pathname;
    navigate(redirectTo && redirectTo !== "/login" ? redirectTo : ROLE_HOME[role] || "/", { replace: true });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-950">Welcome Back</h1>
          <p className="mt-1 text-sm text-ink-500">Login untuk melanjutkan ke akun Anda.</p>
        </div>

        <div className="card p-6">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-ink-50 p-1">
            <button
              type="button"
              onClick={() => setLoginAs("student")}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                loginAs === "student" ? "bg-white shadow-card text-ink-900" : "text-ink-500"
              }`}
            >
              <GraduationCap size={15} /> Student / Pelamar
            </button>
            <button
              type="button"
              onClick={() => setLoginAs("company")}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                loginAs === "company" ? "bg-white shadow-card text-ink-900" : "text-ink-500"
              }`}
            >
              <Building2 size={15} /> Company / Perusahaan
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@email.com"
            />
            <PasswordField
              label="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Masukkan password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-ink-300"
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="font-medium text-ink-700 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size={16} /> : "Login"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-ink-900 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
