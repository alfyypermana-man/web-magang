import { supabase } from "../lib/supabaseClient";

export async function listNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return { data: data || [], error };
}

export async function unreadCount(userId) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return { count: count || 0, error };
}

export async function markAsRead(id) {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  return { error };
}

export async function markAllAsRead(userId) {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  return { error };
}

export async function createNotification({ userId, title, body, type = "info", link }) {
  const { error } = await supabase.from("notifications").insert({ user_id: userId, title, body, type, link });
  return { error };
}
