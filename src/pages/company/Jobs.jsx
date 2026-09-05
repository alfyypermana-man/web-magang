import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getCompanyByUserId } from "../../services/companiesService";
import { listCompanyJobs, deleteJob, updateJob } from "../../services/jobsService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge from "../../components/Badge";
import { ConfirmDialog } from "../../components/Modal";

const STATUS_FILTERS = ["all", "draft", "active", "closed"];

export default function CompanyJobs() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: c } = await getCompanyByUserId(user.id);
      setCompany(c);
      if (c) {
        const { data } = await listCompanyJobs(c.id);
        setJobs(data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function handlePublish(job) {
    if (company.status !== "verified") {
      showToast("Perusahaan Anda harus terverifikasi sebelum mempublikasikan lowongan.", "error");
      return;
    }
    const { data, error } = await updateJob(job.id, { status: "active" });
    if (error) { showToast("Gagal mempublikasikan lowongan.", "error"); return; }
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: data.status } : j)));
    showToast("Lowongan dipublikasikan.", "success");
  }

  async function handleClose(job) {
    const { data, error } = await updateJob(job.id, { status: "closed" });
    if (error) { showToast("Gagal menutup lowongan.", "error"); return; }
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: data.status } : j)));
  }

  async function handleDelete() {
    const { error } = await deleteJob(deleteTarget.id);
    if (error) { showToast("Gagal menghapus lowongan.", "error"); return; }
    setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast("Lowongan dihapus.", "success");
  }

  if (loading) return <PageLoading label="Memuat lowongan..." />;

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-950">Lowongan Saya</h1>
          <p className="mt-1 text-sm text-ink-500">Kelola seluruh lowongan yang telah Anda buat.</p>
        </div>
        <Link to="/company/jobs/create" className="btn-primary"><Plus size={15} /> Buat Lowongan</Link>
      </div>

      {company?.status !== "verified" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldAlert size={16} className="shrink-0" /> Publikasi lowongan memerlukan akun terverifikasi.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${filter === s ? "bg-ink-900 text-paper" : "bg-ink-50 text-ink-600 hover:bg-ink-100"}`}>
            {s === "all" ? "Semua" : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Briefcase} title="Belum ada lowongan" description="Buat lowongan pertama Anda." action={<Link to="/company/jobs/create" className="btn-primary btn-sm">Buat Lowongan</Link>} /></div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((job) => (
            <div key={job.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Link to={`/company/jobs/${job.id}`} className="text-sm font-semibold text-ink-900 hover:underline">{job.title}</Link>
                <p className="text-xs text-ink-500">{job.location} · {job.work_type} · {job.duration}</p>
              </div>
              <Badge variant={job.status === "active" ? "success" : job.status === "draft" ? "outline" : "default"}>{job.status}</Badge>
              <Link to={`/company/jobs/${job.id}`} className="btn-outline btn-sm"><Users size={13} /> {job.applications?.[0]?.count || 0} Pelamar</Link>
              <div className="flex gap-1.5">
                <Link to={`/company/jobs/${job.id}/edit`} className="btn-ghost btn-sm"><Pencil size={13} /></Link>
                {job.status === "draft" && <button onClick={() => handlePublish(job)} className="btn-accent btn-sm">Publish</button>}
                {job.status === "active" && <button onClick={() => handleClose(job)} className="btn-outline btn-sm">Tutup</button>}
                <button onClick={() => setDeleteTarget(job)} className="btn-ghost btn-sm text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Lowongan"
        description={`Yakin ingin menghapus "${deleteTarget?.title}"? Semua lamaran terkait juga akan terhapus.`}
        danger
      />
    </div>
  );
}
