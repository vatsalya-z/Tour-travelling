"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  MapPin,
  Calendar,
  FileText,
  User,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import AuthModal from "./AuthModal";

interface MobileBottomBarProps {
  onOpenEnquiry?: () => void;
}

export default function MobileBottomBar({ onOpenEnquiry }: MobileBottomBarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isHomeActive = pathname === "/";
  const isPackagesActive = pathname === "/packages" || pathname?.startsWith("/tours");
  const isEnquiriesActive = pathname === "/my-enquiries";

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 select-none bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(8,43,80,0.08)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2 relative">
          {/* 1. HOME */}
          <Link
            href="/"
            aria-label="Home"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-90 ${
              isHomeActive ? "text-[#F15A24]" : "text-slate-500 hover:text-[#082B50]"
            }`}
          >
            <Compass className={`w-5 h-5 ${isHomeActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            <span className={`text-[10px] tracking-tight mt-0.5 ${isHomeActive ? "font-extrabold" : "font-semibold"}`}>
              Home
            </span>
            {isHomeActive && <span className="w-1 h-1 rounded-full bg-[#F15A24] mt-0.5" />}
          </Link>

          {/* 2. EXPLORE / PACKAGES */}
          <Link
            href="/packages"
            aria-label="Explore Tour Packages"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-90 ${
              isPackagesActive ? "text-[#F15A24]" : "text-slate-500 hover:text-[#082B50]"
            }`}
          >
            <MapPin className={`w-5 h-5 ${isPackagesActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            <span className={`text-[10px] tracking-tight mt-0.5 ${isPackagesActive ? "font-extrabold" : "font-semibold"}`}>
              Packages
            </span>
            {isPackagesActive && <span className="w-1 h-1 rounded-full bg-[#F15A24] mt-0.5" />}
          </Link>

          {/* 3. CENTER ELEVATED ACTION: ENQUIRE / PLAN TRIP */}
          <div className="flex-1 flex justify-center relative">
            <button
              type="button"
              onClick={onOpenEnquiry}
              aria-label="Plan Custom Trip / Enquire"
              className="absolute -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-[#F15A24] to-[#f57c50] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(241,90,36,0.45)] ring-4 ring-white active:scale-90 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </button>
            <span className="text-[10px] font-extrabold text-[#F15A24] mt-7 block">
              Enquire
            </span>
          </div>

          {/* 4. MY ENQUIRIES */}
          <Link
            href="/my-enquiries"
            aria-label="My Enquiries"
            className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-90 ${
              isEnquiriesActive ? "text-[#F15A24]" : "text-slate-500 hover:text-[#082B50]"
            }`}
          >
            <FileText className={`w-5 h-5 ${isEnquiriesActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            <span className={`text-[10px] tracking-tight mt-0.5 ${isEnquiriesActive ? "font-extrabold" : "font-semibold"}`}>
              Enquiries
            </span>
            {isEnquiriesActive && <span className="w-1 h-1 rounded-full bg-[#F15A24] mt-0.5" />}
          </Link>

          {/* 5. PROFILE / ACCOUNT */}
          <Link
            href="/my-enquiries"
            onClick={handleProfileClick}
            aria-label="My Account"
            className="flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-all active:scale-90 text-slate-500 hover:text-[#082B50]"
          >
            <User className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-semibold tracking-tight mt-0.5">
              {user ? "Profile" : "Login"}
            </span>
          </Link>
        </div>
      </nav>

      {/* Login modal if user taps Profile while logged out */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
