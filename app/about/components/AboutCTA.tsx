"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { AboutCTASection } from "@/types/about";

interface AboutCTAProps {
  data: AboutCTASection;
}

export default function AboutCTA({ data }: AboutCTAProps) {
  return (
    <section className="py-14 sm:py-20 bg-[#082B50] text-white relative overflow-hidden">
      {/* Subtle decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#F15A24]/10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-5 border border-white/20">
          <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
          <span>START YOUR JOURNEY</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
          {data.heading}
        </h2>

        {data.description && (
          <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            {data.description}
          </p>
        )}

        <div>
          <Link
            href={data.button_link || "/packages"}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F15A24] text-white font-bold text-sm sm:text-base hover:bg-[#d94a18] transition-all shadow-lg hover:shadow-orange-500/20"
          >
            <span>{data.button_text || "Explore Packages"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

