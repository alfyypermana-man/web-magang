import { supabase } from "../lib/supabaseClient";

export async function getCompanyByUserId(userId) {
  const { data, error } = await supabase.from("companies").select("*").eq("user_id", userId).maybeSingle();
  return { data, error };
}

export async function getCompanyById(id) {
  const { data, error } = await supabase.from("companies").select("*, profile:profiles(full_name, avatar_url)").eq("id", id).maybeSingle();
  return { data, error };
}

export async function updateCompany(id, payload) {
  const { data, error } = await supabase.from("companies").update(payload).eq("id", id).select().single();
  return { data, error };
}

export async function listVerifiedCompanies({ search, page = 1, pageSize = 12 } = {}) {
  let query = supabase
    .from("companies")
    .select("*", { count: "exact" })
    .eq("status", "verified")
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("company_name", `%${search}%`);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data: data || [], error, count: count || 0 };
}

export async function listAllCompanies({ status, search } = {}) {
  let query = supabase.from("companies").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("company_name", `%${search}%`);
  const { data, error } = await query;
  return { data: data || [], error };
}

export async function verifyCompany(id) {
  const { data, error } = await supabase.from("companies").update({ status: "verified" }).eq("id", id).select().single();
  return { data, error };
}

export async function rejectCompany(id) {
  const { data, error } = await supabase.from("companies").update({ status: "rejected" }).eq("id", id).select().single();
  return { data, error };
}

export async function suspendCompany(id) {
  const { data, error } = await supabase.from("companies").update({ status: "suspended" }).eq("id", id).select().single();
  return { data, error };
}
