"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  LogIn,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, DEV_ADMIN_CREDENTIALS } from "@/lib/supabase/config";
import { useAuth } from "@/features/auth/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading, devLogin, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  // If already logged in as admin, auto-redirect to /admin
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      router.push("/admin");
    }
  }, [user, isAdmin, isLoading, router]);

  const handleFillDev = () => {
    setEmail(DEV_ADMIN_CREDENTIALS.email);
    setPassword(DEV_ADMIN_CREDENTIALS.password);
    setErrorMsg(null);
  };

  const handleDirectDevLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    setEmail(DEV_ADMIN_CREDENTIALS.email);
    setPassword(DEV_ADMIN_CREDENTIALS.password);
    setSuccessMsg("Dev Administrator verified! Redirecting to Dashboard...");

    try {
      const supabase = createClient();
      await supabase.auth.signInWithPassword({
        email: DEV_ADMIN_CREDENTIALS.email,
        password: DEV_ADMIN_CREDENTIALS.password,
      });
    } catch (err) {
      console.warn("Dev direct sign-in fallback:", err);
    }

    devLogin();

    setTimeout(() => {
      router.push("/admin");
    }, 400);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    // Dev admin bypass for local testing
    if (
      email.trim().toLowerCase() === DEV_ADMIN_CREDENTIALS.email.toLowerCase() &&
      password === DEV_ADMIN_CREDENTIALS.password
    ) {
      handleDirectDevLogin();
      return;
    }

    if (!isConfigured) {
      setErrorMsg(
        "Supabase credentials not configured in .env.local yet. Please click 'Direct Dev Login' above to access the dashboard."
      );
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const userIsAdmin =
          profile?.role === "admin" || data.user.email === DEV_ADMIN_CREDENTIALS.email;

        if (!userIsAdmin) {
          await supabase.auth.signOut();
          setErrorMsg(
            "Access Denied: Your account does not have administrator privileges."
          );
          setLoading(false);
          return;
        }

        await refreshProfile();
        setSuccessMsg("Admin authentication verified! Loading dashboard...");
        setTimeout(() => {
          router.push("/admin");
        }, 600);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center items-center p-4 font-sans text-[#172B4D]">
      {/* Return to Public Website */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#64748B] hover:text-[#082B50] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to website</span>
        </Link>
        <span className="text-[#94A3B8] font-medium">SaaS Admin Portal</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E5EAF1]">
        {/* Brand Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#E5EAF1] text-center flex flex-col items-center">
          <div className="mb-3">
            <Logo variant="light" />
          </div>
          <h1 className="text-lg font-bold text-[#082B50] font-display">
            Admin Management Portal
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Sign in to manage tour packages, bookings, and inventory
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Quick Dev Access Callout */}
          <div className="p-3.5 bg-[#FFF4EE] border border-[#FCD9A5] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#082B50]">
                <Sparkles className="w-3.5 h-3.5 text-[#F04B16]" />
                <span>Developer Demo Mode</span>
              </div>
              <span className="text-[10px] font-semibold text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E5EAF1]">
                One-Click
              </span>
            </div>

            <p className="text-[11px] text-[#64748B]">
              Quickly test the dashboard using demo administrator credentials:
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleFillDev}
                className="flex-1 bg-white hover:bg-slate-50 text-[#082B50] text-xs font-semibold py-2 px-3 rounded-lg border border-[#E5EAF1] shadow-2xs transition-all cursor-pointer text-center"
              >
                Fill with Dev
              </button>

              <button
                type="button"
                onClick={handleDirectDevLogin}
                className="flex-1 bg-[#F04B16] hover:bg-[#d94012] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Direct Dev Login</span>
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#FEECEC] border border-[#F8B4B4] text-xs text-[#DC4444] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#EBF7F0] border border-[#A7E2BE] text-xs text-[#16A36A] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#172B4D] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tourtripholidays.com"
                  className="w-full h-11 pl-10 pr-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#172B4D] mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172B4D] cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#082B50] hover:bg-[#123F68] text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-[#FAFCFF] px-8 py-3.5 border-t border-[#E5EAF1] text-center text-xs text-[#94A3B8]">
          TourTripHolidays SaaS Admin &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
