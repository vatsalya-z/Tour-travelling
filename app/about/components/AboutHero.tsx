"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { AboutHeroSection } from "@/types/about";

interface AboutHeroProps {
  data: AboutHeroSection;
}

export default function AboutHero({ data }: AboutHeroProps) {
  // If user provided a highlight phrase, style it in orange
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
    <section className="relative w-full pt-10 sm:pt-14 pb-8 sm:pb-12 bg-white">
      {/* Centered Heading & CTA Header Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Small Label */}
        {data.small_label && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs sm:text-sm font-bold tracking-wider uppercase mb-4 border border-[#DCEAF3]">
            <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
            <span>{data.small_label}</span>
          </div>
        )}

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold text-[#082B50] tracking-tight leading-[1.18]">
          {renderHeading()}
        </h1>

        {/* Supporting Description */}
        {data.description && (
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {data.description}
          </p>
        )}

        {/* Centered CTA Button directly below content */}
        {data.cta_text && (
          <div className="mt-7 sm:mt-8 flex justify-center">
            <Link
              href={data.cta_link || "/packages"}
              className="inline-flex items-center gap-2.5 bg-[#F15A24] hover:bg-[#d94815] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group cursor-pointer"
            >
              <span>{data.cta_text}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Responsive Original Travel Photography Showcase */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 sm:mt-14">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DCEAF3] shadow-md bg-slate-100">
          {/* Desktop Image (16:9 Landscape) */}
          <div className="hidden sm:block relative w-full aspect-[16/9]">
            {data.desktop_image && (
              <Image
                src={data.desktop_image}
                alt="Discover India with TourTripHolidays"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover object-center w-full h-full select-none"
              />
            )}
          </div>

          {/* Mobile Image (3:4 Portrait) */}
          <div className="block sm:hidden relative w-full aspect-[3/4]">
            {data.mobile_image && (
              <Image
                src={data.mobile_image}
                alt="Discover India with TourTripHolidays"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center w-full h-full select-none"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

