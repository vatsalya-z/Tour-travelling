"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { ShieldAlert, AlertTriangle, ArrowLeft, LogIn, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isLoading, devLogin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Allow unrestricted access to the admin login page itself
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col items-center justify-center p-4 font-sans">
        <RefreshCw className="w-8 h-8 text-[#082B50] animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#082B50] tracking-normal">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-4 font-sans text-[#172B4D]">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center shadow-xl border border-[#E5EAF1]">
          <div className="w-12 h-12 bg-[#FEF6E9] text-[#E99A24] rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#FCD9A5]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#082B50] mb-1 font-display">
            Authentication Required
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Please log in with administrator credentials to access the TourTripHolidays Admin Panel.
          </p>
          <div className="space-y-2.5 text-xs">
            <button
              type="button"
              onClick={async () => {
                try {
                  const { createClient } = await import("@/lib/supabase/client");
                  const { DEV_ADMIN_CREDENTIALS } = await import("@/lib/supabase/config");
                  const supabase = createClient();
                  await supabase.auth.signInWithPassword({
                    email: DEV_ADMIN_CREDENTIALS.email,
                    password: DEV_ADMIN_CREDENTIALS.password,
                  });
                } catch {}
                devLogin();
                router.refresh();
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F04B16] hover:bg-[#d94012] text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Direct Login as Dev Admin</span>
            </button>
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#082B50] hover:bg-[#123F68] text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Admin Login Page</span>
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F5F8FC] hover:bg-[#EEF4FB] text-[#64748B] hover:text-[#172B4D] font-medium py-2.5 px-4 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated, but not an admin (normal customer)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-4 font-sans text-[#172B4D]">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center shadow-xl border border-[#FEECEC]">
          <div className="w-12 h-12 bg-[#FEECEC] text-[#DC4444] rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#F8B4B4]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#DC4444] mb-1 font-display">
            Access Restricted
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Signed in as <span className="font-semibold text-[#172B4D]">{user.email}</span>, which does not have administrator privileges.
          </p>
          <div className="space-y-2.5 text-xs">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#082B50] hover:bg-[#123F68] text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Website</span>
            </Link>
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F5F8FC] hover:bg-[#EEF4FB] text-[#64748B] hover:text-[#172B4D] font-medium py-2.5 px-4 rounded-lg transition-all"
            >
              <span>Sign in with an Admin Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
