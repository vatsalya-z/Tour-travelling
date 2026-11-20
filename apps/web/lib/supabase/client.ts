import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "./config";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured() || !url || !anonKey) {
    // Return a dummy safe client during dev / unconfigured phase
    // to prevent app crashing before user enters env variables
    const fallbackClient = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: new Error("Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"),
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: new Error("Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"),
        }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        updateUser: async () => ({
          data: { user: null },
          error: new Error("Supabase not configured"),
        }),
      },
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
            data: [],
            error: null,
          }),
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            data: [],
            error: null,
          }),
          single: () => Promise.resolve({ data: null, error: null }),
          data: [],
          error: null,
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
            }),
          }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: new Error("Supabase not configured") }),
        }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error("Supabase not configured") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          remove: async () => ({ data: null, error: null }),
        }),
      },
    };
    return fallbackClient as unknown as ReturnType<typeof createBrowserClient>;
  }

  clientInstance = createBrowserClient(url, anonKey);
  return clientInstance;
}

/**
 * Retrieves an active admin Bearer token in the browser.
 * Checks active session, cached token in localStorage, or auto-authenticates with dev admin.
 */
export async function getAdminBearerToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      localStorage.setItem("tth_admin_token", data.session.access_token);
      return data.session.access_token;
    }
  } catch {}

  const cached = localStorage.getItem("tth_admin_token");
  if (cached) return cached;

  // Auto-login via /api/auth/login with dev admin credentials
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "dev@tourtripholidays.com",
        password: "Dev@12345",
      }),
    });
    const json = await res.json();
    if (json.success && json.data?.access_token) {
      localStorage.setItem("tth_admin_token", json.data.access_token);
      return json.data.access_token;
    }
  } catch {}

  return null;
}


