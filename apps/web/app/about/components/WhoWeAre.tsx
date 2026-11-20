"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, HeartHandshake, Map, Sparkles } from "lucide-react";
import { AboutWhoWeAreSection } from "@/types/about";

interface WhoWeAreProps {
  data: AboutWhoWeAreSection;
}

export default function WhoWeAre({ data }: WhoWeAreProps) {
  const icons = [Map, Sparkles, HeartHandshake];

  const renderHeading = () => {
    if (!data.heading_highlight || !data.heading.includes(data.heading_highlight)) {
      return data.heading;
    }
    const parts = data.heading.split(data.heading_highlight);
    return (
      <>
        {parts[0]}
        <span className="text-[#F15A24]">{data.heading_highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F5F8FC] border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading - Centered for both mobile & desktop */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          {data.label && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-[#F15A24] text-xs font-bold uppercase tracking-wider mb-3.5 border border-[#DCEAF3] shadow-xs">
              <span>{data.label}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight leading-tight">
            {renderHeading()}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              {data.paragraph_1 && <p>{data.paragraph_1}</p>}
              {data.paragraph_2 && <p>{data.paragraph_2}</p>}
            </div>

            {/* Feature Highlights (3 cols on mobile & desktop) */}
            {data.highlights && data.highlights.length > 0 && (
              <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4">
                {data.highlights.map((item, idx) => {
                  const Icon = icons[idx % icons.length];
                  return (
                    <div
                      key={idx}
                      className="bg-white p-2.5 sm:p-4 rounded-xl border border-[#DCEAF3] shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#EAF6FC] flex items-center justify-center text-[#F15A24] mb-2 shrink-0">
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <h4 className="text-[11px] sm:text-sm font-bold text-[#082B50] leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-tight line-clamp-2 sm:line-clamp-none">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Photography */}
          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DCEAF3] shadow-md bg-slate-100">
              {data.image && (
                <Image
                  src={data.image}
                  alt={data.heading}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center w-full h-full select-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

