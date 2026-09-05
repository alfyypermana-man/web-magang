import React from "react";
import {
  LayoutDashboard, Briefcase, PlusCircle, Users,
  CalendarClock, MessageSquare, Bell, Building2, Settings,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/company/jobs", label: "Lowongan Saya", icon: Briefcase },
  { to: "/company/jobs/create", label: "Buat Lowongan", icon: PlusCircle },
  { to: "/company/applicants", label: "Pelamar", icon: Users },
  { to: "/company/interviews", label: "Interview", icon: CalendarClock },
  { to: "/company/messages", label: "Pesan", icon: MessageSquare },
  { to: "/company/notifications", label: "Notifikasi", icon: Bell },
  { to: "/company/profile", label: "Profil Perusahaan", icon: Building2 },
  { to: "/company/settings", label: "Pengaturan", icon: Settings },
];

export default function CompanyLayout() {
  return <DashboardLayout navItems={navItems} roleLabel="Dashboard Perusahaan" />;
}
