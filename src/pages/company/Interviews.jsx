import React, { useEffect, useState } from "react";
import { CalendarClock, MapPin, Video } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getCompanyByUserId } from "../../services/companiesService";
import { listCompanyInterviews, updateInterview } from "../../services/interviewsService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";
import { SelectField } from "../../components/FormFields";

export default function CompanyInterviews() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: c } = await getCompanyByUserId(user.id);
      if (!c) { setLoading(false); return; }
      const { data } = await listCompanyInterviews(c.id);
      setInterviews(data);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleStatusChange(id, status) {
    const { error } = await updateInterview(id, { status });
    if (error) { showToast("Gagal memperbarui status interview.", "error"); return; }
    setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  if (loading) return <PageLoading label="Memuat jadwal interview..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Jadwal Interview</h1>
      <p className="mt-1 text-sm text-ink-500">Kelola jadwal interview dengan kandidat Anda.</p>

      {interviews.length === 0 ? (
        <div className="mt-6"><EmptyState icon={CalendarClock} title="Belum ada jadwal interview" description="Jadwalkan interview dari halaman pelamar." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {interviews.map((iv) => (
            <div key={iv.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold text-ink-900">{iv.application?.student?.profile?.full_name}</p>
                <p className="text-xs text-ink-500">{iv.application?.job?.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1"><CalendarClock size={12} /> {new Date(iv.scheduled_at).toLocaleString("id-ID")}</span>
                  {iv.type === "online" ? <span className="inline-flex items-center gap-1"><Video size={12} /> Online</span> : <span className="inline-flex items-center gap-1"><MapPin size={12} /> Offline</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(iv.status)}>{iv.status}</Badge>
                <SelectField value={iv.status} onChange={(e) => handleStatusChange(iv.id, e.target.value)} className="!mb-0 w-36">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </SelectField>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
