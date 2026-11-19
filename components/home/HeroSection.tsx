"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onOpenEnquiry?: () => void;
}

export default function HeroSection({ onOpenEnquiry }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Hidden semantic heading for SEO & Accessibility */}
      <div className="sr-only">
        <h1>Explore India with TourTripHolidays</h1>
        <p>Domestic Tour Packages for All 28 States of India</p>
      </div>
      <div className="hidden sm:block relative w-full aspect-[2170/725]">
        <Image
          src="/images/hero/hero-desktop.png"
          alt="Explore India with TourTripHolidays - Domestic Tour Packages for All 28 States of India"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center w-full h-full select-none"
        />
        <div
          className="absolute z-20 cursor-pointer"
          style={{
            left: "9.9%",
            top: "75.8%",
            width: "18.5%",
            height: "10.4%",
          }}
        >
          {onOpenEnquiry ? (
            <button
              type="button"
              onClick={onOpenEnquiry}
              title="Plan Your Trip Today - Free Travel Consultation"
              aria-label="Plan Your Trip Today"
              className="w-full h-full rounded-full cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-400/70 group relative overflow-hidden"
            >
              {/* Subtle hover gleam / ripple */}
              <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/20 transition-colors duration-200" />
              <span className="absolute inset-0 rounded-full ring-2 ring-white/0 group-hover:ring-white/80 transition-all duration-300 scale-95 group-hover:scale-100 shadow-md" />
            </button>
          ) : (
            <Link
              href="#packages"
              title="Plan Your Trip Today"
              aria-label="Plan Your Trip Today"
              className="block w-full h-full rounded-full focus:outline-none focus:ring-4 focus:ring-orange-400/70 group relative overflow-hidden"
            >
              <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/20 transition-colors duration-200" />
              <span className="absolute inset-0 rounded-full ring-2 ring-white/0 group-hover:ring-white/80 transition-all duration-300 scale-95 group-hover:scale-100" />
            </Link>
          )}
        </div>
      </div>

      {/* 
        ===================================================================
        2. MOBILE RESPONSIVE HERO BANNER (Screens < 640px)
        - Custom mobile composition (800x960, ~0.83 aspect ratio).
        - Prominently showcases Dal lake, snow mountains, traveler and
          clear legible typography + CTA button designed for mobile viewports.
        - Uses direct <Image> with priority (eliminating invalid <picture> wrap).
        - Interactive, accessible, tap-responsive CTA button centered at bottom.
        ===================================================================
      */}
      <div className="block sm:hidden relative w-full aspect-[800/960]">
        <Image
          src="/images/hero/hero-mobile.png"
          alt="Explore India with TourTripHolidays - Mobile Travel Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top w-full h-full select-none"
        />

        {/* 
          Interactive CTA Button Overlay (Mobile):
          x: 20% to 80% (centered pill matching the artwork), bottom: 4.5%, height: 6.5%
        */}
        <div
          className="absolute z-20"
          style={{
            left: "20%",
            right: "20%",
            bottom: "4.5%",
            height: "6.5%",
          }}
        >
          {onOpenEnquiry ? (
            <button
              type="button"
              onClick={onOpenEnquiry}
              title="Plan Your Trip Today"
              aria-label="Plan Your Trip Today"
              className="w-full h-full rounded-full bg-gradient-to-r from-[#F15A24] to-[#FF6B2B] hover:from-[#d94815] hover:to-[#f05a18] text-white text-xs font-bold shadow-lg shadow-orange-500/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-white/20"
            >
              <span>Plan Your Trip Today</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          ) : (
            <Link
              href="#packages"
              className="w-full h-full rounded-full bg-gradient-to-r from-[#F15A24] to-[#FF6B2B] hover:from-[#d94815] hover:to-[#f05a18] text-white text-xs font-bold shadow-lg shadow-orange-500/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-white/20"
            >
              <span>Plan Your Trip Today</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
