import React, { useEffect, useState } from "react";
import { Search, Briefcase, Trash2 } from "lucide-react";
import { listAllJobsAdmin, updateJobStatusAdmin, deleteJobAdmin, logActivity } from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/Modal";
import Badge, { statusVariant } from "../../components/Badge";
import { SelectField } from "../../components/FormFields";

const FILTERS = ["all", "draft", "active", "closed"];

export default function AdminJobs() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listAllJobsAdmin({ search, status: filter === "all" ? undefined : filter }).then(({ data }) => {
      if (mounted) {
        setJobs(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [search, filter]);

  async function handleStatusChange(job, status) {
    const { error } = await updateJobStatusAdmin(job.id, status);
    if (error) { showToast("Gagal memperbarui status lowongan.", "error"); return; }
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status } : j)));
    await logActivity({ userId: user.id, action: "Update Job Status", description: `${job.title} → ${status}` });
  }

  async function handleDelete() {
    const { error } = await deleteJobAdmin(deleteTarget.id);
    if (error) { showToast("Gagal menghapus lowongan.", "error"); return; }
    setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
    await logActivity({ userId: user.id, action: "Delete Job", description: deleteTarget.title });
    setDeleteTarget(null);
    showToast("Lowongan dihapus.", "success");
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Moderasi Lowongan</h1>
      <p className="mt-1 text-sm text-ink-500">Kelola semua lowongan yang dipublikasikan perusahaan.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 sm:max-w-xs">
          <Search size={16} className="text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul lowongan..." className="w-full border-0 text-sm outline-none placeholder:text-ink-300" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${filter === f ? "bg-ink-900 text-paper" : "bg-ink-50 text-ink-600 hover:bg-ink-100"}`}>
              {f === "all" ? "Semua" : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoading label="Memuat lowongan..." />
      ) : jobs.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Briefcase} title="Tidak ada lowongan" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{j.title}</p>
                <p className="text-xs text-ink-500">{j.company?.company_name}{j.company?.status !== "verified" && <span className="ml-1 text-amber-600">(perusahaan belum verified)</span>}</p>
              </div>
              <Badge variant={statusVariant(j.status)}>{j.status}</Badge>
              <SelectField value={j.status} onChange={(e) => handleStatusChange(j, e.target.value)} className="!mb-0 w-32">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </SelectField>
              <button onClick={() => setDeleteTarget(j)} className="btn-ghost btn-sm text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Lowongan"
        description={`Yakin ingin menghapus "${deleteTarget?.title}"?`}
        danger
      />
    </div>
  );
}
