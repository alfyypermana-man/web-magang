import React, { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getStudentByUserId, updateStudent, updateProfile, listSkills, getStudentSkills, setStudentSkills } from "../../services/studentsService";
import { uploadFile, validateFile, buildPath } from "../../services/storageService";
import { TextField, SelectField } from "../../components/FormFields";
import { PageLoading, Spinner } from "../../components/Loading";
import Badge from "../../components/Badge";

export default function StudentProfile() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: st }, { data: skills }] = await Promise.all([getStudentByUserId(user.id), listSkills()]);
      setStudent(st);
      setAllSkills(skills);
      if (st) {
        setForm({
          full_name: st.profile?.full_name || "",
          avatar_url: st.profile?.avatar_url || "",
          school_name: st.school_name || "",
          major: st.major || "",
          class_name: st.class_name || "",
          whatsapp: st.whatsapp || "",
          location: st.location || "",
        });
        const { data: sk } = await getStudentSkills(st.id);
        setSelectedSkills(sk.map((s) => s.id));
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, "image");
    if (err) { showToast(err, "error"); return; }
    setUploadingAvatar(true);
    const { url, error } = await uploadFile("avatars", buildPath(user.id, file), file);
    setUploadingAvatar(false);
    if (error) { showToast("Gagal mengunggah foto.", "error"); return; }
    setForm((f) => ({ ...f, avatar_url: url }));
  }

  function toggleSkill(id) {
    setSelectedSkills((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
      updateProfile(user.id, { full_name: form.full_name, avatar_url: form.avatar_url }),
      updateStudent(student.id, {
        school_name: form.school_name, major: form.major, class_name: form.class_name,
        whatsapp: form.whatsapp, location: form.location,
      }),
      setStudentSkills(student.id, selectedSkills),
    ]);
    setSaving(false);
    if (e1 || e2 || e3) {
      showToast("Gagal menyimpan profil.", "error");
      return;
    }
    await refreshProfile();
    showToast("Profil berhasil diperbarui.", "success");
  }

  if (loading || !form) return <PageLoading label="Memuat profil..." />;

  const completion = calcCompletion(form, selectedSkills);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <h1 className="font-display text-lg font-bold text-ink-950">Profil Saya</h1>

        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ink-100">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-ink-400">
                {(form.full_name || "U").charAt(0)}
              </div>
            )}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink-950/40 opacity-0 transition-opacity hover:opacity-100">
              {uploadingAvatar ? <Spinner size={16} className="text-white" /> : <Camera size={16} className="text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-ink-800">Foto Profil</p>
            <p className="text-xs text-ink-400">PNG/JPG, maks 2MB</p>
          </div>
        </div>

        <TextField label="Nama Lengkap" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Sekolah/Universitas" required value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} />
          <TextField label="Jurusan" required value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Kelas" value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} />
          <TextField label="Lokasi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Contoh: Jakarta Selatan" />
        </div>
        <TextField label="Nomor WhatsApp" required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />

        <div>
          <label className="label">Skills</label>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleSkill(s.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedSkills.includes(s.id) ? "border-ink-900 bg-ink-900 text-paper" : "border-ink-200 text-ink-600 hover:bg-ink-50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner size={16} /> : "Simpan Perubahan"}
        </button>
      </form>

      <div className="card h-fit p-5">
        <h3 className="font-display text-sm font-semibold text-ink-900">Kelengkapan Profil</h3>
        <div className="mt-3 h-2 w-full rounded-full bg-ink-100">
          <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${completion.percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-500">Profile {completion.percent}% Complete</p>

        {completion.missing.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {completion.missing.map((m) => (
              <li key={m} className="flex items-center gap-2 text-xs text-ink-500">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-300" /> {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function calcCompletion(form, skills) {
  const checks = [
    { label: "Foto profil", ok: Boolean(form.avatar_url) },
    { label: "Nama lengkap", ok: Boolean(form.full_name) },
    { label: "Sekolah/Universitas", ok: Boolean(form.school_name) },
    { label: "Jurusan", ok: Boolean(form.major) },
    { label: "Nomor WhatsApp", ok: Boolean(form.whatsapp) },
    { label: "Lokasi", ok: Boolean(form.location) },
    { label: "Minimal 1 skill", ok: skills.length > 0 },
  ];
  const done = checks.filter((c) => c.ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}
