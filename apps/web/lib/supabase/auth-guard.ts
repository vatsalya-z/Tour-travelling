import { createClient as createSupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "./admin";
import { createClient as createServerClient } from "./server";
import { isSupabaseConfigured, DEV_ADMIN_CREDENTIALS } from "./config";

export interface AdminAuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  userId: string | null;
  error?: string;
  statusCode?: number;
}

export interface RequesterAuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  userId: string | null;
}

function checkIsAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const r = role.trim().toLowerCase();
  return r === "admin" || r === "super_admin";
}

/**
 * Checks whether an incoming request comes from an authenticated administrator.
 * Supports:
 *  1. Authorization: Bearer <service_role_key> (Server-to-server / Postman privileged testing)
 *  2. Authorization: Bearer <user_jwt_access_token> (Verified via Supabase Auth + Admin profile check)
 *  3. Cookie session via Supabase SSR (Verified via Auth + Admin profile check)
 */
export async function verifyAdminAuth(request: Request): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured()) {
    console.error("[AuthGuard] Supabase credentials not configured in .env.local");
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      userId: null,
      error: "Supabase credentials are not configured in environment (.env.local)",
      statusCode: 500,
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Extract and log Bearer Token
  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");
  let bearerToken: string | null = null;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    bearerToken = authHeader.substring(7).trim();
  }

  console.log("Bearer token:", bearerToken || "(none)");

  // 1a. Direct service role key authorization
  if (bearerToken && serviceRoleKey && bearerToken === serviceRoleKey) {
    console.log("[AuthGuard] Admin verified via SUPABASE_SERVICE_ROLE_KEY");
    return {
      isAuthenticated: true,
      isAdmin: true,
      user: null,
      userId: null,
    };
  }

  const adminClient = createAdminClient();

  // 1b. User JWT access token verification
  if (bearerToken) {
    const anonClient = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await anonClient.auth.getUser(bearerToken);

    if (error || !data?.user) {
      console.warn("[AuthGuard] Bearer token verification failed:", error?.message || "User not found");
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userId: null,
        error: error ? error.message : "Invalid or expired authorization token",
        statusCode: 401,
      };
    }

    const user = data.user;
    const isDevAdmin = user.email?.toLowerCase() === DEV_ADMIN_CREDENTIALS.email.toLowerCase();

    // Check profiles table role
    let isRoleAdmin = checkIsAdminRole(user.user_metadata?.role);
    if (adminClient) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (checkIsAdminRole(profile?.role)) {
        isRoleAdmin = true;
      }
    }

    if (isDevAdmin || isRoleAdmin) {
      console.log(`[AuthGuard] Admin access granted for user: ${user.email} (${user.id})`);
      return {
        isAuthenticated: true,
        isAdmin: true,
        user,
        userId: user.id,
      };
    }

    console.warn(`[AuthGuard] Access forbidden: User ${user.email} (${user.id}) does not have admin role`);
    return {
      isAuthenticated: true,
      isAdmin: false,
      user,
      userId: user.id,
      error: "Forbidden: Administrator privileges required",
      statusCode: 403,
    };
  }

  // 2. Cookie session verification (Next.js server-side SSR cookies)
  try {
    const serverClient = await createServerClient();
    if (serverClient) {
      const { data, error } = await serverClient.auth.getUser();
      if (!error && data?.user) {
        const user = data.user;
        const isDevAdmin =
          user.email?.toLowerCase() === DEV_ADMIN_CREDENTIALS.email.toLowerCase();

        let isRoleAdmin = checkIsAdminRole(user.user_metadata?.role);
        if (adminClient) {
          const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (checkIsAdminRole(profile?.role)) {
            isRoleAdmin = true;
          }
        }

        if (isDevAdmin || isRoleAdmin) {
          console.log(`[AuthGuard] Admin verified via session cookie for user: ${user.email}`);
          return {
            isAuthenticated: true,
            isAdmin: true,
            user,
            userId: user.id,
          };
        }

        console.warn(`[AuthGuard] Session cookie user ${user.email} is not an admin`);
        return {
          isAuthenticated: true,
          isAdmin: false,
          user,
          userId: user.id,
          error: "Forbidden: Only administrators can create or manage tours",
          statusCode: 403,
        };
      }
    }
  } catch {
    // Non-cookie environment or parsing error
  }

  console.warn("[AuthGuard] No bearer token or active admin session provided in request");
  return {
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    userId: null,
    error: "Authentication required. Please provide a valid Bearer token in the Authorization header.",
    statusCode: 401,
  };
}

/**
 * Checks the requester's identity without blocking unauthenticated requests.
 * Used by public GET endpoints to determine if draft / unlisted records may be viewed.
 */
export async function getRequesterAuth(request: Request): Promise<RequesterAuthResult> {
  try {
    const res = await verifyAdminAuth(request);
    if (res.isAdmin) {
      return {
        isAuthenticated: true,
        isAdmin: true,
        user: res.user,
        userId: res.userId,
      };
    }
    return {
      isAuthenticated: res.isAuthenticated,
      isAdmin: false,
      user: res.user,
      userId: res.userId,
    };
  } catch {
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      userId: null,
    };
  }
}
