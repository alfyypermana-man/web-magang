import { supabase } from "../lib/supabaseClient";

const JOB_SELECT = `
  id, title, description, responsibilities, requirements, location, work_type,
  duration, start_date, end_date, deadline, benefits, positions_available,
  major, status, created_at,
  company:companies ( id, company_name, logo_url, status, industry, address ),
  category:job_categories ( id, name ),
  job_skills ( skill:skills ( id, name ) )
`;

export async function listJobs({ search, location, category, major, workType, page = 1, pageSize = 9, statusIn = ["active"] } = {}) {
  let query = supabase
    .from("jobs")
    .select(JOB_SELECT, { count: "exact" })
    .in("status", statusIn)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%`);
  }
  if (location) query = query.ilike("location", `%${location}%`);
  if (major) query = query.ilike("major", `%${major}%`);
  if (workType) query = query.eq("work_type", workType);
  if (category) query = query.eq("category_id", category);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data: data || [], error, count: count || 0 };
}

export async function getJobById(id) {
  const { data, error } = await supabase.from("jobs").select(JOB_SELECT).eq("id", id).maybeSingle();
  return { data, error };
}

export async function getFeaturedJobs(limit = 6) {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function listCategories() {
  const { data, error } = await supabase.from("job_categories").select("id, name, icon").order("name");
  return { data: data || [], error };
}

export async function createJob(companyId, payload) {
  const { data, error } = await supabase
    .from("jobs")
    .insert({ ...payload, company_id: companyId })
    .select()
    .single();
  return { data, error };
}

export async function updateJob(jobId, payload) {
  const { data, error } = await supabase.from("jobs").update(payload).eq("id", jobId).select().single();
  return { data, error };
}

export async function deleteJob(jobId) {
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  return { error };
}

export async function listCompanyJobs(companyId) {
  const { data, error } = await supabase
    .from("jobs")
    .select(`${JOB_SELECT}, applications(count)`)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function listSkillsForJobs() {
  const { data, error } = await supabase.from("skills").select("id, name").order("name");
  return { data: data || [], error };
}

export async function setJobSkills(jobId, skillIds) {
  const { error: delError } = await supabase.from("job_skills").delete().eq("job_id", jobId);
  if (delError) return { error: delError };
  if (!skillIds || skillIds.length === 0) return { error: null };
  const rows = skillIds.map((skill_id) => ({ job_id: jobId, skill_id }));
  const { error } = await supabase.from("job_skills").insert(rows);
  return { error };
}

export async function toggleSaveJob(studentId, jobId, isSaved) {
  if (isSaved) {
    const { error } = await supabase.from("saved_jobs").delete().eq("student_id", studentId).eq("job_id", jobId);
    return { error };
  }
  const { error } = await supabase.from("saved_jobs").insert({ student_id: studentId, job_id: jobId });
  return { error };
}

export async function listSavedJobs(studentId) {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select(`id, created_at, job:jobs ( ${JOB_SELECT} )`)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}
