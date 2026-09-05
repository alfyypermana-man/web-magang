import React, { useEffect, useState } from "react";
import { CalendarClock, MapPin, Video } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getStudentByUserId } from "../../services/studentsService";
import { listStudentInterviews } from "../../services/interviewsService";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";

export default function StudentInterviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: student } = await getStudentByUserId(user.id);
      if (!student) { setLoading(false); return; }
      const { data } = await listStudentInterviews(student.id);
      if (mounted) {
        setInterviews(data);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <PageLoading label="Memuat jadwal interview..." />;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-950">Jadwal Interview</h1>
      <p className="mt-1 text-sm text-ink-500">Daftar interview yang telah dijadwalkan oleh perusahaan.</p>

      {interviews.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={CalendarClock} title="Belum ada jadwal interview" description="Jadwal interview akan muncul di sini setelah perusahaan mengaturnya." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {interviews.map((iv) => (
            <div key={iv.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-sm font-semibold text-ink-900">{iv.application?.job?.title}</h3>
                  <p className="text-xs text-ink-500">{iv.application?.job?.company?.company_name}</p>
                </div>
                <Badge variant={statusVariant(iv.status)}>{iv.status}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-600">
                <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} className="text-ink-400" /> {new Date(iv.scheduled_at).toLocaleString("id-ID")}</span>
                {iv.type === "online" ? (
                  <span className="inline-flex items-center gap-1.5"><Video size={14} className="text-ink-400" /> Online</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-ink-400" /> Offline</span>
                )}
              </div>

              {iv.status === "scheduled" && <Countdown target={iv.scheduled_at} />}

              {iv.meeting_link && (
                <a href={iv.meeting_link} target="_blank" rel="noreferrer" className="btn-outline btn-sm mt-3 inline-flex">
                  Buka Link Meeting
                </a>
              )}
              {iv.location && <p className="mt-2 text-xs text-ink-500">Lokasi: {iv.location}</p>}
              {iv.notes && <p className="mt-2 text-xs text-ink-500">Catatan: {iv.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Countdown({ target }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return <p className="mt-2 text-xs font-medium text-teal-700">Interview sedang berlangsung / sudah lewat.</p>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return (
    <p className="mt-2 text-xs font-medium text-amber-700">
      Dimulai dalam {days > 0 ? `${days} hari ` : ""}{hours} jam {minutes} menit
    </p>
  );
}
