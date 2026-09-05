import React, { useEffect, useState } from "react";
import { Search, Building2, CheckCircle2, XCircle, Ban } from "lucide-react";
import { listAllCompanies, verifyCompany, rejectCompany, suspendCompany } from "../../services/companiesService";
import { logActivity } from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";

const FILTERS = ["all", "pending", "verified", "rejected", "suspended"];

export default function AdminCompanies() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listAllCompanies({ search, status: filter === "all" ? undefined : filter }).then(({ data }) => {
      if (mounted) {
        setCompanies(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [search, filter]);

  async function handleAction(company, action) {
    const fn = { verify: verifyCompany, reject: rejectCompany, suspend: suspendCompany }[action];
    const { data, error } = await fn(company.id);
    if (error) { showToast("Gagal memproses aksi.", "error"); return; }
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: data.status } : c)));
    await logActivity({ userId: user.id, action: `${action} Company`, description: company.company_name });
    showToast("Status perusahaan diperbarui.", "success");
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Manajemen Perusahaan</h1>
      <p className="mt-1 text-sm text-ink-500">Verifikasi dan kelola akun perusahaan.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 sm:max-w-xs">
          <Search size={16} className="text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari perusahaan..." className="w-full border-0 text-sm outline-none placeholder:text-ink-300" />
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
        <PageLoading label="Memuat data perusahaan..." />
      ) : companies.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Building2} title="Tidak ada perusahaan" /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {companies.map((c) => (
            <div key={c.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50 text-ink-400">
                {c.logo_url ? <img src={c.logo_url} className="h-full w-full object-cover" alt="" /> : <Building2 size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{c.company_name}</p>
                <p className="text-xs text-ink-500">{c.industry} · {c.address}</p>
              </div>
              <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
              <div className="flex gap-1.5">
                {c.status === "pending" && (
                  <>
                    <button onClick={() => handleAction(c, "verify")} className="btn-accent btn-sm"><CheckCircle2 size={13} /> Approve</button>
                    <button onClick={() => handleAction(c, "reject")} className="btn-outline btn-sm"><XCircle size={13} /> Reject</button>
                  </>
                )}
                {c.status === "verified" && (
                  <button onClick={() => handleAction(c, "suspend")} className="btn-outline btn-sm text-red-600"><Ban size={13} /> Suspend</button>
                )}
                {(c.status === "rejected" || c.status === "suspended") && (
                  <button onClick={() => handleAction(c, "verify")} className="btn-accent btn-sm"><CheckCircle2 size={13} /> Verify</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
