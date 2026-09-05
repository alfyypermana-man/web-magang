import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Jangan lempar error yang mematikan build, cukup peringatkan di console.
  // Halaman akan menampilkan pesan error yang ramah lewat ErrorBoundary/EmptyState.
  console.warn(
    "[MagangKu] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diatur. Salin .env.example menjadi .env dan isi kredensial Supabase Anda."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
