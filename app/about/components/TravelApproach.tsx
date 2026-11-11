"use client";

import React from "react";
import { CheckCircle2, Compass, Sparkles } from "lucide-react";
import { AboutTravelApproachSection } from "@/types/about";

interface TravelApproachProps {
  data: AboutTravelApproachSection;
}

export default function TravelApproach({ data }: TravelApproachProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F5F8FC] border-t border-[#DCEAF3]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          {data.label && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#F15A24] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3] shadow-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>{data.label}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            {data.heading}
          </h2>
        </div>

        {/* Vertical Zig-Zag Flow */}
        <div className="relative">
          {/* Central Vertical Connector Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-[#DCEAF3] -translate-x-1/2" />

          <div className="space-y-8 md:space-y-12">
            {data.steps.map((step, idx) => {
              const isEven = idx % 2 === 1; // 0: left, 1: right, 2: left

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  } gap-6 md:gap-12`}
                >
                  {/* Content Card (Takes half width on desktop) */}
                  <div className="w-full md:w-1/2">
                    <div
                      className={`bg-white rounded-2xl p-6 sm:p-8 border border-[#DCEAF3] shadow-xs hover:border-[#F15A24]/40 hover:shadow-md transition-all ${
                        isEven ? "md:text-left" : "md:text-left"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EAF6FC] text-[#F15A24] text-xs font-extrabold border border-[#DCEAF3]">
                          {step.step_number || `0${idx + 1}`}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F15A24]">
                          Step {idx + 1}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-[#082B50] mb-2">
                        {step.title}
                      </h3>

                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Node / Number Badge on Timeline */}
                  <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#082B50] text-white font-extrabold text-sm shadow-md border-4 border-[#F5F8FC] z-10">
                    {step.step_number || `0${idx + 1}`}
                  </div>

                  {/* Empty Spacer on other half (Desktop) */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

