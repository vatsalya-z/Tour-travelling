"use client";

import React from "react";
import Image from "next/image";
import { Compass } from "lucide-react";
import { AboutExploreIndiaSection } from "@/types/about";

interface ExploreIndiaProps {
  data: AboutExploreIndiaSection;
}

export default function ExploreIndia({ data }: ExploreIndiaProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          {data.label && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3]">
              <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
              <span>{data.label}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            {data.heading}
          </h2>
          {data.description && (
            <p className="mt-3 sm:mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              {data.description}
            </p>
          )}
        </div>

        {/* 6 Experience Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {data.items.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden border border-[#DCEAF3] shadow-xs hover:shadow-md hover:border-[#F15A24]/40 transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.image || "/images/placeholder.jpg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#082B50] mb-2 group-hover:text-[#F15A24] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
