import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, MessageSquare, CalendarPlus, GraduationCap, ExternalLink } from "lucide-react";
import { getJobById } from "../../services/jobsService";
import { listJobApplicants, updateApplicationStatus } from "../../services/applicationsService";
import { scheduleInterview } from "../../services/interviewsService";
import { createNotification } from "../../services/notificationsService";
import { sendMessage } from "../../services/messagesService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { PageLoading } from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import Badge, { statusVariant } from "../../components/Badge";
import Modal from "../../components/Modal";
import { TextField, TextAreaField, SelectField } from "../../components/FormFields";
import { getCompanyByUserId } from "../../services/companiesService";

const STATUS_OPTIONS = ["applied", "under_review", "shortlisted", "interview", "accepted", "rejected"];

export default function CompanyJobApplicants() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interviewTarget, setInterviewTarget] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    async function load() {
      const [{ data: j }, { data: apps }, { data: c }] = await Promise.all([
        getJobById(id), listJobApplicants(id), getCompanyByUserId(user.id),
      ]);
      setJob(j);
      setApplicants(apps);
      setCompanyId(c?.id);
      setLoading(false);
    }
    load();
  }, [id, user]);

  async function handleStatusChange(applicationId, status) {
    const { error } = await updateApplicationStatus(applicationId, status);
    if (error) { showToast("Gagal memperbarui status.", "error"); return; }
    setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status } : a)));

    const applicant = applicants.find((a) => a.id === applicationId);
    if (applicant?.student?.profile?.id) {
      const messages = {
        under_review: "Lamaran kamu sedang direview.",
        shortlisted: "Selamat! Kamu masuk dalam daftar shortlist.",
        interview: "Selamat! Kamu lolos tahap dan akan segera dijadwalkan interview.",
        accepted: "Selamat! Lamaran kamu diterima.",
        rejected: "Terima kasih atas partisipasimu, kali ini kami belum dapat melanjutkan lamaranmu.",
      };
      if (messages[status]) {
        await createNotification({ userId: applicant.student.profile.id, title: `Update Lamaran: ${job.title}`, body: messages[status], type: "application" });
      }
    }
    showToast("Status pelamar diperbarui.", "success");
  }

  if (loading) return <PageLoading label="Memuat pelamar..." />;
  if (!job) return <EmptyState title="Lowongan tidak ditemukan" />;

  return (
    <div>
      <div>
        <Link to="/company/jobs" className="text-xs font-medium text-ink-500 hover:underline">← Kembali ke Lowongan Saya</Link>
        <h1 className="mt-1 font-display text-xl font-bold text-ink-950">{job.title}</h1>
        <p className="mt-1 text-sm text-ink-500">{applicants.length} pelamar untuk posisi ini.</p>
      </div>

      {applicants.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada pelamar" description="Pelamar yang mengajukan lamaran akan muncul di sini." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {applicants.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100 text-sm font-bold text-ink-500">
                    {a.student?.profile?.avatar_url ? (
                      <img src={a.student.profile.avatar_url} className="h-full w-full object-cover" alt="" />
                    ) : (
                      (a.student?.profile?.full_name || "U").charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{a.student?.profile?.full_name}</p>
                    <p className="flex items-center gap-1 text-xs text-ink-500"><GraduationCap size={12} /> {a.student?.school_name} · {a.student?.major}</p>
                  </div>
                </div>
                <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
              </div>

              {a.cover_letter && <p className="mt-3 text-sm text-ink-600">{a.cover_letter}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {a.resume?.file_url && (
                  <a href={a.resume.file_url} target="_blank" rel="noreferrer" className="btn-outline btn-sm"><FileText size={13} /> Lihat CV</a>
                )}
                <Link to={`/portfolio/${a.student?.id}`} className="btn-outline btn-sm"><ExternalLink size={13} /> Portfolio</Link>
                <button onClick={() => setMessageTarget(a)} className="btn-outline btn-sm"><MessageSquare size={13} /> Pesan</button>
                <button onClick={() => setInterviewTarget(a)} className="btn-outline btn-sm"><CalendarPlus size={13} /> Jadwalkan Interview</button>

                <SelectField
                  value={a.status}
                  onChange={(e) => handleStatusChange(a.id, e.target.value)}
                  className="!mb-0 ml-auto w-40"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </SelectField>
              </div>
            </div>
          ))}
        </div>
      )}

      {interviewTarget && (
        <ScheduleInterviewModal
          application={interviewTarget}
          onClose={() => setInterviewTarget(null)}
          onScheduled={async () => {
            await handleStatusChange(interviewTarget.id, "interview");
            setInterviewTarget(null);
          }}
        />
      )}

      {messageTarget && companyId && (
        <QuickMessageModal
          application={messageTarget}
          companyId={companyId}
          senderId={user.id}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}

function ScheduleInterviewModal({ application, onClose, onScheduled }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ date: "", time: "", type: "online", location: "", meeting_link: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.time) { showToast("Tanggal dan waktu wajib diisi.", "error"); return; }
    setSaving(true);
    const scheduled_at = new Date(`${form.date}T${form.time}`).toISOString();
    const { error } = await scheduleInterview({
      application_id: application.id, scheduled_at, type: form.type,
      location: form.location || null, meeting_link: form.meeting_link || null, notes: form.notes || null,
      status: "scheduled",
    });
    setSaving(false);
    if (error) { showToast("Gagal menjadwalkan interview.", "error"); return; }
    if (application.student?.profile?.id) {
      await createNotification({
        userId: application.student.profile.id, title: "Interview Dijadwalkan",
        body: `Interview kamu dijadwalkan pada ${new Date(scheduled_at).toLocaleString("id-ID")}.`, type: "interview",
      });
    }
    showToast("Interview berhasil dijadwalkan.", "success");
    onScheduled();
  }

  return (
    <Modal open onClose={onClose} title={`Jadwalkan Interview: ${application.student?.profile?.full_name}`} size="sm"
      footer={<><button className="btn-outline btn-sm" onClick={onClose}>Batal</button><button className="btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>{saving ? "Menyimpan..." : "Jadwalkan"}</button></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Tanggal" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <TextField label="Waktu" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
        <SelectField label="Tipe" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </SelectField>
        {form.type === "online" ? (
          <TextField label="Link Meeting" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} placeholder="https://meet.google.com/..." />
        ) : (
          <TextField label="Lokasi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Alamat kantor" />
        )}
        <TextAreaField label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
      </form>
    </Modal>
  );
}

function QuickMessageModal({ application, companyId, senderId, onClose }) {
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const { error } = await sendMessage({ studentId: application.student.id, companyId, senderRole: "company", senderId, content: text.trim() });
    setSending(false);
    if (error) { showToast("Gagal mengirim pesan.", "error"); return; }
    showToast("Pesan terkirim.", "success");
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={`Kirim Pesan ke ${application.student?.profile?.full_name}`} size="sm"
      footer={<><button className="btn-outline btn-sm" onClick={onClose}>Batal</button><button className="btn-primary btn-sm" onClick={handleSend} disabled={sending}>{sending ? "Mengirim..." : "Kirim"}</button></>}
    >
      <TextAreaField label="Pesan" value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Tulis pesan Anda..." />
    </Modal>
  );
}
