"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function AboutCTA() {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Solid Navy Card without Gradients */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#082B50] px-6 py-12 sm:px-12 sm:py-16 text-center border border-[#123F68] shadow-xl">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Centered Small Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#123F68] text-white text-xs sm:text-sm font-bold tracking-wider uppercase mb-5 border border-white/10">
              <Compass className="w-4 h-4 text-[#F15A24]" />
              <span>START YOUR JOURNEY</span>
            </div>

            {/* Centered Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Next Journey <span className="text-[#F15A24]">Starts Here.</span>
            </h2>

            {/* Centered Description */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
              Discover incredible destinations across India and let us help you plan a journey worth remembering.
            </p>

            {/* Centered CTA Button */}
            <div className="mt-8 sm:mt-10 flex justify-center">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2.5 bg-[#F15A24] hover:bg-[#d94815] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group cursor-pointer"
              >
                <span>Explore Tour Packages</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

