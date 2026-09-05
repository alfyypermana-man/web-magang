import React, { useEffect, useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { getCompanyByUserId, updateCompany } from "../../services/companiesService";
import { uploadFile, validateFile, buildPath } from "../../services/storageService";
import { TextField, TextAreaField, SelectField } from "../../components/FormFields";
import { PageLoading, Spinner } from "../../components/Loading";
import Badge from "../../components/Badge";

const SIZES = ["1-10 karyawan", "11-50 karyawan", "51-200 karyawan", "200+ karyawan"];

export default function CompanyProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getCompanyByUserId(user.id).then(({ data }) => {
      setCompany(data);
      if (data) {
        setForm({
          company_name: data.company_name || "", logo_url: data.logo_url || "", industry: data.industry || "",
          description: data.description || "", address: data.address || "", website: data.website || "",
          phone: data.phone || "", company_size: data.company_size || "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, "image");
    if (err) { showToast(err, "error"); return; }
    setUploading(true);
    const { url, error } = await uploadFile("company-logos", buildPath(user.id, file), file);
    setUploading(false);
    if (error) { showToast("Gagal mengunggah logo.", "error"); return; }
    setForm((f) => ({ ...f, logo_url: url }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await updateCompany(company.id, form);
    setSaving(false);
    if (error) { showToast("Gagal menyimpan profil.", "error"); return; }
    setCompany(data);
    showToast("Profil perusahaan berhasil diperbarui.", "success");
  }

  if (loading || !form) return <PageLoading label="Memuat profil..." />;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-xl font-bold text-ink-950">Profil Perusahaan</h1>
        {company.status === "verified" && <Badge variant="success"><CheckCircle2 size={12} /> Verified</Badge>}
      </div>
      <p className="mt-1 text-sm text-ink-500">Kelola informasi perusahaan yang akan ditampilkan ke publik.</p>

      <form onSubmit={handleSubmit} className="card mt-5 space-y-4 p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100">
            {form.logo_url ? <img src={form.logo_url} alt="" className="h-full w-full object-cover" /> : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-ink-400">{(form.company_name || "C").charAt(0)}</div>
            )}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink-950/40 opacity-0 transition-opacity hover:opacity-100">
              {uploading ? <Spinner size={16} className="text-white" /> : <Camera size={16} className="text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-ink-800">Logo Perusahaan</p>
            <p className="text-xs text-ink-400">PNG/JPG, maks 2MB</p>
          </div>
        </div>

        <TextField label="Nama Perusahaan" required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Industri" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <SelectField label="Ukuran Perusahaan" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })}>
            <option value="">Pilih</option>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
        </div>
        <TextAreaField label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
        <TextAreaField label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <TextField label="Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size={16} /> : "Simpan Perubahan"}</button>
      </form>
    </div>
  );
}
