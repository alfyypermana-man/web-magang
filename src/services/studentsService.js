import { supabase } from "../lib/supabaseClient";

export async function getStudentByUserId(userId) {
  const { data, error } = await supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

export async function updateStudent(id, payload) {
  const { data, error } = await supabase.from("students").update(payload).eq("id", id).select().single();
  return { data, error };
}

export async function updateProfile(id, payload) {
  const { data, error } = await supabase.from("profiles").update(payload).eq("id", id).select().single();
  return { data, error };
}

export async function listAllStudents({ search, status } = {}) {
  let query = supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false });
  if (search) query = query.ilike("school_name", `%${search}%`);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function listSkills() {
  const { data, error } = await supabase.from("skills").select("id, name").order("name");
  return { data: data || [], error };
}

export async function getStudentSkills(studentId) {
  const { data, error } = await supabase
    .from("student_skills")
    .select("skill:skills(id, name)")
    .eq("student_id", studentId);
  return { data: (data || []).map((d) => d.skill), error };
}

export async function setStudentSkills(studentId, skillIds) {
  const { error: delError } = await supabase.from("student_skills").delete().eq("student_id", studentId);
  if (delError) return { error: delError };
  if (skillIds.length === 0) return { error: null };
  const rows = skillIds.map((skill_id) => ({ student_id: studentId, skill_id }));
  const { error } = await supabase.from("student_skills").insert(rows);
  return { error };
}

export async function listExperiences(studentId) {
  const { data, error } = await supabase.from("experiences").select("*").eq("student_id", studentId).order("start_date", { ascending: false });
  return { data: data || [], error };
}

export async function upsertExperience(payload) {
  const { data, error } = await supabase.from("experiences").upsert(payload).select().single();
  return { data, error };
}

export async function deleteExperience(id) {
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  return { error };
}

export async function listEducation(studentId) {
  const { data, error } = await supabase.from("education").select("*").eq("student_id", studentId).order("start_date", { ascending: false });
  return { data: data || [], error };
}

export async function upsertEducation(payload) {
  const { data, error } = await supabase.from("education").upsert(payload).select().single();
  return { data, error };
}

export async function deleteEducation(id) {
  const { error } = await supabase.from("education").delete().eq("id", id);
  return { error };
}

export async function listCertificates(studentId) {
  const { data, error } = await supabase.from("certificates").select("*").eq("student_id", studentId).order("issued_date", { ascending: false });
  return { data: data || [], error };
}

export async function upsertCertificate(payload) {
  const { data, error } = await supabase.from("certificates").upsert(payload).select().single();
  return { data, error };
}

export async function deleteCertificate(id) {
  const { error } = await supabase.from("certificates").delete().eq("id", id);
  return { error };
}
