import { supabase } from "../lib/supabaseClient";

export async function createReport({ reporterId, targetType, targetId, reason, description }) {
  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      description,
      status: "pending",
    })
    .select()
    .single();
  return { data, error };
}

export async function listReports({ status } = {}) {
  let query = supabase
    .from("reports")
    .select("*, reporter:profiles(full_name, role)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function updateReportStatus(id, status) {
  const { data, error } = await supabase.from("reports").update({ status }).eq("id", id).select().single();
  return { data, error };
}
