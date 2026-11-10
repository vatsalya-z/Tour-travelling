import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * POST /api/auth/register
 * Registers a new user/admin and automatically hashes the password server-side.
 * 100% handled in Next.js routes - NO manual SQL changes needed in Supabase.
 *
 * Body Schema:
 *   - email: string (required)
 *   - password: string (required, min 6 characters)
 *   - full_name: string (optional)
 *   - mobile_number: string (optional)
 *   - role: 'customer' | 'admin' (optional, default: 'customer')
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

    const { email, password, full_name, mobile_number, role = "customer" } = body || {};

    // 1. Validation
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

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'password' is required and must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = role === "admin" ? "admin" : "customer";
    const cleanFullName = full_name ? String(full_name).trim() : null;
    const cleanMobile = mobile_number ? String(mobile_number).trim() : null;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const adminClient = createAdminClient();

    let userId: string;

    // 2. Create User in Supabase Auth (Password is hashed automatically with bcrypt by Supabase Auth server)
    if (adminClient) {
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: cleanFullName || "",
          mobile_number: cleanMobile || "",
          role: assignedRole,
        },
      });

      if (authError) {
        const isDuplicate =
          authError.message.toLowerCase().includes("already") ||
          authError.message.toLowerCase().includes("unique");
        return NextResponse.json(
          {
            success: false,
            message: isDuplicate ? "User already exists" : "Registration failed",
            error: isDuplicate ? "An account with this email is already registered." : authError.message,
          },
          { status: isDuplicate ? 409 : 400 }
        );
      }

      userId = authData.user.id;

      // 3. Upsert profile into public.profiles
      await adminClient.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        full_name: cleanFullName,
        mobile_number: cleanMobile,
        role: assignedRole,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Fallback via standard client signUp
      const anonClient = createSupabaseClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: authData, error: authError } = await anonClient.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanFullName || "",
            mobile_number: cleanMobile || "",
            role: assignedRole,
          },
        },
      });

      if (authError || !authData.user) {
        return NextResponse.json(
          {
            success: false,
            message: "Registration failed",
            error: authError?.message || "Failed to create user",
          },
          { status: 400 }
        );
      }

      userId = authData.user.id;

      await anonClient.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        full_name: cleanFullName,
        mobile_number: cleanMobile,
        role: assignedRole,
      });
    }

    // 4. Automatically generate active session token for immediate Postman/client use
    const anonClient = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: signInData } = await anonClient.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    return NextResponse.json(
      {
        success: true,
        message: `${assignedRole === "admin" ? "Admin" : "User"} registered successfully. Password stored in bcrypt hashed format.`,
        data: {
          token_type: "Bearer",
          access_token: signInData?.session?.access_token || null,
          user: {
            id: userId,
            email: cleanEmail,
            full_name: cleanFullName,
            mobile_number: cleanMobile,
            role: assignedRole,
          },
        },
      },
      { status: 201 }
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
