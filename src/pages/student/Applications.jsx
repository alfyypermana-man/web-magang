import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Building2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getStudentByUserId } from "../../services/studentsService";
import { listStudentApplications } from "../../services/applicationsService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";

const STATUSES = ["all", "applied", "under_review", "shortlisted", "interview", "accepted", "rejected"];
const STATUS_LABEL = {
  all: "Semua", applied: "Applied", under_review: "Under Review", shortlisted: "Shortlisted",
  interview: "Interview", accepted: "Accepted", rejected: "Rejected",
};

export default function StudentApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: student } = await getStudentByUserId(user.id);
      if (!student) { setLoading(false); return; }
      const { data } = await listStudentApplications(student.id);
      if (mounted) {
        setApplications(data);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <PageLoading label="Memuat lamaran..." />;

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Lamaran Saya</h1>
      <p className="mt-1 text-sm text-ink-500">Pantau status seluruh lamaran yang telah Anda kirim.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? "bg-ink-900 text-paper" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={FileText} title="Belum ada lamaran" description="Lamar lowongan untuk mulai melacak statusnya di sini." action={<Link to="/student/jobs" className="btn-primary btn-sm">Cari Lowongan</Link>} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="card flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50 text-ink-400">
                {a.job?.company?.logo_url ? <img src={a.job.company.logo_url} className="h-full w-full object-cover" alt="" /> : <Building2 size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/jobs/${a.job?.id}`} className="text-sm font-semibold text-ink-900 hover:underline">{a.job?.title}</Link>
                <p className="text-xs text-ink-500">{a.job?.company?.company_name} · Dilamar {new Date(a.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
