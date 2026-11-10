"use client";

import React from "react";
import { Search, SlidersHorizontal, Sparkles, CheckCircle2 } from "lucide-react";

export default function TravelApproach() {
  const steps = [
    {
      number: "01",
      stepLabel: "STEP 01",
      icon: Search,
      title: "Discover Your Destination",
      description:
        "Browse domestic packages across all 28 states of India or let our travel experts guide you to the perfect region based on your travel dates, preferred climate, and style.",
      highlights: ["All 28 States Covered", "Expert Destination Guidance", "Free Travel Advice"],
    },
    {
      number: "02",
      stepLabel: "STEP 02",
      icon: SlidersHorizontal,
      title: "Choose Your Perfect Tour",
      description:
        "Select an itinerary that fits your pace, budget, and travel style. Customize days, hotel tiers, transfers, and sightseeing spots with complete flexibility and zero hassle.",
      highlights: ["Tailored Itineraries", "Vetted Quality Stays", "100% Transparent Quotes"],
    },
    {
      number: "03",
      stepLabel: "STEP 03",
      icon: Sparkles,
      title: "Enjoy Your Journey",
      description:
        "Embark on your holiday with complete peace of mind. From verified accommodations to dedicated on-trip assistance, our team ensures every moment of your vacation is seamless.",
      highlights: ["Smooth On-Ground Transfers", "24/7 Dedicated Assistance", "Unforgettable Domestic Holidays"],
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F5F8FC] border-t border-[#DCEAF3] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#F15A24] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3] shadow-xs">
            <span>SEAMLESS TRIP PLANNING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            Our Travel <span className="text-[#F15A24]">Approach</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            A simple three-step process designed to make exploring India effortless, transparent, and joyful.
          </p>
        </div>

        {/* Zig-Zag Stepper Timeline */}
        <div className="relative">
          {/* Desktop Center Vertical Connecting Spine Line */}
          <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-[2px] -translate-x-1/2 bg-[#DCEAF3]" />

          {/* Mobile Left Connecting Line */}
          <div className="block md:hidden absolute left-7 top-6 bottom-6 w-[2px] bg-[#DCEAF3]" />

          <div className="space-y-10 md:space-y-16">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 1; // 0 = Left, 1 = Right, 2 = Left

              return (
                <div
                  key={idx}
                  className="relative flex flex-col md:flex-row items-center group"
                >
                  {/* Center Node (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-2xl bg-white border-2 border-[#DCEAF3] flex-col items-center justify-center text-[#F15A24] shadow-sm group-hover:border-[#F15A24] group-hover:bg-[#F15A24] group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                    <span className="text-[10px] font-mono font-bold mt-0.5 opacity-80">
                      {step.number}
                    </span>
                  </div>

                  {/* Mobile Node (Left) */}
                  <div className="flex md:hidden items-center gap-3 self-start mb-3 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#DCEAF3] flex flex-col items-center justify-center text-[#F15A24] shadow-xs group-hover:border-[#F15A24] group-hover:bg-[#F15A24] group-hover:text-white transition-all duration-300">
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-mono font-bold mt-0.5 opacity-80">
                        {step.number}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#F15A24] px-2.5 py-1 rounded-full bg-white border border-[#DCEAF3]">
                      {step.stepLabel}
                    </span>
                  </div>

                  {/* Left Side: Card when !isEven, Empty Spacer when isEven */}
                  <div
                    className={`w-full md:w-1/2 ${
                      !isEven ? "md:pr-14" : "hidden md:block md:pr-14"
                    }`}
                  >
                    {!isEven ? (
                      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#DCEAF3] shadow-xs hover:border-[#F15A24]/40 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="hidden sm:inline-block text-xs font-bold font-mono tracking-wider text-[#F15A24] uppercase">
                            {step.stepLabel}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Phase {idx + 1} of 3
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-extrabold text-[#082B50] mb-2.5 group-hover:text-[#F15A24] transition-colors">
                          {step.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {step.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                          {step.highlights.map((h, hIdx) => (
                            <span
                              key={hIdx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F8FC] text-slate-600 text-xs font-semibold border border-[#DCEAF3]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#F15A24]" />
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="invisible" />
                    )}
                  </div>

                  {/* Right Side: Card when isEven, Empty Spacer when !isEven */}
                  <div
                    className={`w-full md:w-1/2 ${
                      isEven ? "md:pl-14" : "hidden md:block md:pl-14"
                    }`}
                  >
                    {isEven ? (
                      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#DCEAF3] shadow-xs hover:border-[#F15A24]/40 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="hidden sm:inline-block text-xs font-bold font-mono tracking-wider text-[#F15A24] uppercase">
                            {step.stepLabel}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Phase {idx + 1} of 3
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-extrabold text-[#082B50] mb-2.5 group-hover:text-[#F15A24] transition-colors">
                          {step.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {step.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                          {step.highlights.map((h, hIdx) => (
                            <span
                              key={hIdx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F8FC] text-slate-600 text-xs font-semibold border border-[#DCEAF3]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#F15A24]" />
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="invisible" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
