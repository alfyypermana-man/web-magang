import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapPin, Clock, Calendar, Building2, CheckCircle2, Briefcase, GraduationCap, Flag,
} from "lucide-react";
import { getJobById } from "../../services/jobsService";
import { applyToJob, hasApplied } from "../../services/applicationsService";
import { getStudentByUserId } from "../../services/studentsService";
import { listResumes } from "../../services/portfolioService";
import { createReport } from "../../services/reportsService";
import { PageLoading } from "../../components/Loading";
import ErrorState from "../../components/ErrorState";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { SelectField, TextAreaField, TextField } from "../../components/FormFields";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function JobDetail() {
  const { id } = useParams();
  const { user, role, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data, error } = await getJobById(id);
      if (!mounted) return;
      setJob(data);
      setError(error);
      setLoading(false);

      if (user && role === "student") {
        const { data: student } = await getStudentByUserId(user.id);
        if (student) {
          const { data: app } = await hasApplied(id, student.id);
          if (mounted) setApplied(Boolean(app));
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, user, role]);

  if (loading) return <PageLoading label="Memuat lowongan..." />;
  if (error || !job) return <div className="container-app py-16"><ErrorState title="Lowongan tidak ditemukan" description="Lowongan ini mungkin sudah ditutup atau dihapus." /></div>;

  const company = job.company || {};
  const skills = (job.job_skills || []).map((js) => js.skill?.name).filter(Boolean);

  function handleApplyClick() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (role !== "student") {
      showToast("Hanya akun Student yang dapat melamar lowongan.", "error");
      return;
    }
    setApplyOpen(true);
  }

  return (
    <div className="container-app py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-50 text-ink-400">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={24} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-xl font-bold text-ink-950">{job.title}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
                  <Link to={`/companies/${company.id}`} className="font-medium hover:underline">{company.company_name}</Link>
                  {company.status === "verified" && (
                    <Badge variant="success"><CheckCircle2 size={11} /> Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {job.location && <Badge variant="outline"><MapPin size={11} /> {job.location}</Badge>}
              {job.work_type && <Badge variant="outline"><Briefcase size={11} /> {job.work_type}</Badge>}
              {job.duration && <Badge variant="outline"><Clock size={11} /> {job.duration}</Badge>}
              {job.major && <Badge variant="outline"><GraduationCap size={11} /> {job.major}</Badge>}
              {job.deadline && <Badge variant="warning"><Calendar size={11} /> Deadline {new Date(job.deadline).toLocaleDateString("id-ID")}</Badge>}
            </div>
          </div>

          <Section title="Deskripsi Pekerjaan">{job.description}</Section>
          {job.responsibilities && <Section title="Tanggung Jawab">{job.responsibilities}</Section>}
          {job.requirements && <Section title="Persyaratan">{job.requirements}</Section>}
          {job.benefits && <Section title="Benefit">{job.benefits}</Section>}

          {skills.length > 0 && (
            <div className="card mt-4 p-6">
              <h2 className="font-display text-base font-semibold text-ink-900">Skill yang Dibutuhkan</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => <Badge key={s} variant="info">{s}</Badge>)}
              </div>
            </div>
          )}

          {role !== "company" && role !== "admin" && (
            <button onClick={() => setReportOpen(true)} className="mt-4 flex items-center gap-1.5 text-xs text-ink-400 hover:text-red-600">
              <Flag size={13} /> Laporkan lowongan ini
            </button>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card sticky top-20 p-5">
            <p className="text-xs text-ink-400">Posisi tersedia</p>
            <p className="font-display text-lg font-semibold text-ink-900">{job.positions_available || 1} orang</p>

            <div className="mt-4">
              {!user ? (
                <button onClick={handleApplyClick} className="btn-primary w-full">Login untuk Melamar</button>
              ) : applied ? (
                <button disabled className="btn-outline w-full">Lamaran Terkirim</button>
              ) : role === "student" ? (
                <button onClick={handleApplyClick} className="btn-accent w-full">Apply Now</button>
              ) : (
                <button disabled className="btn-outline w-full">Khusus Akun Student</button>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold text-ink-900">Tentang Perusahaan</h3>
            <p className="mt-2 text-sm text-ink-500">{company.description || "Belum ada deskripsi perusahaan."}</p>
            <div className="mt-3 space-y-1 text-xs text-ink-500">
              {company.industry && <p>Industri: {company.industry}</p>}
              {company.address && <p>Lokasi: {company.address}</p>}
            </div>
            <Link to={`/companies/${company.id}`} className="mt-3 inline-block text-xs font-semibold text-ink-800 hover:underline">
              Lihat profil perusahaan →
            </Link>
          </div>
        </aside>
      </div>

      {applyOpen && (
        <ApplyModal
          job={job}
          onClose={() => setApplyOpen(false)}
          onApplied={() => {
            setApplied(true);
            setApplyOpen(false);
            showToast("Lamaran berhasil dikirim!", "success");
          }}
        />
      )}

      {reportOpen && (
        <ReportModal
          onClose={() => setReportOpen(false)}
          onSubmit={async (reason, description) => {
            if (!user) {
              navigate("/login");
              return;
            }
            const { error } = await createReport({ reporterId: user.id, targetType: "job", targetId: job.id, reason, description });
            if (error) {
              showToast("Gagal mengirim laporan.", "error");
            } else {
              showToast("Laporan terkirim, tim kami akan meninjaunya.", "success");
              setReportOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card mt-4 p-6">
      <h2 className="font-display text-base font-semibold text-ink-900">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{children}</p>
    </div>
  );
}

function ApplyModal({ job, onClose, onApplied }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: student } = await getStudentByUserId(user.id);
      if (student) {
        setStudentId(student.id);
        setWhatsapp(student.whatsapp || "");
        const { data: r } = await listResumes(student.id);
        setResumes(r);
        if (r[0]) setResumeId(r[0].id);
      }
    }
    load();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId) return;
    setSubmitting(true);
    const { error } = await applyToJob({ jobId: job.id, studentId, resumeId: resumeId || null, coverLetter, whatsapp, note });
    setSubmitting(false);
    if (error) {
      showToast(error.message || "Gagal mengirim lamaran.", "error");
      return;
    }
    onApplied();
  }

  return (
    <Modal open onClose={onClose} title={`Lamar: ${job.title}`} size="md"
      footer={
        <>
          <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
          <button className="btn-accent btn-sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Lamaran"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectField label="Pilih CV" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
          <option value="">Tanpa CV</option>
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.title || "CV Saya"}</option>)}
        </SelectField>
        {resumes.length === 0 && (
          <p className="text-xs text-amber-700">
            Anda belum membuat CV. Lengkapi di <span className="font-medium">CV Saya</span> setelah melamar agar peluang diterima lebih besar.
          </p>
        )}
        <TextAreaField label="Cover Letter" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Ceritakan mengapa Anda cocok untuk posisi ini..." rows={4} />
        <TextField label="Nomor WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="08xxxxxxxxxx" />
        <TextAreaField label="Catatan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </form>
    </Modal>
  );
}

function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("Lowongan mencurigakan");
  const [description, setDescription] = useState("");
  return (
    <Modal open onClose={onClose} title="Laporkan Lowongan" size="sm"
      footer={
        <>
          <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
          <button className="btn-danger btn-sm" onClick={() => onSubmit(reason, description)}>Kirim Laporan</button>
        </>
      }
    >
      <div className="space-y-4">
        <SelectField label="Alasan" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option>Lowongan mencurigakan</option>
          <option>Perusahaan</option>
          <option>Konten tidak pantas</option>
        </SelectField>
        <TextAreaField label="Detail (opsional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
    </Modal>
  );
}
