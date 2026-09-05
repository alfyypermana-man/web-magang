import { supabase } from "../lib/supabaseClient";

// Percakapan disederhanakan: satu baris "messages" per pesan, dikelompokkan
// berdasarkan pasangan (student_id, company_id) di sisi client.

export async function listConversationsForStudent(studentId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, company:companies(id, company_name, logo_url)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function listConversationsForCompany(companyId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, student:students(id, profile:profiles(full_name, avatar_url))")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function listThread(studentId, companyId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("student_id", studentId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });
  return { data: data || [], error };
}

export async function sendMessage({ studentId, companyId, senderRole, senderId, content }) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      student_id: studentId,
      company_id: companyId,
      sender_role: senderRole,
      sender_id: senderId,
      content,
      is_read: false,
    })
    .select()
    .single();
  return { data, error };
}

export function subscribeToThread(studentId, companyId, onInsert) {
  const channel = supabase
    .channel(`messages-${studentId}-${companyId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `student_id=eq.${studentId}` },
      (payload) => {
        if (payload.new.company_id === companyId) onInsert(payload.new);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function markThreadRead(studentId, companyId, readerRole) {
  const otherRole = readerRole === "student" ? "company" : "student";
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("student_id", studentId)
    .eq("company_id", companyId)
    .eq("sender_role", otherRole);
  return { error };
}
