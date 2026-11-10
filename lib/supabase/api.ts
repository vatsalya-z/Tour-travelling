import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./admin";
import { isSupabaseConfigured } from "./config";

/**
 * Shared helper to get an active Supabase client for API route handlers.
 * Prefers the Admin Client (using SUPABASE_SERVICE_ROLE_KEY) so that it bypasses RLS
 * and avoids email rate-limiting on user creation.
 * Falls back to Anon Client when service role key is not present.
 */
export function getSupabaseApiClient() {
  const admin = createAdminClient();
  if (admin) {
    return { client: admin, isAdmin: true };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured() || !url || !anonKey) {
    return { client: null, isAdmin: false };
  }

  const anonClient = createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return { client: anonClient, isAdmin: false };
}

