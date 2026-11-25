"use client";

import React from "react";
import { CalendarRange, Gem, Headphones, ShieldCheck } from "lucide-react";

export default function BenefitsStrip() {
  const benefits = [
    {
      icon: CalendarRange,
      line1: "Customizable",
      line2: "Tour Packages",
    },
    {
      icon: Gem,
      line1: "Best Price",
      line2: "Assured",
    },
    {
      icon: Headphones,
      line1: "Travel Support",
      line2: "During Your Trip",
    },
    {
      icon: ShieldCheck,
      line1: "Safe & Trusted",
      line2: "Travel Partner",
    },
  ];

  return (
    <div className="w-full bg-white border-b border-[#DCEAF3] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 md:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-0 lg:divide-x lg:divide-slate-200">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3.5 p-2 sm:px-6 rounded-xl bg-slate-50/60 lg:bg-transparent"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50/80 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F15A24]">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col text-[#082B50] leading-tight">
                  <span className="font-extrabold text-xs sm:text-[15px]">
                    {item.line1}
                  </span>
                  <span className="font-extrabold text-xs sm:text-[15px] text-[#F15A24] sm:text-[#082B50]">
                    {item.line2}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
