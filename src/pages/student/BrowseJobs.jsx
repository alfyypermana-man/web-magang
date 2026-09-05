import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, MapPin, Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import { listJobs, toggleSaveJob, listSavedJobs } from "../../services/jobsService";
import { getStudentByUserId } from "../../services/studentsService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { CardSkeleton, PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge from "../../components/Badge";

export default function StudentBrowseJobs() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    getStudentByUserId(user.id).then(({ data }) => {
      setStudent(data);
      setInitializing(false);
    });
  }, [user]);

  useEffect(() => {
    if (!student) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      const [jobsRes, savedRes] = await Promise.all([
        listJobs({ search }),
        listSavedJobs(student.id),
      ]);
      if (!mounted) return;
      setJobs(jobsRes.data);
      setSavedIds(new Set(savedRes.data.map((s) => s.job.id)));
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [student, search]);

  async function handleToggleSave(jobId) {
    const isSaved = savedIds.has(jobId);
    const { error } = await toggleSaveJob(student.id, jobId, isSaved);
    if (error) {
      showToast("Gagal memperbarui lowongan tersimpan.", "error");
      return;
    }
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  }

  const recommended = jobs.filter((j) => matchesStudent(j, student)).slice(0, 3);

  if (initializing) return <PageLoading label="Memuat..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Cari Lowongan</h1>
      <p className="mt-1 text-sm text-ink-500">Temukan PKL & magang yang sesuai dengan profilmu.</p>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 sm:max-w-md">
        <Search size={16} className="text-ink-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari posisi..." className="w-full border-0 text-sm outline-none placeholder:text-ink-300" />
      </div>

      {recommended.length > 0 && (
        <div className="mt-6">
          <h2 className="flex items-center gap-1.5 font-display text-sm font-semibold text-ink-900">
            <Sparkles size={14} className="text-amber-500" /> Recommended Jobs For You
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {recommended.map((job) => (
              <JobRow key={job.id} job={job} saved={savedIds.has(job.id)} onToggleSave={handleToggleSave} />
            ))}
          </div>
        </div>
      )}

      <h2 className="mt-6 font-display text-sm font-semibold text-ink-900">Semua Lowongan</h2>
      <div className="mt-3 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="Tidak ada lowongan ditemukan" description="Coba kata kunci lain." />
        ) : (
          jobs.map((job) => <JobRow key={job.id} job={job} saved={savedIds.has(job.id)} onToggleSave={handleToggleSave} />)
        )}
      </div>
    </div>
  );
}

function JobRow({ job, saved, onToggleSave }) {
  const company = job.company || {};
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50 text-ink-400">
        {company.logo_url ? <img src={company.logo_url} className="h-full w-full object-cover" alt="" /> : <Briefcase size={18} />}
      </div>
      <Link to={`/jobs/${job.id}`} className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-ink-900">{job.title}</h3>
        <p className="truncate text-xs text-ink-500">{company.company_name}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {job.location && <Badge variant="outline"><MapPin size={10} /> {job.location}</Badge>}
          {job.work_type && <Badge variant="outline">{job.work_type}</Badge>}
        </div>
      </Link>
      <button onClick={() => onToggleSave(job.id)} className="shrink-0 rounded-full p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700">
        {saved ? <BookmarkCheck size={18} className="text-amber-500" /> : <Bookmark size={18} />}
      </button>
    </div>
  );
}

function matchesStudent(job, student) {
  if (!student) return false;
  const major = (student.major || "").toLowerCase();
  const jobMajor = (job.major || "").toLowerCase();
  return major && jobMajor && jobMajor.includes(major.split(" ")[0]);
}
