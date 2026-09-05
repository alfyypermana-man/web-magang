import { supabase } from "../lib/supabaseClient";

const SELECT = `
  id, scheduled_at, type, location, meeting_link, notes, status, created_at,
  application:applications (
    id,
    job:jobs ( id, title, company:companies ( id, company_name, logo_url ) ),
    student:students ( id, profile:profiles ( id, full_name, avatar_url ) )
  )
`;

export async function scheduleInterview(payload) {
  const { data, error } = await supabase.from("interviews").insert(payload).select(SELECT).single();
  return { data, error };
}

export async function updateInterview(id, payload) {
  const { data, error } = await supabase.from("interviews").update(payload).eq("id", id).select(SELECT).single();
  return { data, error };
}

export async function listStudentInterviews(studentId) {
  const { data, error } = await supabase
    .from("interviews")
    .select(SELECT)
    .eq("application.student_id", studentId)
    .order("scheduled_at", { ascending: true });
  return { data: data || [], error };
}

export async function listCompanyInterviews(companyId) {
  const { data, error } = await supabase
    .from("interviews")
    .select(`${SELECT}, application:applications!inner(id, job:jobs!inner(id, title, company_id), student:students(id, profile:profiles(id, full_name, avatar_url)))`)
    .eq("application.job.company_id", companyId)
    .order("scheduled_at", { ascending: true });
  return { data: data || [], error };
}
