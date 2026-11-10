"use client";

import React from "react";
import { Target, Compass } from "lucide-react";

export default function MissionVision() {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3]">
            <span>PURPOSE & DIRECTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            Our Mission & <span className="text-[#F15A24]">Vision</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            Guided by a genuine passion for authentic domestic travel across India.
          </p>
        </div>

        {/* Two Clean Content Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Mission Block */}
          <div className="bg-[#F5F8FC] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#DCEAF3] hover:border-[#F15A24]/40 transition-colors shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#DCEAF3] flex items-center justify-center text-[#F15A24] mb-5 shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F15A24]">
                OUR MISSION
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#082B50] mt-1 mb-3">
                Making Discovery Easier & Joyful
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                To make discovering India easier and more enjoyable by providing thoughtfully planned tour packages and memorable travel experiences.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-[#DCEAF3] flex items-center gap-2 text-xs font-semibold text-[#082B50]">
              <span className="w-2 h-2 rounded-full bg-[#F15A24]" />
              <span>Thoughtful itineraries • Transparent service • Authentic moments</span>
            </div>
          </div>

          {/* Vision Block */}
          <div className="bg-[#F5F8FC] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#DCEAF3] hover:border-[#F15A24]/40 transition-colors shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#DCEAF3] flex items-center justify-center text-[#082B50] mb-5 shadow-xs">
                <Compass className="w-6 h-6 text-[#082B50]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#082B50]">
                OUR VISION
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#082B50] mt-1 mb-3">
                Your Trusted Travel Companion
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                To become a trusted travel companion for people who want to explore India&apos;s diverse destinations, cultures, and experiences.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-[#DCEAF3] flex items-center gap-2 text-xs font-semibold text-[#082B50]">
              <span className="w-2 h-2 rounded-full bg-[#082B50]" />
              <span>All 28 Indian States • Cultural harmony • Lifelong memories</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

