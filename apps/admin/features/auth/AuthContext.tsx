"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/user";
import { isSupabaseConfigured, DEV_ADMIN_CREDENTIALS } from "@/lib/supabase/config";

export interface LoginResult {
  success: boolean;
  error?: string;
  isAdmin?: boolean;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (fullName: string, email: string, mobileNumber: string, password: string) => Promise<RegisterResult>;
  devLogin: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  devLogin: () => {},
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    if (!isConfigured) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
        const isAdminUser = userEmail === DEV_ADMIN_CREDENTIALS.email;
        setProfile((prev) => prev || {
          id: userId,
          full_name: userEmail?.split("@")[0] || "User",
          email: userEmail || "",
          mobile_number: "",
          role: isAdminUser ? "admin" : "customer",
          avatar_url: "",
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Failed to fetch user profile:", err);
    }
  }, [isConfigured]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  }, [user, fetchProfile]);

  const devLogin = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tth_dev_admin_active", "true");
    }
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.signInWithPassword({
        email: DEV_ADMIN_CREDENTIALS.email,
        password: DEV_ADMIN_CREDENTIALS.password,
      });
      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("tth_admin_token", data.session.access_token);
        }
      }
    } catch {}

    const mockDevUser = {
      id: "95c73591-fd17-49ea-837f-6aedaaa8be7b",
      email: DEV_ADMIN_CREDENTIALS.email,
      user_metadata: { full_name: "Dev Administrator", role: "admin" },
    } as unknown as User;
    const mockDevProfile: Profile = {
      id: "95c73591-fd17-49ea-837f-6aedaaa8be7b",
      full_name: "Dev Administrator",
      email: DEV_ADMIN_CREDENTIALS.email,
      mobile_number: "+91 98765 43210",
      role: "admin",
      avatar_url: "",
      created_at: new Date().toISOString(),
    };
    setUser((u) => u || mockDevUser);
    setProfile((p) => p || mockDevProfile);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (emailInput: string, passwordInput: string): Promise<LoginResult> => {
      const cleanEmail = emailInput.trim().toLowerCase();

      // Dev Admin bypass
      if (
        cleanEmail === DEV_ADMIN_CREDENTIALS.email.toLowerCase() &&
        passwordInput === DEV_ADMIN_CREDENTIALS.password
      ) {
        devLogin();
        return { success: true, isAdmin: true };
      }

      try {
        let authUser: User | null = null;
        let authSession: Session | null = null;

        // 1. Supabase browser client login (syncs Supabase Auth session)
        if (isConfigured) {
          try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: passwordInput,
            });

            if (!error && data?.user) {
              authUser = data.user;
              authSession = data.session;
            }
          } catch {}
        }

        // 2. Call /api/auth/login for reliable server-side authentication & profile retrieval
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password: passwordInput }),
        });
        const json = await res.json();

        if (!json.success) {
          return {
            success: false,
            error: json.error || json.message || "Invalid credentials",
          };
        }

        const serverData = json.data;
        const serverUser = serverData?.user;

        const finalUser: User = authUser || ({
          id: serverUser.id,
          email: serverUser.email,
          user_metadata: {
            full_name: serverUser.full_name,
            role: serverUser.role,
          },
        } as unknown as User);

        const finalProfile: Profile = {
          id: serverUser.id,
          full_name: serverUser.full_name || cleanEmail.split("@")[0] || "User",
          email: serverUser.email,
          mobile_number: "",
          role: (serverUser.role as any) || "customer",
          avatar_url: "",
          created_at: new Date().toISOString(),
        };

        // Update state IMMEDIATELY so header updates without refresh
        setUser(finalUser);
        setProfile(finalProfile);
        if (authSession) setSession(authSession);

        // Persist session in localStorage for seamless reload
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "tth_user_session",
            JSON.stringify({
              user: finalUser,
              profile: finalProfile,
              token: serverData.access_token,
            })
          );
          if (serverUser.is_admin) {
            localStorage.setItem("tth_admin_token", serverData.access_token);
          }
        }

        return {
          success: true,
          isAdmin: serverUser.is_admin || serverUser.role === "admin",
        };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Login failed. Please try again.",
        };
      }
    },
    [isConfigured, devLogin]
  );

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      mobileNumber: string,
      password: string
    ): Promise<RegisterResult> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            mobile_number: mobileNumber.trim(),
            password,
            role: "customer",
          }),
        });
        const json = await res.json();

        if (!json.success) {
          return {
            success: false,
            error: json.error || json.message || "Failed to create account",
          };
        }

        // Auto-login after successful registration
        const loginRes = await login(email, password);
        return {
          success: loginRes.success,
          error: loginRes.error,
        };
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to register account",
        };
      }
    },
    [login]
  );

  useEffect(() => {
    // 1. Check if dev admin was active in localStorage
    if (typeof window !== "undefined") {
      const isDevAdmin = localStorage.getItem("tth_dev_admin_active");
      if (isDevAdmin === "true") {
        devLogin();
        return;
      }

      // 2. Check if a normal user session was saved in localStorage
      const cachedSession = localStorage.getItem("tth_user_session");
      if (cachedSession) {
        try {
          const parsed = JSON.parse(cachedSession);
          if (parsed?.user) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setIsLoading(false);
          }
        } catch {}
      }
    }

    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // 3. Sync active Supabase browser session
    supabase.auth.getSession().then(({ data }: any) => {
      const currentSession = data?.session;
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(currentSession.user.id, currentSession.user.email);
      }
      setIsLoading(false);
    });

    // 4. Listen for auth changes
    const {
      data: { subscription },
    } = (supabase.auth as any).onAuthStateChange(async (_event: any, newSession: Session | null) => {
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user.id, newSession.user.email);
      } else {
        if (typeof window !== "undefined" && !localStorage.getItem("tth_user_session")) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile, devLogin]);

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tth_dev_admin_active");
      localStorage.removeItem("tth_user_session");
      localStorage.removeItem("tth_admin_token");
    }
    if (isConfigured) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const roleLower = (profile?.role || "").toLowerCase();
  const isAdmin =
    roleLower === "admin" ||
    roleLower === "super_admin" ||
    user?.email?.toLowerCase() === DEV_ADMIN_CREDENTIALS.email.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAdmin,
        isLoading,
        isConfigured,
        login,
        register,
        devLogin,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
