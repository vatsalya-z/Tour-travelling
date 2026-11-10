"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { IoCallOutline, IoCalendarOutline } from "react-icons/io5";

interface MobileBottomBarProps {
  onOpenEnquiry?: () => void;
}

export default function MobileBottomBar({ onOpenEnquiry }: MobileBottomBarProps) {
  return (
    <nav
      aria-label="Mobile Sticky Action Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 select-none"
    >
      <div className="relative bg-[#E66826] text-white shadow-[0_-4px_25px_rgba(0,0,0,0.22)] pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {/* Top subtle highlight line */}
        <div className="h-[1.5px] w-full bg-white/25" />

        <div className="flex items-center justify-between px-6 h-14 max-w-md mx-auto relative">
          {/* 1. Left: CALL NOW */}
          <a
            href="tel:+919876543210"
            aria-label="Call +91 98765 43210"
            className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <IoCallOutline className="w-5 h-5 text-white" />
            <span className="text-[11px] font-black tracking-wider text-white uppercase leading-none">
              CALL NOW
            </span>
          </a>

          {/* 2. Center: Floating Elevated WhatsApp Button */}
          <div className="flex-1 flex justify-center">
            <a
              href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="absolute -top-5 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,211,102,0.5),0_0_12px_rgba(230,104,38,0.5)]   transition-transform group"
            >
              <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 " />
              <FaWhatsapp className="w-10 h-10  group-hover:scale-105 transition-transform" />
            </a>
          </div>

          {/* 3. Right: BOOK NOW */}
          <button
            type="button"
            onClick={onOpenEnquiry}
            aria-label="Book Tour Package"
            className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
          >
            <IoCalendarOutline className="w-5 h-5 text-white" />
            <span className="text-[11px] font-black tracking-wider text-white uppercase leading-none">
              BOOK NOW
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
