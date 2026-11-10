"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative w-full pt-10 sm:pt-14 pb-8 sm:pb-12 bg-white">
      {/* Centered Heading & CTA Header Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Small Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs sm:text-sm font-bold tracking-wider uppercase mb-4 border border-[#DCEAF3]">
          <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
          <span>ABOUT TOURTRIPHOLIDAYS</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold text-[#082B50] tracking-tight leading-[1.18]">
          Discover India, <span className="text-[#F15A24]">One Unforgettable Journey</span> at a Time.
        </h1>

        {/* Supporting Description */}
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          At TourTripHolidays, we believe every journey has a story. Our goal is to help travelers explore the beauty, culture, traditions, and hidden experiences of India through thoughtfully planned travel experiences.
        </p>

        {/* Centered CTA Button directly below content */}
        
      </div>

      {/* Hero Responsive Photography Showcase (No Gradients, No Color Overlays) */}
      <div className="mt-10 sm:mt-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-50">
          {/* Desktop & Tablet Hero Image (Aspect Ratio 16:9, screens >= 640px) */}
          <div className="hidden sm:block relative w-full aspect-[16/9]">
            <Image
              src="/images/about/about-hero-desktop.webp"
              alt="TourTripHolidays - Panoramic Indian Himalayan mountain valley with pristine alpine lake"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center w-full h-full select-none"
            />
          </div>

          {/* Mobile Hero Image (Aspect Ratio 3:4, screens < 640px) */}
          <div className="block sm:hidden relative w-full aspect-[3/4]">
            <Image
              src="/images/about/about-hero-mobile.webp"
              alt="TourTripHolidays - Traveler admiring Himalayan mountains and serene lake"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center w-full h-full select-none"
            />
          </div>
        </div>
        
      </div>
    </section>
  );
}

