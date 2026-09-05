import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getStudentByUserId } from "../../services/studentsService";
import { listSavedJobs, toggleSaveJob } from "../../services/jobsService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { JobCard } from "../public/Landing";

export default function StudentSavedJobs() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [studentId, setStudentId] = useState(null);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: student } = await getStudentByUserId(user.id);
      if (!student) { setLoading(false); return; }
      setStudentId(student.id);
      const { data } = await listSavedJobs(student.id);
      if (mounted) {
        setSaved(data);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  async function handleRemove(jobId) {
    const { error } = await toggleSaveJob(studentId, jobId, true);
    if (error) {
      showToast("Gagal menghapus lowongan tersimpan.", "error");
      return;
    }
    setSaved((prev) => prev.filter((s) => s.job.id !== jobId));
  }

  if (loading) return <PageLoading label="Memuat lowongan tersimpan..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Lowongan Tersimpan</h1>
      <p className="mt-1 text-sm text-ink-500">Lowongan yang telah Anda simpan untuk dilihat kembali.</p>

      {saved.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Bookmark} title="Belum ada lowongan tersimpan" description="Simpan lowongan menarik agar mudah ditemukan nanti." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => (
            <div key={s.id} className="relative">
              <JobCard job={s.job} />
              <button
                onClick={() => handleRemove(s.job.id)}
                className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-red-600 shadow-card hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
