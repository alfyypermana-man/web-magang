import { supabase } from "../lib/supabaseClient";

// Bucket names yang harus dibuat di Supabase Storage (lihat supabase/schema.sql):
// avatars, company-logos, resumes, portfolio-images, certificates

const MAX_SIZE = {
  image: 2 * 1024 * 1024, // 2MB
  pdf: 5 * 1024 * 1024, // 5MB
};

export function validateFile(file, kind = "image") {
  if (!file) return "File tidak ditemukan.";
  const allowed =
    kind === "pdf" ? ["application/pdf"] : ["image/png", "image/jpeg", "image/webp", "image/jpg"];
  if (!allowed.includes(file.type)) {
    return kind === "pdf" ? "File harus berformat PDF." : "File harus berformat gambar (PNG/JPG/WEBP).";
  }
  const max = kind === "pdf" ? MAX_SIZE.pdf : MAX_SIZE.image;
  if (file.size > max) {
    return `Ukuran file maksimal ${Math.round(max / 1024 / 1024)}MB.`;
  }
  return null;
}

export async function uploadFile(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) return { url: null, error };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function removeFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error };
}

export function buildPath(userId, file) {
  const ext = file.name.split(".").pop();
  return `${userId}/${Date.now()}.${ext}`;
}
