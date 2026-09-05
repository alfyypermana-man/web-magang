import { supabase } from "../lib/supabaseClient";

export async function getPlatformStats() {
  const [students, companies, jobs, applications, activeJobs, accepted, pendingCompanies] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    totalStudents: students.count || 0,
    totalCompanies: companies.count || 0,
    totalJobs: jobs.count || 0,
    totalApplications: applications.count || 0,
    activeJobs: activeJobs.count || 0,
    acceptedApplications: accepted.count || 0,
    pendingCompanies: pendingCompanies.count || 0,
  };
}

export async function listAllJobsAdmin({ status, search } = {}) {
  let query = supabase
    .from("jobs")
    .select("*, company:companies(company_name, logo_url, status)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("title", `%${search}%`);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function updateJobStatusAdmin(id, status) {
  const { data, error } = await supabase.from("jobs").update({ status }).eq("id", id).select().single();
  return { data, error };
}

export async function deleteJobAdmin(id) {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  return { error };
}

export async function listAllApplicationsAdmin() {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id, status, created_at,
      job:jobs(id, title, company:companies(company_name)),
      student:students(id, profile:profiles(full_name))
    `)
    .order("created_at", { ascending: false })
    .limit(200);
  return { data: data || [], error };
}

export async function logActivity({ userId, action, description }) {
  const { error } = await supabase.from("activity_logs").insert({ user_id: userId, action, description });
  return { error };
}

export async function listActivityLogs({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, user:profiles(full_name, role)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}

export async function suspendStudent(id) {
  const { data, error } = await supabase.from("students").update({ status: "suspended" }).eq("id", id).select().single();
  return { data, error };
}

export async function deleteStudent(id) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  return { error };
}
