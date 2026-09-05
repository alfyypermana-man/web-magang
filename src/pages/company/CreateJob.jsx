import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getCompanyByUserId } from "../../services/companiesService";
import { createJob, updateJob, getJobById, listCategories, listSkillsForJobs, setJobSkills } from "../../services/jobsService";
import { TextField, TextAreaField, SelectField } from "../../components/FormFields";
import { PageLoading, Spinner } from "../../components/Loading";

const WORK_TYPES = ["Remote", "On-site", "Hybrid"];
const DURATIONS = ["1 Bulan", "2 Bulan", "3 Bulan", "6 Bulan", "1 Tahun"];

const initialForm = {
  title: "", description: "", responsibilities: "", requirements: "", benefits: "",
  category_id: "", major: "", location: "", work_type: "On-site", duration: "3 Bulan",
  start_date: "", end_date: "", deadline: "", positions_available: 1,
};

export default function CompanyCreateJob() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: cats }, { data: sk }] = await Promise.all([
        getCompanyByUserId(user.id), listCategories(), listSkillsForJobs(),
      ]);
      setCompany(c);
      setCategories(cats);
      setSkills(sk);

      if (isEdit) {
        const { data: job } = await getJobById(id);
        if (job) {
          setForm({
            title: job.title, description: job.description || "", responsibilities: job.responsibilities || "",
            requirements: job.requirements || "", benefits: job.benefits || "", category_id: job.category?.id || "",
            major: job.major || "", location: job.location || "", work_type: job.work_type || "On-site",
            duration: job.duration || "3 Bulan", start_date: job.start_date || "", end_date: job.end_date || "",
            deadline: job.deadline || "", positions_available: job.positions_available || 1,
          });
          setSelectedSkills((job.job_skills || []).map((js) => js.skill?.id).filter(Boolean));
        }
      }
      setLoading(false);
    }
    load();
  }, [user, id, isEdit]);

  function toggleSkill(skillId) {
    setSelectedSkills((prev) => (prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]));
  }

  async function handleSubmit(e, publish = false) {
    e.preventDefault();
    setSaving(true);

    const payload = { ...form, category_id: form.category_id || null };
    if (publish) payload.status = "active";

    let jobId = id;
    let error;
    if (isEdit) {
      const res = await updateJob(id, payload);
      error = res.error;
    } else {
      if (!payload.status) payload.status = "draft";
      const res = await createJob(company.id, payload);
      error = res.error;
      jobId = res.data?.id;
    }

    if (!error && jobId) {
      const skillRes = await setJobSkills(jobId, selectedSkills);
      error = skillRes.error;
    }

    setSaving(false);
    if (error) { showToast("Gagal menyimpan lowongan.", "error"); return; }
    showToast(isEdit ? "Lowongan berhasil diperbarui." : "Lowongan berhasil dibuat sebagai draft.", "success");
    navigate(`/company/jobs/${jobId}`);
  }

  if (loading) return <PageLoading label="Memuat form..." />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl font-bold text-ink-950">{isEdit ? "Edit Lowongan" : "Buat Lowongan Baru"}</h1>
      <p className="mt-1 text-sm text-ink-500">Lengkapi detail posisi PKL/magang yang Anda tawarkan.</p>

      <form onSubmit={(e) => handleSubmit(e, false)} className="card mt-5 space-y-4 p-6">
        <TextField label="Job Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Frontend Developer Intern" />
        <TextAreaField label="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
        <TextAreaField label="Responsibilities" value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} rows={3} />
        <TextAreaField label="Requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} />

        <div>
          <label className="label">Skills yang Dibutuhkan</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button type="button" key={s.id} onClick={() => toggleSkill(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${selectedSkills.includes(s.id) ? "border-ink-900 bg-ink-900 text-paper" : "border-ink-200 text-ink-600 hover:bg-ink-50"}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Pilih kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectField>
          <TextField label="Jurusan" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="Contoh: RPL / Teknik Informatika" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField label="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Contoh: Jakarta Selatan" />
          <SelectField label="Work Type" value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}>
            {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </SelectField>
          <TextField label="Available Positions" type="number" min={1} value={form.positions_available} onChange={(e) => setForm({ ...form, positions_available: Number(e.target.value) })} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <TextField label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <TextField label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <TextField label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </div>

        <TextAreaField label="Benefits" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={2} />

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="btn-outline">{saving ? <Spinner size={16} /> : "Simpan sebagai Draft"}</button>
          <button type="button" disabled={saving} onClick={(e) => handleSubmit(e, true)} className="btn-primary">
            {saving ? <Spinner size={16} /> : isEdit ? "Simpan & Publish" : "Publish Lowongan"}
          </button>
        </div>
      </form>
    </div>
  );
}
