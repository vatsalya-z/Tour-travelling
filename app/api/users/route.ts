import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";

/**
 * GET /api/users
 * Fetches user profiles from public.profiles table.
 * Table Schema:
 *   - id UUID PRIMARY KEY REFERENCES auth.users(id)
 *   - full_name TEXT
 *   - email TEXT UNIQUE
 *   - mobile_number TEXT
 *   - role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer'))
 *   - avatar_url TEXT
 *   - created_at TIMESTAMPTZ
 *   - updated_at TIMESTAMPTZ
 */
export async function GET(request: Request) {
  try {
    const { client, isAdmin } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase credentials are not configured in .env.local",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const email = searchParams.get("email");
    const search = searchParams.get("search");
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = isNaN(limitParam) ? 50 : Math.min(Math.max(limitParam, 1), 100);

    // 1. Fetch from public.profiles table
    let query = client
      .from("profiles")
      .select("id, full_name, email, mobile_number, role, avatar_url, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (role) {
      // Map 'user' to 'customer' if passed
      const mappedRole = role === "user" ? "customer" : role;
      query = query.eq("role", mappedRole);
    }

    if (email) {
      query = query.eq("email", email.trim().toLowerCase());
    }

    if (search) {
      const q = search.trim();
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,mobile_number.ilike.%${q}%`);
    }

    const { data: profiles, error: profileError } = await query;

    if (!profileError && profiles && profiles.length > 0) {
      return NextResponse.json({
        success: true,
        source: "profiles_table",
        count: profiles.length,
        data: profiles,
      });
    }

    // 2. Fallback to auth.users if profiles table is empty or pending sync
    if (isAdmin) {
      const { data: authData, error: authError } = await client.auth.admin.listUsers({
        perPage: limit,
      });

      if (!authError && authData?.users && authData.users.length > 0) {
        let authUsers = authData.users.map((u) => {
          const rawRole = u.user_metadata?.role || "customer";
          const normalizedRole = rawRole === "admin" ? "admin" : "customer";
          return {
            id: u.id,
            email: u.email || null,
            full_name: u.user_metadata?.full_name || null,
            mobile_number: u.user_metadata?.mobile_number || null,
            role: normalizedRole,
            avatar_url: u.user_metadata?.avatar_url || null,
            created_at: u.created_at,
            updated_at: u.updated_at || u.created_at,
          };
        });

        if (role) {
          const targetRole = role === "admin" ? "admin" : "customer";
          authUsers = authUsers.filter((u) => u.role === targetRole);
        }
        if (email) {
          authUsers = authUsers.filter((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
        }
        if (search) {
          const q = search.trim().toLowerCase();
          authUsers = authUsers.filter(
            (u) =>
              u.email?.toLowerCase().includes(q) ||
              u.full_name?.toLowerCase().includes(q) ||
              u.mobile_number?.includes(q)
          );
        }

        return NextResponse.json({
          success: true,
          source: "auth_users",
          count: authUsers.length,
          data: authUsers,
        });
      }
    }

    if (profileError && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: profileError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      source: "profiles_table",
      count: 0,
      data: [],
      message: "No users found in database.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Registers a new user and saves to public.profiles table.
 * Body Schema:
 *   - email: string (required)
 *   - password: string (required, min 6 characters)
 *   - full_name: string (optional)
 *   - mobile_number: string (optional)
 *   - role: 'customer' | 'admin' (optional, defaults to 'customer' per SQL table)
 *   - avatar_url: string (optional)
 */
export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password, full_name, mobile_number, role, avatar_url } = body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password is required and must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    // In SQL: CHECK (role IN ('admin', 'customer')) DEFAULT 'customer'
    const assignedRole = role === "admin" ? "admin" : "customer";
    const cleanFullName = full_name ? String(full_name).trim() : null;
    const cleanMobile = mobile_number ? String(mobile_number).trim() : null;
    const cleanAvatar = avatar_url ? String(avatar_url).trim() : null;

    const { client, isAdmin } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    let userId: string;

    if (isAdmin) {
      // 1. Create user in auth.users via Admin API
      const { data: authData, error: authError } = await client.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: cleanFullName || "",
          mobile_number: cleanMobile || "",
          role: assignedRole,
          avatar_url: cleanAvatar || "",
        },
      });

      if (authError) {
        const isDuplicate =
          authError.message.toLowerCase().includes("already") ||
          authError.message.toLowerCase().includes("unique");
        return NextResponse.json(
          {
            success: false,
            error: isDuplicate ? "This email is already registered." : authError.message,
          },
          { status: isDuplicate ? 409 : 400 }
        );
      }

      userId = authData.user.id;

      // 2. Save directly into public.profiles table (matches SQL schema)
      const { error: profileError } = await client.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        full_name: cleanFullName,
        mobile_number: cleanMobile,
        role: assignedRole,
        avatar_url: cleanAvatar,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn("Profile upsert warning:", profileError.message);
      }
    } else {
      // Fallback via client signUp
      const { data: authData, error: authError } = await client.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanFullName || "",
            mobile_number: cleanMobile || "",
            role: assignedRole,
            avatar_url: cleanAvatar || "",
          },
        },
      });

      if (authError) {
        const isDuplicate =
          authError.message.toLowerCase().includes("already") ||
          authError.message.toLowerCase().includes("unique");
        return NextResponse.json(
          {
            success: false,
            error: isDuplicate ? "This email is already registered." : authError.message,
          },
          { status: isDuplicate ? 409 : 400 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { success: false, error: "Failed to create user account" },
          { status: 500 }
        );
      }

      userId = authData.user.id;

      try {
        await client.from("profiles").upsert({
          id: userId,
          email: cleanEmail,
          full_name: cleanFullName,
          mobile_number: cleanMobile,
          role: assignedRole,
          avatar_url: cleanAvatar,
        });
      } catch (profileErr) {
        console.warn("Profile upsert warning:", profileErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `${assignedRole === "admin" ? "Admin" : "Customer"} registered successfully`,
        data: {
          id: userId,
          email: cleanEmail,
          full_name: cleanFullName,
          mobile_number: cleanMobile,
          role: assignedRole,
          avatar_url: cleanAvatar,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
