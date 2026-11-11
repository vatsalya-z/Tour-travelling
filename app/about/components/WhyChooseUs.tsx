"use client";

import React from "react";
import { Sparkles, Route, ShieldCheck, Headphones } from "lucide-react";
import { AboutWhyChooseUsSection } from "@/types/about";

interface WhyChooseUsProps {
  data: AboutWhyChooseUsSection;
}

export default function WhyChooseUs({ data }: WhyChooseUsProps) {
  const icons = [Sparkles, Route, ShieldCheck, Headphones];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F5F8FC] border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          {data.label && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#F15A24] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3] shadow-xs">
              <span>{data.label}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            {data.heading}
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.features.map((feature, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-[#DCEAF3] hover:border-[#F15A24]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EAF6FC] flex items-center justify-center text-[#F15A24]">
                      <Icon className="w-5 h-5" />
                    </div>
                    {feature.tag && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] border border-[#DCEAF3]">
                        {feature.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#082B50] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

