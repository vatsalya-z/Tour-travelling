"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Shield,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/features/auth/AuthContext";
import { uploadTourImage } from "@/lib/supabase/storage";

export default function AdminProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const isConfigured = isSupabaseConfigured();

  // Profile Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password Change
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setMobileNumber(profile.mobile_number || "");
      setAvatarUrl(profile.avatar_url || "");
    } else if (user) {
      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
    }
  }, [profile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!user || !isConfigured) {
      setProfileMsg({
        type: "error",
        text: "Supabase not configured in .env.local",
      });
      return;
    }

    setSavingProfile(true);
    try {
      const supabase = createClient();

      // Update in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          mobile_number: mobileNumber.trim(),
          avatar_url: avatarUrl,
          email: user.email,
        });

      if (profileError) throw profileError;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          mobile_number: mobileNumber.trim(),
          avatar_url: avatarUrl,
        },
      });

      await refreshProfile();
      setProfileMsg({
        type: "success",
        text: "Admin profile updated successfully!",
      });
    } catch (err: unknown) {
      setProfileMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    if (!isConfigured) {
      setPasswordMsg({
        type: "error",
        text: "Supabase is not configured in .env.local",
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMsg({
        type: "success",
        text: "Password updated successfully!",
      });
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      setPasswordMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update password",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { url, error } = await uploadTourImage(file, "avatars");
    if (url) {
      setAvatarUrl(url);
    } else if (error) {
      alert(`Avatar upload error: ${error}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
          Admin Profile & Security
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage administrator account information, credentials, and password settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-xl p-6 border border-[#E5EAF1] shadow-xs flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <div className="w-20 h-20 rounded-full bg-[#082B50] text-white flex items-center justify-center text-2xl font-bold shadow-xs overflow-hidden border-2 border-[#E5EAF1]">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={fullName || "Admin"}
                  className="w-full h-full object-cover"
                />
              ) : (
                fullName?.charAt(0).toUpperCase() || "A"
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#F04B16] text-white shadow-xs cursor-pointer hover:bg-[#d94012] transition-colors">
              <Upload className="w-3 h-3" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="font-bold text-sm text-[#172B4D]">
            {fullName || "Administrator"}
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">{email || "admin@tourtripholidays.com"}</p>

          <span className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF4EE] text-[#F04B16] text-[10px] font-semibold">
            <Shield className="w-3 h-3" />
            <span>Super Administrator</span>
          </span>

          <div className="w-full mt-5 pt-4 border-t border-[#E5EAF1] text-left text-xs space-y-2 text-[#64748B]">
            <div className="flex justify-between">
              <span>Account Status:</span>
              <span className="font-semibold text-[#16A36A]">Active</span>
            </div>
            <div className="flex justify-between">
              <span>Privilege:</span>
              <span className="font-semibold text-[#082B50]">Full Access</span>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Form 1: Profile Information */}
          <div className="bg-white rounded-xl p-6 border border-[#E5EAF1] shadow-xs space-y-4">
            <div className="border-b border-[#E5EAF1] pb-3">
              <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
                <UserCog className="w-4 h-4 text-[#082B50]" />
                <span>Personal Information</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Admin contact details and identity</p>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-[#EBF7F0] border-[#A7E2BE] text-[#16A36A]"
                    : "bg-[#FEECEC] border-[#F8B4B4] text-[#DC4444]"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#172B4D] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Admin Name"
                    className="w-full h-11 pl-9 pr-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#172B4D] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full h-11 pl-9 pr-3 bg-[#F8FAFC] border border-[#E5EAF1] rounded-lg text-[#64748B] cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Email is linked to Supabase Auth credentials.
                </p>
              </div>

              <div>
                <label className="block font-medium text-[#172B4D] mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 pl-9 pr-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 bg-[#082B50] hover:bg-[#123F68] text-white font-semibold py-2 px-4 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? "Saving..." : "Save Details"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Password Change */}
          <div className="bg-white rounded-xl p-6 border border-[#E5EAF1] shadow-xs space-y-4">
            <div className="border-b border-[#E5EAF1] pb-3">
              <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#F04B16]" />
                <span>Change Password</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">Update admin login password</p>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  passwordMsg.type === "success"
                    ? "bg-[#EBF7F0] border-[#A7E2BE] text-[#16A36A]"
                    : "bg-[#FEECEC] border-[#F8B4B4] text-[#DC4444]"
                }`}
              >
                {passwordMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#172B4D] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-11 pl-9 pr-9 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172B4D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#172B4D] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-11 pl-9 pr-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex items-center gap-1.5 bg-[#F04B16] hover:bg-[#d94012] text-white font-semibold py-2 px-4 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{updatingPassword ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
