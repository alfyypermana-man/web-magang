import { supabase } from "../lib/supabaseClient";

export async function applyToJob({ jobId, studentId, resumeId, coverLetter, whatsapp, note }) {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      student_id: studentId,
      resume_id: resumeId || null,
      cover_letter: coverLetter || null,
      whatsapp: whatsapp || null,
      note: note || null,
      status: "applied",
    })
    .select()
    .single();
  return { data, error };
}

export async function hasApplied(jobId, studentId) {
  const { data, error } = await supabase
    .from("applications")
    .select("id, status")
    .eq("job_id", jobId)
    .eq("student_id", studentId)
    .maybeSingle();
  return { data, error };
}

export async function listStudentApplications(studentId) {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id, status, created_at, cover_letter,
      job:jobs ( id, title, work_type, location, deadline, company:companies ( company_name, logo_url ) )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function listJobApplicants(jobId) {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id, status, created_at, cover_letter, whatsapp, note,
      student:students (
        id, school_name, major, class_name, whatsapp,
        profile:profiles ( id, full_name, avatar_url )
      ),
      resume:resumes ( id, file_url, title )
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function listCompanyApplicants(companyId) {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id, status, created_at,
      job:jobs!inner ( id, title, company_id ),
      student:students (
        id, school_name, major,
        profile:profiles ( id, full_name, avatar_url )
      )
    `)
    .eq("job.company_id", companyId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function updateApplicationStatus(applicationId, status) {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();
  return { data, error };
}
