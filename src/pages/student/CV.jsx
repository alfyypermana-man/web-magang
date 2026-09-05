import React, { useEffect, useState } from "react";
import { Plus, Trash2, Download, FileText } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getStudentByUserId, listExperiences, listEducation, listCertificates } from "../../services/studentsService";
import { listResumes, upsertResume, deleteResume } from "../../services/portfolioService";
import { TextField, TextAreaField, SelectField } from "../../components/FormFields";
import { PageLoading, Spinner } from "../../components/Loading";
import { ConfirmDialog } from "../../components/Modal";
import EmptyState from "../../components/EmptyState";

const TEMPLATES = [
  { id: "minimal", name: "Minimal" },
  { id: "modern", name: "Modern" },
  { id: "classic", name: "Classic" },
];

export default function StudentCV() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: st } = await getStudentByUserId(user.id);
      setStudent(st);
      if (st) {
        const [{ data: r }, { data: exp }, { data: edu }, { data: certs }] = await Promise.all([
          listResumes(st.id), listExperiences(st.id), listEducation(st.id), listCertificates(st.id),
        ]);
        setResumes(r);
        if (r[0]) {
          selectResume(r[0]);
        } else {
          setForm(buildDefaultForm(st, exp, edu, certs));
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  function selectResume(resume) {
    setActiveId(resume.id);
    setForm({ title: resume.title, template: resume.template, content: resume.content });
  }

  function handleNew() {
    setActiveId(null);
    setForm(buildDefaultForm(student, [], [], []));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await upsertResume({ id: activeId || undefined, student_id: student.id, ...form });
    setSaving(false);
    if (error) { showToast("Gagal menyimpan CV.", "error"); return; }
    setResumes((prev) => {
      const exists = prev.some((r) => r.id === data.id);
      return exists ? prev.map((r) => (r.id === data.id ? data : r)) : [data, ...prev];
    });
    setActiveId(data.id);
    showToast("CV berhasil disimpan.", "success");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await deleteResume(deleteTarget.id);
    if (error) { showToast("Gagal menghapus CV.", "error"); return; }
    setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    if (activeId === deleteTarget.id) handleNew();
    setDeleteTarget(null);
  }

  function updateContent(field, value) {
    setForm((f) => ({ ...f, content: { ...f.content, [field]: value } }));
  }

  if (loading || !form) return <PageLoading label="Memuat CV..." />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-950">CV Saya</h1>
          <p className="mt-1 text-sm text-ink-500">Buat dan kelola CV untuk melamar pekerjaan.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleNew} className="btn-outline btn-sm"><Plus size={14} /> CV Baru</button>
          <button onClick={() => window.print()} className="btn-primary btn-sm"><Download size={14} /> Download PDF</button>
        </div>
      </div>

      {resumes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          {resumes.map((r) => (
            <button
              key={r.id}
              onClick={() => selectResume(r)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${activeId === r.id ? "bg-ink-900 text-paper" : "bg-ink-50 text-ink-600 hover:bg-ink-100"}`}
            >
              {r.title || "CV"}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleSave} className="card space-y-4 p-6 print:hidden">
          <TextField label="Nama CV" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: CV Frontend Developer" />
          <SelectField label="Template" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}>
            {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </SelectField>

          <TextField label="Nama" value={form.content.name} onChange={(e) => updateContent("name", e.target.value)} />
          <TextField label="Kontak (email / telepon)" value={form.content.contact} onChange={(e) => updateContent("contact", e.target.value)} />
          <TextAreaField label="Ringkasan / Summary" value={form.content.summary} onChange={(e) => updateContent("summary", e.target.value)} rows={3} />
          <TextAreaField label="Pendidikan" value={form.content.education} onChange={(e) => updateContent("education", e.target.value)} rows={3} />
          <TextAreaField label="Pengalaman" value={form.content.experience} onChange={(e) => updateContent("experience", e.target.value)} rows={3} />
          <TextField label="Skills" value={form.content.skills} onChange={(e) => updateContent("skills", e.target.value)} placeholder="React, JavaScript, SQL" />
          <TextAreaField label="Sertifikat" value={form.content.certificates} onChange={(e) => updateContent("certificates", e.target.value)} rows={2} />

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size={16} /> : "Simpan CV"}</button>
            {activeId && (
              <button type="button" onClick={() => setDeleteTarget({ id: activeId })} className="btn-ghost text-red-600"><Trash2 size={15} /> Hapus</button>
            )}
          </div>
        </form>

        <div className="card p-8 print:border-0 print:p-0 print:shadow-none">
          <CVPreview content={form.content} template={form.template} />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus CV"
        description="Yakin ingin menghapus CV ini? Tindakan ini tidak dapat dibatalkan."
        danger
      />
    </div>
  );
}

function CVPreview({ content, template }) {
  const accent = template === "modern" ? "text-teal-600 border-teal-200" : template === "classic" ? "text-ink-900 border-ink-300" : "text-amber-600 border-amber-200";
  return (
    <div className="text-sm">
      <h2 className={`font-display text-lg font-bold ${accent.split(" ")[0]}`}>{content.name || "Nama Anda"}</h2>
      <p className="text-xs text-ink-500">{content.contact}</p>

      {content.summary && <CVSection title="Ringkasan" accent={accent}>{content.summary}</CVSection>}
      {content.education && <CVSection title="Pendidikan" accent={accent}>{content.education}</CVSection>}
      {content.experience && <CVSection title="Pengalaman" accent={accent}>{content.experience}</CVSection>}
      {content.skills && <CVSection title="Skills" accent={accent}>{content.skills}</CVSection>}
      {content.certificates && <CVSection title="Sertifikat" accent={accent}>{content.certificates}</CVSection>}
    </div>
  );
}

function CVSection({ title, accent, children }) {
  return (
    <div className={`mt-4 border-t pt-3 ${accent.split(" ")[1]}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</h3>
      <p className="mt-1 whitespace-pre-line text-ink-700">{children}</p>
    </div>
  );
}

function buildDefaultForm(student, experiences = [], education = [], certificates = []) {
  return {
    title: "CV Saya",
    template: "minimal",
    content: {
      name: student?.profile?.full_name || "",
      contact: [student?.whatsapp, student?.profile?.email].filter(Boolean).join(" | "),
      summary: "",
      education: education.map((e) => `${e.institution} - ${e.degree || ""}`).join("\n") || (student?.school_name ? `${student.school_name} - ${student.major}` : ""),
      experience: experiences.map((e) => `${e.title} di ${e.organization}`).join("\n"),
      skills: "",
      certificates: certificates.map((c) => c.name).join(", "),
    },
  };
}
