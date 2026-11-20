"use client";

import React from "react";
import { Target, Compass } from "lucide-react";
import { AboutMissionVisionSection } from "@/types/about";

interface MissionVisionProps {
  data: AboutMissionVisionSection;
}

export default function MissionVision({ data }: MissionVisionProps) {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          {data.label && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3]">
              <span>{data.label}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            {data.heading}
          </h2>
        </div>

        {/* Two Clean Content Blocks (2 cols mobile, 2 cols desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
          {/* Mission Block */}
          <div className="bg-[#F5F8FC] rounded-xl sm:rounded-3xl p-3.5 sm:p-8 lg:p-10 border border-[#DCEAF3] hover:border-[#F15A24]/40 transition-colors shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white border border-[#DCEAF3] flex items-center justify-center text-[#F15A24] mb-3 sm:mb-5 shadow-xs shrink-0">
                <Target className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#F15A24]">
                OUR MISSION
              </span>
              <h3 className="text-xs sm:text-xl lg:text-2xl font-extrabold text-[#082B50] mt-0.5 sm:mt-1 mb-1.5 sm:mb-3 leading-snug">
                {data.mission_title}
              </h3>
              <p className="text-slate-600 text-[11px] sm:text-base leading-snug sm:leading-relaxed line-clamp-4 sm:line-clamp-none">
                {data.mission_desc}
              </p>
            </div>
          </div>

          {/* Vision Block */}
          <div className="bg-[#F5F8FC] rounded-xl sm:rounded-3xl p-3.5 sm:p-8 lg:p-10 border border-[#DCEAF3] hover:border-[#F15A24]/40 transition-colors shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white border border-[#DCEAF3] flex items-center justify-center text-[#082B50] mb-3 sm:mb-5 shadow-xs shrink-0">
                <Compass className="w-4 h-4 sm:w-6 sm:h-6 text-[#082B50]" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#082B50]">
                OUR VISION
              </span>
              <h3 className="text-xs sm:text-xl lg:text-2xl font-extrabold text-[#082B50] mt-0.5 sm:mt-1 mb-1.5 sm:mb-3 leading-snug">
                {data.vision_title}
              </h3>
              <p className="text-slate-600 text-[11px] sm:text-base leading-snug sm:leading-relaxed line-clamp-4 sm:line-clamp-none">
                {data.vision_desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

