import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, CheckCircle2 } from "lucide-react";
import { listVerifiedCompanies } from "../../services/companiesService";
import { CardSkeleton } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listVerifiedCompanies({ search }).then(({ data }) => {
      if (mounted) {
        setCompanies(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [search]);

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-950">Direktori Perusahaan</h1>
        <p className="mt-1 text-sm text-ink-500">Perusahaan terverifikasi yang membuka lowongan PKL & magang.</p>
      </div>

      <div className="mb-6 flex max-w-md items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5">
        <Search size={16} className="text-ink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama perusahaan..."
          className="w-full border-0 text-sm outline-none placeholder:text-ink-300"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState icon={Building2} title="Belum ada perusahaan terverifikasi" description="Perusahaan yang sudah diverifikasi Admin akan tampil di sini." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.id} to={`/companies/${c.id}`} className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-50 text-ink-400">
                {c.logo_url ? <img src={c.logo_url} alt={c.company_name} className="h-full w-full object-cover" /> : <Building2 size={20} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="truncate font-display text-sm font-semibold text-ink-900">{c.company_name}</h3>
                  <CheckCircle2 size={13} className="shrink-0 text-teal-500" />
                </div>
                <p className="truncate text-xs text-ink-500">{c.industry || "—"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
