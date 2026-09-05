import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Star, CalendarClock, CheckCircle2, Plus, ShieldAlert } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyByUserId } from "../../services/companiesService";
import { supabase } from "../../lib/supabaseClient";
import { PageLoading } from "../../components/Loading";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";

export default function CompanyDashboard() {
  const { user, profile } = useAuth();
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: c } = await getCompanyByUserId(user.id);
      if (!mounted) return;
      setCompany(c);
      if (!c) { setLoading(false); return; }

      const [jobsCount, activeCount, applicantsCount, shortlistedCount, interviewCount, acceptedCount, jobsList] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", c.id),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", c.id).eq("status", "active"),
        supabase.from("applications").select("id, job:jobs!inner(company_id)", { count: "exact", head: true }).eq("job.company_id", c.id),
        supabase.from("applications").select("id, job:jobs!inner(company_id)", { count: "exact", head: true }).eq("job.company_id", c.id).eq("status", "shortlisted"),
        supabase.from("interviews").select("id, application:applications!inner(job:jobs!inner(company_id))", { count: "exact", head: true }).eq("application.job.company_id", c.id),
        supabase.from("applications").select("id, job:jobs!inner(company_id)", { count: "exact", head: true }).eq("job.company_id", c.id).eq("status", "accepted"),
        supabase.from("jobs").select("*").eq("company_id", c.id).order("created_at", { ascending: false }).limit(5),
      ]);

      if (!mounted) return;
      setStats({
        activeJobs: activeCount.count || 0,
        totalApplicants: applicantsCount.count || 0,
        shortlisted: shortlistedCount.count || 0,
        interviews: interviewCount.count || 0,
        accepted: acceptedCount.count || 0,
      });
      setRecentJobs(jobsList.data || []);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <PageLoading label="Memuat dashboard..." />;

  if (!company) {
    return <EmptyState title="Profil perusahaan tidak ditemukan" description="Silakan hubungi admin untuk bantuan." />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-950">Halo, {company.company_name} 👋</h1>
          <p className="mt-1 text-sm text-ink-500">Kelola lowongan dan pelamar Anda dari sini.</p>
        </div>
        <Link to="/company/jobs/create" className="btn-primary"><Plus size={15} /> Buat Lowongan</Link>
      </div>

      {company.status !== "verified" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldAlert size={16} className="shrink-0" />
          {company.status === "pending"
            ? "Akun perusahaan Anda sedang menunggu verifikasi Admin sebelum dapat mempublikasikan lowongan."
            : company.status === "rejected"
            ? "Verifikasi akun perusahaan Anda ditolak. Silakan lengkapi profil dan hubungi Admin."
            : "Akun perusahaan Anda sedang ditangguhkan."}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Briefcase} label="Active Jobs" value={stats.activeJobs} color="bg-ink-100 text-ink-700" />
        <StatCard icon={Users} label="Total Applicants" value={stats.totalApplicants} color="bg-amber-100 text-amber-700" />
        <StatCard icon={Star} label="Shortlisted" value={stats.shortlisted} color="bg-purple-100 text-purple-700" />
        <StatCard icon={CalendarClock} label="Interviews" value={stats.interviews} color="bg-blue-100 text-blue-700" />
        <StatCard icon={CheckCircle2} label="Accepted" value={stats.accepted} color="bg-teal-100 text-teal-700" />
      </div>

      <div className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink-900">Lowongan Terbaru</h2>
          <Link to="/company/jobs" className="text-xs font-medium text-ink-500 hover:underline">Lihat semua</Link>
        </div>
        {recentJobs.length === 0 ? (
          <EmptyState title="Belum ada lowongan" description="Buat lowongan pertama Anda untuk mulai menerima pelamar." action={<Link to="/company/jobs/create" className="btn-primary btn-sm">Buat Lowongan</Link>} />
        ) : (
          <div className="mt-3 divide-y divide-ink-100">
            {recentJobs.map((j) => (
              <Link key={j.id} to={`/company/jobs/${j.id}`} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">{j.title}</p>
                  <p className="text-xs text-ink-400">{j.location} · {j.work_type}</p>
                </div>
                <Badge variant={j.status === "active" ? "success" : j.status === "draft" ? "outline" : "default"}>{j.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        <Icon size={16} />
      </div>
      <p className="font-display text-xl font-bold text-ink-950">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}
