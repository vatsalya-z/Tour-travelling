"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  onOpenEnquiry?: () => void;
}

export default function HeroSection({ onOpenEnquiry }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* 
        ===================================================================
        1. DESKTOP / TABLET HERO BANNER (Screens >= 640px)
        - Uses the master high-resolution 2170x725 image uploaded by user.
        - Spans 100% full viewport width with razor-sharp clarity.
        - Perfectly preserves the 2170:725 (2.99:1) grand landscape aspect ratio.
        ===================================================================
      */}
      <div className="hidden sm:block relative w-full aspect-[2170/725]">
        <picture>
          <source
            srcSet="/images/hero/hero-desktop.webp"
            type="image/webp"
          />
          <Image
            src="/images/hero/hero-desktop.png"
            alt="Explore India with TourTripHolidays - Domestic Tour Packages for All 28 States of India"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center w-full h-full select-none"
          />
        </picture>

        {/* 
          Interactive CTA Button Overlay (Desktop):
          Positioned directly over 'Plan Your Trip Today →'
          x: ~9.9% to 28.3%, y: ~75.8% to 86.2%
        */}
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
        ===================================================================
      */}
      <div className="block sm:hidden relative w-full aspect-[800/960]">
        <picture>
          <source
            srcSet="/images/hero/hero-mobile.webp"
            type="image/webp"
          />
          <Image
            src="/images/hero/hero-mobile.png"
            alt="Explore India with TourTripHolidays - Mobile Travel Banner"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top w-full h-full select-none"
          />
        </picture>

        {/* 
          Interactive CTA Button Overlay (Mobile):
          x: 28.7%, y: 90.1%, width: 42.5%, height: 6.3%
        */}
        <div
          className="absolute z-20 cursor-pointer"
          style={{
            left: "28.7%",
            top: "90.1%",
            width: "42.5%",
            height: "6.3%",
          }}
        >
          {onOpenEnquiry ? (
            <button
              type="button"
              onClick={onOpenEnquiry}
              title="Plan Your Trip Today"
              aria-label="Plan Your Trip Today"
              className="w-full h-full rounded-full cursor-pointer focus:outline-none active:scale-95 transition-transform group"
            >
              <span className="absolute inset-0 rounded-full bg-white/0 active:bg-white/30 transition-colors" />
            </button>
          ) : (
            <Link
              href="#packages"
              className="block w-full h-full rounded-full active:scale-95 transition-transform"
            >
              <span className="absolute inset-0 rounded-full bg-white/0 active:bg-white/30 transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
