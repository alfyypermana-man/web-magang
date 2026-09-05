import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Building2, Briefcase, FileText, CheckCircle2, ShieldAlert, Flag } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { getPlatformStats, listActivityLogs } from "../../services/adminService";
import { supabase } from "../../lib/supabaseClient";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [s, logs, students, companies] = await Promise.all([
        getPlatformStats(),
        listActivityLogs({ limit: 8 }),
        supabase.from("students").select("created_at"),
        supabase.from("companies").select("created_at"),
      ]);
      if (!mounted) return;
      setStats(s);
      setRecentLogs(logs.data);
      setGrowthData(buildGrowthChart(students.data || [], companies.data || []));
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <PageLoading label="Memuat dashboard admin..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Ringkasan aktivitas platform MagangKu.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="bg-ink-100 text-ink-700" />
        <StatCard icon={Building2} label="Total Companies" value={stats.totalCompanies} color="bg-teal-100 text-teal-700" />
        <StatCard icon={Briefcase} label="Total Jobs" value={stats.totalJobs} color="bg-amber-100 text-amber-700" />
        <StatCard icon={FileText} label="Total Applications" value={stats.totalApplications} color="bg-purple-100 text-purple-700" />
        <StatCard icon={CheckCircle2} label="Active Jobs" value={stats.activeJobs} color="bg-blue-100 text-blue-700" />
        <StatCard icon={CheckCircle2} label="Accepted Applications" value={stats.acceptedApplications} color="bg-green-100 text-green-700" />
        <StatCard icon={ShieldAlert} label="Pending Verification" value={stats.pendingCompanies} color="bg-red-100 text-red-700" link="/admin/companies" />
        <StatCard icon={Flag} label="Reports" value="—" color="bg-orange-100 text-orange-700" link="/admin/reports" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink-900">Pertumbuhan Pengguna (6 Bulan Terakhir)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e8f2" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#dc8a1f" strokeWidth={2} name="Students" />
                <Line type="monotone" dataKey="companies" stroke="#2f9e85" strokeWidth={2} name="Companies" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-sm font-semibold text-ink-900">Recent Activities</h2>
          {recentLogs.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" />
          ) : (
            <ul className="mt-3 space-y-3">
              {recentLogs.map((log) => (
                <li key={log.id} className="text-xs">
                  <p className="font-medium text-ink-700">{log.action}</p>
                  <p className="text-ink-400">{log.user?.full_name || "System"} · {new Date(log.created_at).toLocaleString("id-ID")}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/activity-logs" className="mt-3 inline-block text-xs font-medium text-ink-600 hover:underline">Lihat semua log →</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <div className="card p-4">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        <Icon size={16} />
      </div>
      <p className="font-display text-xl font-bold text-ink-950">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

function buildGrowthChart(students, companies) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const now = new Date();
  const buckets = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: months[d.getMonth()], students: 0, companies: 0 };
  });
  function fill(rows, field) {
    rows.forEach((r) => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket[field] += 1;
    });
  }
  fill(students, "students");
  fill(companies, "companies");
  return buckets;
}
