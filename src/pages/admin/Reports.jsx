import React, { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { listReports, updateReportStatus } from "../../services/reportsService";
import { useToast } from "../../contexts/ToastContext";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";
import { SelectField } from "../../components/FormFields";

const FILTERS = ["all", "pending", "reviewing", "resolved", "rejected"];

export default function AdminReports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listReports({ status: filter === "all" ? undefined : filter }).then(({ data }) => {
      if (mounted) {
        setReports(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [filter]);

  async function handleStatusChange(report, status) {
    const { error } = await updateReportStatus(report.id, status);
    if (error) { showToast("Gagal memperbarui status laporan.", "error"); return; }
    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status } : r)));
    showToast("Status laporan diperbarui.", "success");
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Laporan</h1>
      <p className="mt-1 text-sm text-ink-500">Tinjau laporan dari siswa maupun perusahaan.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${filter === f ? "bg-ink-900 text-paper" : "bg-ink-50 text-ink-600 hover:bg-ink-100"}`}>
            {f === "all" ? "Semua" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoading label="Memuat laporan..." />
      ) : reports.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Flag} title="Tidak ada laporan" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{r.reason} <span className="font-normal text-ink-400">· {r.target_type}</span></p>
                  <p className="text-xs text-ink-500">Dilaporkan oleh {r.reporter?.full_name} ({r.reporter?.role}) · {new Date(r.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
              </div>
              {r.description && <p className="mt-2 text-sm text-ink-600">{r.description}</p>}
              <SelectField value={r.status} onChange={(e) => handleStatusChange(r, e.target.value)} className="!mb-0 mt-3 w-40">
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </SelectField>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
