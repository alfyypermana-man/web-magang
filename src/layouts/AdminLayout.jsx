import React from "react";
import {
  LayoutDashboard, GraduationCap, Building2, Briefcase,
  FileText, Flag, ScrollText, Settings,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Siswa", icon: GraduationCap },
  { to: "/admin/companies", label: "Perusahaan", icon: Building2 },
  { to: "/admin/jobs", label: "Lowongan", icon: Briefcase },
  { to: "/admin/applications", label: "Lamaran", icon: FileText },
  { to: "/admin/reports", label: "Laporan", icon: Flag },
  { to: "/admin/activity-logs", label: "Log Aktivitas", icon: ScrollText },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default function AdminLayout() {
  return <DashboardLayout navItems={navItems} roleLabel="Dashboard Admin" />;
}
