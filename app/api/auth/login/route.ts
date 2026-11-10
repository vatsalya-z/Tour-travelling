import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, DEV_ADMIN_CREDENTIALS } from "@/lib/supabase/config";

/**
 * POST /api/auth/login
 * Authenticates a user or administrator with email & password.
 * Returns the session Bearer access_token, user info, and role.
 */
export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: "Supabase credentials are not configured in environment (.env.local)",
        },
        { status: 500 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    const { email, password } = body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'email' is required",
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'password' is required",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createSupabaseClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Sign in with password using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
          error: authError ? authError.message : "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const session = authData.session;
    const user = authData.user;

    // Fetch user profile from public.profiles table to get database role
    const adminClient = createAdminClient();
    let dbRole = user.user_metadata?.role || "user";
    let fullName = user.user_metadata?.full_name || "";

    if (adminClient) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.role) dbRole = profile.role;
        if (profile.full_name) fullName = profile.full_name;
      }
    }

    const isDevAdmin = cleanEmail === DEV_ADMIN_CREDENTIALS.email.toLowerCase();
    const isAdmin = isDevAdmin || dbRole === "admin";

    return NextResponse.json(
      {
        success: true,
        message: `${isAdmin ? "Admin" : "User"} logged in successfully`,
        data: {
          token_type: "Bearer",
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          expires_at: session.expires_at,
          user: {
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: dbRole,
            is_admin: isAdmin,
          },
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

