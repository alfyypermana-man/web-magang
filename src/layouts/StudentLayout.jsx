import React from "react";
import {
  LayoutDashboard, Search, Bookmark, FileText, CalendarClock,
  MessageSquare, Bell, User, BriefcaseBusiness, FileBadge, Settings,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/jobs", label: "Cari Kerja", icon: Search },
  { to: "/student/applications", label: "Lamaran", icon: FileText },
  { to: "/student/saved-jobs", label: "Tersimpan", icon: Bookmark },
  { to: "/student/interviews", label: "Interview", icon: CalendarClock },
  { to: "/student/messages", label: "Pesan", icon: MessageSquare },
  { to: "/student/notifications", label: "Notifikasi", icon: Bell },
  { to: "/student/profile", label: "Profil Saya", icon: User },
  { to: "/student/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { to: "/student/cv", label: "CV Saya", icon: FileBadge },
  { to: "/student/settings", label: "Pengaturan", icon: Settings },
];

export default function StudentLayout() {
  return <DashboardLayout navItems={navItems} roleLabel="Dashboard Pelamar" />;
}
