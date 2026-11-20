"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { ShieldAlert, ArrowLeft, LogOut, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If unauthenticated user visits any admin route, automatically redirect them to /admin/login
  useEffect(() => {
    if (mounted && !isLoading && !user && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [mounted, isLoading, user, pathname, router]);

  // Allow unrestricted access to the admin login page itself
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state
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

  // Unauthenticated user: show redirecting indicator while router.replace executes
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col items-center justify-center p-4 font-sans">
        <RefreshCw className="w-8 h-8 text-[#082B50] animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#082B50] tracking-normal">
          Redirecting to Admin Login...
        </p>
      </div>
    );
  }

  // Authenticated as regular customer (not an administrator)
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
          <p className="text-xs text-[#64748B] mb-2 leading-relaxed">
            Logged in as <strong className="text-[#172B4D]">{user.email}</strong>.
          </p>
          <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
            This portal is strictly reserved for TourTripHolidays administrators. Customer accounts do not have access to the admin dashboard.
          </p>
          <div className="space-y-2.5 text-xs">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#082B50] hover:bg-[#123F68] text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Website</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace("/admin/login");
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F5F8FC] hover:bg-[#FEECEC] text-[#DC4444] font-medium py-2.5 px-4 rounded-lg border border-[#E5EAF1] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Login with Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin privileges
  return <>{children}</>;
}
