import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setProfileLoading(false);
    if (error) {
      console.error("Gagal mengambil profile:", error.message);
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    const p = await fetchProfile(data.user.id);
    return { data, profile: p };
  }, [fetchProfile]);

  const signUpStudent = useCallback(async (form) => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) return { error };

    const userId = data.user?.id;
    if (!userId) return { data };

    // Buat profile dasar
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: form.fullName,
      role: "student",
    });
    if (profileError) return { error: profileError };

    // Buat data students terkait
    const { error: studentError } = await supabase.from("students").insert({
      user_id: userId,
      whatsapp: form.whatsapp,
      school_name: form.schoolName,
      major: form.major,
      class_name: form.className,
    });
    if (studentError) return { error: studentError };

    return { data, needsEmailConfirmation: !data.session };
  }, []);

  const signUpCompany = useCallback(async (form) => {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) return { error };

    const userId = data.user?.id;
    if (!userId) return { data };

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: form.companyName,
      role: "company",
    });
    if (profileError) return { error: profileError };

    const { error: companyError } = await supabase.from("companies").insert({
      user_id: userId,
      company_name: form.companyName,
      phone: form.phone,
      industry: form.industry,
      address: form.address,
      website: form.website,
      status: "pending",
    });
    if (companyError) return { error: companyError };

    return { data, needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    return supabase.auth.resetPasswordForEmail(email, { redirectTo });
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    return supabase.auth.updateUser({ password: newPassword });
  }, []);

  const refreshProfile = useCallback(() => {
    if (user?.id) return fetchProfile(user.id);
    return Promise.resolve(null);
  }, [user, fetchProfile]);

  const value = {
    session,
    user,
    profile,
    role: profile?.role ?? null,
    loading: loading || (Boolean(user) && profileLoading && !profile),
    signIn,
    signUpStudent,
    signUpCompany,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}
