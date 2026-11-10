"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  Shield,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
} from "lucide-react";
import { isSupabaseConfigured, DEV_ADMIN_CREDENTIALS } from "@/lib/supabase/config";

export default function AdminSettingsPage() {
  const isConfigured = isSupabaseConfigured();
  const [siteUrl, setSiteUrl] = useState(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  );
  const [agencyPhone, setAgencyPhone] = useState("+91 98765 43210");
  const [agencyEmail, setAgencyEmail] = useState("info@tourtripholidays.com");
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
          System & Agency Settings
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Review database integration, storage buckets, dev credentials, and agency contact details.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-lg bg-[#EBF7F0] border border-[#A7E2BE] text-xs text-[#16A36A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Database Connection Status Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E5EAF1] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAF1] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#082B50]/10 text-[#082B50] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#082B50] font-display">
                Supabase Connection Status
              </h2>
              <p className="text-[11px] text-[#64748B]">Database, Auth, and Storage infrastructure</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isConfigured
                ? "bg-[#EBF7F0] text-[#16A36A]"
                : "bg-[#FEF6E9] text-[#E99A24]"
            }`}
          >
            {isConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Configured & Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#E99A24]" />
                <span>Pending Credentials</span>
              </>
            )}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1]">
            <span className="font-medium text-[#172B4D]">Database Engine</span>
            <span className="font-mono text-[#64748B]">PostgreSQL (Supabase Cloud)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1]">
            <span className="font-medium text-[#172B4D]">Storage Bucket</span>
            <span className="font-mono text-[#64748B]">tour-images (Public Read / Admin Write)</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1]">
            <span className="font-medium text-[#172B4D]">Config Environment File</span>
            <span className="font-mono text-[#64748B]">.env.local</span>
          </div>
        </div>
      </div>

      {/* Local Dev Admin Credentials Card */}
      <div className="bg-white rounded-xl p-6 border border-[#E5EAF1] shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <Key className="w-4 h-4 text-[#F04B16]" />
            <span>Developer Test Credentials</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Preset login values for rapid local testing</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1]">
            <p className="text-[#64748B] text-[11px]">Developer Email</p>
            <p className="font-mono font-semibold text-[#172B4D] mt-0.5">{DEV_ADMIN_CREDENTIALS.email}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1]">
            <p className="text-[#64748B] text-[11px]">Developer Password</p>
            <p className="font-mono font-semibold text-[#172B4D] mt-0.5">{DEV_ADMIN_CREDENTIALS.password}</p>
          </div>
        </div>
      </div>

      {/* Agency Details Form */}
      <div className="bg-white rounded-xl p-6 border border-[#E5EAF1] shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#082B50]" />
            <span>Agency & Site Details</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Contact parameters displayed on public vouchers and footer</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#172B4D] mb-1">
              Public Website URL
            </label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="w-full h-11 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#172B4D] mb-1">
                Support Telephone
              </label>
              <input
                type="text"
                value={agencyPhone}
                onChange={(e) => setAgencyPhone(e.target.value)}
                className="w-full h-11 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-[#172B4D] mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={agencyEmail}
                onChange={(e) => setAgencyEmail(e.target.value)}
                className="w-full h-11 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#082B50] hover:bg-[#123F68] text-white font-semibold py-2 px-4 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
