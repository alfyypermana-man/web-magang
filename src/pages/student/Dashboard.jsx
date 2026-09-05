import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle2, XCircle, Bookmark, CalendarClock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { getStudentByUserId } from "../../services/studentsService";
import { listStudentApplications } from "../../services/applicationsService";
import { listSavedJobs } from "../../services/jobsService";
import { listStudentInterviews } from "../../services/interviewsService";
import { PageLoading } from "../../components/Loading";
import Badge, { statusVariant } from "../../components/Badge";
import EmptyState from "../../components/EmptyState";

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data: student } = await getStudentByUserId(user.id);
      if (!student) { setLoading(false); return; }

      const [appsRes, savedRes, interviewsRes] = await Promise.all([
        listStudentApplications(student.id),
        listSavedJobs(student.id),
        listStudentInterviews(student.id),
      ]);
      if (!mounted) return;
      setApplications(appsRes.data);
      setSavedCount(savedRes.data.length);
      setInterviews(interviewsRes.data.filter((i) => i.status === "scheduled").slice(0, 3));
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <PageLoading label="Memuat dashboard..." />;

  const total = applications.length;
  const underReview = applications.filter((a) => ["applied", "under_review", "shortlisted", "interview"].includes(a.status)).length;
  const accepted = applications.filter((a) => a.status === "accepted").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const chartData = buildMonthlyChart(applications);

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Halo, {profile?.full_name?.split(" ")[0] || "Student"} 👋</h1>
      <p className="mt-1 text-sm text-ink-500">Berikut ringkasan aktivitas lamaranmu.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total Lamaran" value={total} color="bg-ink-100 text-ink-700" />
        <StatCard icon={Clock} label="Diproses" value={underReview} color="bg-amber-100 text-amber-700" />
        <StatCard icon={CheckCircle2} label="Diterima" value={accepted} color="bg-teal-100 text-teal-700" />
        <StatCard icon={XCircle} label="Ditolak" value={rejected} color="bg-red-100 text-red-700" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-ink-900">Aktivitas Lamaran</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e8f2" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#dc8a1f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-ink-900">Interview Terdekat</h2>
              <Link to="/student/interviews" className="text-xs font-medium text-ink-500 hover:underline">Lihat semua</Link>
            </div>
            {interviews.length === 0 ? (
              <p className="mt-3 text-xs text-ink-400">Belum ada interview terjadwal.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {interviews.map((iv) => (
                  <li key={iv.id} className="flex items-start gap-2 text-sm">
                    <CalendarClock size={15} className="mt-0.5 shrink-0 text-ink-400" />
                    <div>
                      <p className="font-medium text-ink-800">{iv.application?.job?.title}</p>
                      <p className="text-xs text-ink-400">{new Date(iv.scheduled_at).toLocaleString("id-ID")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-ink-900">Lowongan Tersimpan</h2>
              <Bookmark size={15} className="text-ink-400" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink-950">{savedCount}</p>
            <Link to="/student/saved-jobs" className="mt-1 inline-block text-xs font-medium text-ink-600 hover:underline">Lihat lowongan tersimpan →</Link>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink-900">Lamaran Terbaru</h2>
          <Link to="/student/applications" className="text-xs font-medium text-ink-500 hover:underline">Lihat semua</Link>
        </div>
        {applications.length === 0 ? (
          <EmptyState title="Belum ada lamaran" description="Mulai lamar lowongan untuk melihat aktivitasmu di sini." action={<Link to="/student/jobs" className="btn-primary btn-sm">Cari Lowongan</Link>} />
        ) : (
          <div className="mt-3 divide-y divide-ink-100">
            {applications.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">{a.job?.title}</p>
                  <p className="text-xs text-ink-400">{a.job?.company?.company_name}</p>
                </div>
                <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
              </div>
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

function buildMonthlyChart(applications) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const now = new Date();
  const buckets = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: months[d.getMonth()], count: 0 };
  });
  applications.forEach((a) => {
    const d = new Date(a.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.count += 1;
  });
  return buckets;
}
