import { supabase } from "../lib/supabaseClient";

export async function getPortfolioByStudentId(studentId) {
  const { data, error } = await supabase.from("portfolios").select("*, projects:portfolio_projects(*)").eq("student_id", studentId).maybeSingle();
  return { data, error };
}

export async function getPortfolioByUsername(username) {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*, projects:portfolio_projects(*), student:students(*, profile:profiles(*))")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();
  return { data, error };
}

export async function upsertPortfolio(payload) {
  const { data, error } = await supabase.from("portfolios").upsert(payload, { onConflict: "student_id" }).select().single();
  return { data, error };
}

export async function isUsernameTaken(username, excludeStudentId) {
  let query = supabase.from("portfolios").select("id, student_id").eq("username", username);
  const { data, error } = await query;
  if (error) return { taken: false, error };
  const taken = (data || []).some((row) => row.student_id !== excludeStudentId);
  return { taken, error: null };
}

export async function addProject(payload) {
  const { data, error } = await supabase.from("portfolio_projects").insert(payload).select().single();
  return { data, error };
}

export async function updateProject(id, payload) {
  const { data, error } = await supabase.from("portfolio_projects").update(payload).eq("id", id).select().single();
  return { data, error };
}

export async function deleteProject(id) {
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  return { error };
}

// Resumes (CV)
export async function listResumes(studentId) {
  const { data, error } = await supabase.from("resumes").select("*").eq("student_id", studentId).order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function upsertResume(payload) {
  const { data, error } = await supabase.from("resumes").upsert(payload).select().single();
  return { data, error };
}

export async function deleteResume(id) {
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  return { error };
}
