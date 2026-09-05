import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Plus, Trash2, Image as ImageIcon, QrCode } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getStudentByUserId } from "../../services/studentsService";
import {
  getPortfolioByStudentId, upsertPortfolio, isUsernameTaken,
  addProject, updateProject, deleteProject,
} from "../../services/portfolioService";
import { uploadFile, validateFile, buildPath } from "../../services/storageService";
import { TextField, TextAreaField } from "../../components/FormFields";
import { PageLoading, Spinner } from "../../components/Loading";
import Modal, { ConfirmDialog } from "../../components/Modal";
import EmptyState from "../../components/EmptyState";

export default function StudentPortfolio() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectModal, setProjectModal] = useState(null); // null | {} | project
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: st } = await getStudentByUserId(user.id);
      setStudent(st);
      if (st) {
        const { data: p } = await getPortfolioByStudentId(st.id);
        setPortfolio(p);
        setForm({
          username: p?.username || suggestUsername(st.profile?.full_name),
          about: p?.about || "",
          skills_text: p?.skills_text || "",
          experience_text: p?.experience_text || "",
          education_text: p?.education_text || "",
          certificates_text: p?.certificates_text || "",
          contact_email: p?.contact_email || "",
          is_public: p?.is_public ?? true,
        });
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const { taken } = await isUsernameTaken(form.username, student.id);
    if (taken) {
      setSaving(false);
      showToast("Username portfolio sudah digunakan, coba yang lain.", "error");
      return;
    }
    const { data, error } = await upsertPortfolio({ ...form, student_id: student.id, id: portfolio?.id });
    setSaving(false);
    if (error) { showToast("Gagal menyimpan portfolio.", "error"); return; }
    setPortfolio((prev) => ({ ...prev, ...data, projects: prev?.projects || [] }));
    showToast("Portfolio berhasil disimpan.", "success");
  }

  async function handleDeleteProject() {
    if (!deleteTarget) return;
    const { error } = await deleteProject(deleteTarget.id);
    if (error) { showToast("Gagal menghapus project.", "error"); return; }
    setPortfolio((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== deleteTarget.id) }));
    setDeleteTarget(null);
    showToast("Project dihapus.", "success");
  }

  if (loading || !form) return <PageLoading label="Memuat portfolio..." />;

  const publicUrl = form.username ? `${window.location.origin}/portfolio/${form.username}` : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-950">Portfolio Saya</h1>
          <p className="mt-1 text-sm text-ink-500">Tampilkan profil profesionalmu kepada perusahaan.</p>
        </div>
        {portfolio && form.is_public && (
          <Link to={`/portfolio/${form.username}`} target="_blank" className="btn-outline btn-sm">
            <ExternalLink size={14} /> Lihat Portfolio Publik
          </Link>
        )}
      </div>

      <form onSubmit={handleSave} className="card mt-5 space-y-4 p-6">
        <TextField
          label="Username Portfolio (URL)"
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: sanitizeUsername(e.target.value) })}
          placeholder="nama-anda"
        />
        {publicUrl && <p className="-mt-2 flex items-center gap-1 text-xs text-ink-400"><QrCode size={12} /> {publicUrl}</p>}

        <TextAreaField label="About" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={3} placeholder="Ceritakan tentang dirimu secara singkat" />
        <TextField label="Skills (pisahkan dengan koma)" value={form.skills_text} onChange={(e) => setForm({ ...form, skills_text: e.target.value })} placeholder="React, JavaScript, SQL" />
        <TextAreaField label="Experience" value={form.experience_text} onChange={(e) => setForm({ ...form, experience_text: e.target.value })} rows={3} />
        <TextAreaField label="Education" value={form.education_text} onChange={(e) => setForm({ ...form, education_text: e.target.value })} rows={2} />
        <TextAreaField label="Certificates" value={form.certificates_text} onChange={(e) => setForm({ ...form, certificates_text: e.target.value })} rows={2} />
        <TextField label="Contact Email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />

        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} className="rounded border-ink-300" />
          Tampilkan portfolio secara publik
        </label>

        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size={16} /> : "Simpan Portfolio"}</button>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink-900">Projects</h2>
        {portfolio && (
          <button onClick={() => setProjectModal({})} className="btn-outline btn-sm"><Plus size={14} /> Tambah Project</button>
        )}
      </div>

      {!portfolio ? (
        <p className="mt-2 text-xs text-ink-400">Simpan portfolio terlebih dahulu untuk mulai menambahkan project.</p>
      ) : (portfolio.projects || []).length === 0 ? (
        <div className="mt-3"><EmptyState icon={ImageIcon} title="Belum ada project" description="Tambahkan project untuk memperkuat portfoliomu." /></div>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {portfolio.projects.map((p) => (
            <div key={p.id} className="card p-4">
              {p.screenshot_url && <img src={p.screenshot_url} className="mb-3 h-32 w-full rounded-lg object-cover" alt="" />}
              <h4 className="text-sm font-semibold text-ink-900">{p.name}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-ink-500">{p.description}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setProjectModal(p)} className="btn-outline btn-sm">Edit</button>
                <button onClick={() => setDeleteTarget(p)} className="btn-ghost btn-sm text-red-600"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {projectModal !== null && (
        <ProjectModal
          project={projectModal}
          studentId={student.id}
          onClose={() => setProjectModal(null)}
          onSaved={(saved) => {
            setPortfolio((prev) => {
              const exists = prev.projects.some((p) => p.id === saved.id);
              return { ...prev, projects: exists ? prev.projects.map((p) => (p.id === saved.id ? saved : p)) : [...prev.projects, saved] };
            });
            setProjectModal(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProject}
        title="Hapus Project"
        description={`Yakin ingin menghapus "${deleteTarget?.name}"?`}
        danger
      />
    </div>
  );
}

function ProjectModal({ project, studentId, onClose, onSaved }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: project.name || "", description: project.description || "", technologies: project.technologies || "",
    screenshot_url: project.screenshot_url || "", github_url: project.github_url || "", demo_url: project.demo_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, "image");
    if (err) { showToast(err, "error"); return; }
    setUploading(true);
    const { url, error } = await uploadFile("portfolio-images", buildPath(user.id, file), file);
    setUploading(false);
    if (error) { showToast("Gagal mengunggah gambar.", "error"); return; }
    setForm((f) => ({ ...f, screenshot_url: url }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, student_id: studentId };
    const { data, error } = project.id ? await updateProject(project.id, payload) : await addProject(payload);
    setSaving(false);
    if (error) { showToast("Gagal menyimpan project.", "error"); return; }
    onSaved(data);
  }

  return (
    <Modal open onClose={onClose} title={project.id ? "Edit Project" : "Tambah Project"} size="md"
      footer={<><button className="btn-outline btn-sm" onClick={onClose}>Batal</button><button className="btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Nama Project" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextAreaField label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        <TextField label="Teknologi (pisahkan koma)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js" />
        <div>
          <label className="label">Screenshot</label>
          <input type="file" accept="image/*" onChange={handleImage} className="text-xs" />
          {uploading && <p className="mt-1 text-xs text-ink-400">Mengunggah...</p>}
          {form.screenshot_url && <img src={form.screenshot_url} className="mt-2 h-24 rounded-lg object-cover" alt="" />}
        </div>
        <TextField label="GitHub URL" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." />
        <TextField label="Demo URL" value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} placeholder="https://..." />
      </form>
    </Modal>
  );
}

function suggestUsername(name) {
  return sanitizeUsername(name || "");
}
function sanitizeUsername(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
