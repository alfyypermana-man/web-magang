import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Building2, CheckCircle2, Globe, MapPin, Phone } from "lucide-react";
import { getCompanyById } from "../../services/companiesService";
import { supabase } from "../../lib/supabaseClient";
import { PageLoading } from "../../components/Loading";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import { JobCard } from "./Landing";

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await getCompanyById(id);
      if (!mounted) return;
      setCompany(data);
      setError(error);

      const { data: jobData } = await supabase
        .from("jobs")
        .select("*, company:companies(id, company_name, logo_url, status), job_skills(skill:skills(id, name))")
        .eq("company_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (mounted) setJobs(jobData || []);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <PageLoading label="Memuat profil perusahaan..." />;
  if (error || !company) return <div className="container-app py-16"><ErrorState title="Perusahaan tidak ditemukan" /></div>;

  return (
    <div className="container-app py-10">
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-50 text-ink-400">
            {company.logo_url ? <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" /> : <Building2 size={26} />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-xl font-bold text-ink-950">{company.company_name}</h1>
              {company.status === "verified" && <CheckCircle2 size={16} className="text-teal-500" />}
            </div>
            <p className="text-sm text-ink-500">{company.industry}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-600">{company.description || "Perusahaan ini belum menambahkan deskripsi."}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-500">
          {company.address && <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {company.address}</span>}
          {company.phone && <span className="inline-flex items-center gap-1.5"><Phone size={14} /> {company.phone}</span>}
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
              <Globe size={14} /> {company.website}
            </a>
          )}
        </div>
      </div>

      <h2 className="mb-4 mt-8 font-display text-lg font-bold text-ink-950">Lowongan Aktif ({jobs.length})</h2>
      {jobs.length === 0 ? (
        <EmptyState title="Belum ada lowongan aktif" description="Perusahaan ini belum membuka lowongan baru." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
