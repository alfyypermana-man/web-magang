import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";

const NAV = [
  { to: "/", label: "Beranda", end: true },
  { to: "/jobs", label: "Lowongan" },
  { to: "/companies", label: "Perusahaan" },
];

function dashboardPath(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "company") return "/company/dashboard";
  return "/student/dashboard";
}

export default function PublicLayout() {
  const { user, profile, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-ink-900 text-paper" : "text-ink-600 hover:bg-ink-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link to={dashboardPath(role)} className="btn-outline btn-sm">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                  className="btn-ghost btn-sm"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">
                  Masuk
                </Link>
                <Link to="/register" className="btn-accent btn-sm">
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <div className="border-t border-ink-100 bg-paper px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-1 pt-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-ink-900 text-paper" : "text-ink-600"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ink-100 pt-3">
                {user ? (
                  <>
                    <Link to={dashboardPath(role)} className="btn-outline btn-sm justify-center" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut();
                        setOpen(false);
                        navigate("/");
                      }}
                      className="btn-ghost btn-sm justify-center"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-outline btn-sm justify-center" onClick={() => setOpen(false)}>
                      Masuk
                    </Link>
                    <Link to="/register/student" className="btn-accent btn-sm justify-center" onClick={() => setOpen(false)}>
                      Daftar Sekarang
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-100 bg-ink-950 text-ink-200">
        <div className="container-app grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo className="text-paper [&_span:last-child]:text-amber-400" />
            <p className="mt-3 text-sm text-ink-400">
              Platform pencarian PKL, magang, dan internship untuk siswa dan mahasiswa Indonesia.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-paper">Untuk Pelamar</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link to="/jobs" className="hover:text-paper">Cari Lowongan</Link></li>
              <li><Link to="/register/student" className="hover:text-paper">Daftar Siswa</Link></li>
              <li><Link to="/login" className="hover:text-paper">Masuk</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-paper">Untuk Perusahaan</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link to="/register/company" className="hover:text-paper">Daftar Perusahaan</Link></li>
              <li><Link to="/companies" className="hover:text-paper">Direktori Perusahaan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-paper">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li>Tentang Kami</li>
              <li>Kontak</li>
              <li>Kebijakan Privasi</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-800 py-4 text-center text-xs text-ink-500">
          © {new Date().getFullYear()} MagangKu. Seluruh hak cipta dilindungi.
        </div>
      </footer>
    </div>
  );
}
