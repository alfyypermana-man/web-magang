import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Briefcase, X } from "lucide-react";
import { listJobs, listCategories } from "../../services/jobsService";
import { CardSkeleton } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { SelectField } from "../../components/FormFields";
import { JobCard } from "./Landing";

const PAGE_SIZE = 9;
const WORK_TYPES = ["Remote", "On-site", "Hybrid"];

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [location, setLocation] = useState("");
  const [workType, setWorkType] = useState("");
  const [category, setCategory] = useState(params.get("category") || "");
  const [major, setMajor] = useState("");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    listCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error, count } = await listJobs({
        search, location, workType, category, major, page, pageSize: PAGE_SIZE,
      });
      if (!mounted) return;
      if (error) setError(error);
      setJobs(data);
      setCount(count);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [search, location, workType, category, major, page, reloadKey]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setParams(search ? { q: search } : {});
  }

  function clearFilters() {
    setLocation("");
    setWorkType("");
    setCategory("");
    setMajor("");
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const hasActiveFilters = location || workType || category || major;

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-950">Cari Lowongan</h1>
        <p className="mt-1 text-sm text-ink-500">Temukan PKL & magang yang sesuai dengan jurusan dan minatmu.</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5">
          <Search size={16} className="shrink-0 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari posisi, perusahaan, atau skill..."
            className="w-full border-0 text-sm outline-none placeholder:text-ink-300"
          />
        </div>
        <button type="submit" className="btn-primary shrink-0">
          Cari
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="btn-outline shrink-0 lg:hidden"
        >
          <SlidersHorizontal size={16} />
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className={`space-y-4 ${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="card space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-800">Filter</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800">
                  <X size={12} /> Reset
                </button>
              )}
            </div>

            <SelectField label="Kategori" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>

            <SelectField label="Tipe Kerja" value={workType} onChange={(e) => { setWorkType(e.target.value); setPage(1); }}>
              <option value="">Semua tipe</option>
              {WORK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </SelectField>

            <div>
              <label className="label">Lokasi</label>
              <input
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                placeholder="Contoh: Jakarta"
                className="input"
              />
            </div>

            <div>
              <label className="label">Jurusan</label>
              <input
                value={major}
                onChange={(e) => { setMajor(e.target.value); setPage(1); }}
                placeholder="Contoh: RPL"
                className="input"
              />
            </div>
          </div>
        </aside>

        <div>
          {error ? (
            <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
          ) : loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="Tidak ada lowongan ditemukan" description="Coba ubah kata kunci pencarian atau filter yang digunakan." />
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-500">Menampilkan {jobs.length} dari {count} lowongan</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => <JobCard key={job.id} job={job} />)}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium ${
                        page === i + 1 ? "bg-ink-900 text-paper" : "text-ink-600 hover:bg-ink-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
