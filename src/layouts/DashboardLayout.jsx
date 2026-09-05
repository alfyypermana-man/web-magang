import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Bell, ChevronDown } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardLayout({ navItems, roleLabel }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-ink-50/40">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-ink-100 px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-ink-900 text-paper" : "text-ink-600 hover:bg-ink-50"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-3">
          <button onClick={handleSignOut} className="btn-ghost btn-sm w-full justify-start">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
              <Logo />
              <button onClick={() => setDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-ink-900 text-paper" : "text-ink-600 hover:bg-ink-50"
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-ink-100 p-3">
              <button onClick={handleSignOut} className="btn-ghost btn-sm w-full justify-start">
                <LogOut size={16} /> Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setDrawerOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="hidden text-sm font-medium text-ink-400 lg:block">{roleLabel}</span>
          <div className="flex items-center gap-3">
            <NavLink to="notifications" className="relative rounded-full p-2 text-ink-500 hover:bg-ink-50">
              <Bell size={18} />
            </NavLink>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-paper">
                {(profile?.full_name || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-ink-800 sm:block">
                {profile?.full_name || "Pengguna"}
              </span>
              <ChevronDown size={14} className="hidden text-ink-400 sm:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 lg:p-6 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav (first 4 items) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-ink-100 bg-white lg:hidden">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? "text-ink-900" : "text-ink-400"
                }`
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
