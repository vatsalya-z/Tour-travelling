"use client";

import React from "react";
import Image from "next/image";
import { FaPlane, FaTag, FaHeadset, FaAward } from "react-icons/fa6";

export default function WhyChooseUs() {
  const features = [
    {
      icon: FaPlane,
      title: "Wide Coverage",
      description: "Tour packages across all 28 states of India.",
    },
    {
      icon: FaTag,
      title: "Best Value",
      description: "Competitive pricing with no hidden cost.",
    },
    {
      icon: FaHeadset,
      title: "Expert Support",
      description: "Dedicated travel advisors for a smooth trip.",
    },
    {
      icon: FaAward,
      title: "Trusted Service",
      description: "Thousands of happy travelers across India.",
    },
  ];

  return (
    <section
      id="why-choose-us"
      className="relative w-full py-10 sm:py-14 bg-gradient-to-r from-[#EFF6FB] via-[#F4F9FD] to-[#EAF3FA] border-y border-[#D8E9F6] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading matching reference image */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#082B50] tracking-tight">
            Why Choose{" "}
            <span className="text-[#F15A24] inline-block">TourTripHolidays?</span>
          </h2>
        </div>

        {/* Horizontal Layout: 4 Cards on Left/Center + Traveler Mountain Artwork on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* 4 Feature Cards (spanning 9 cols on desktop) */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(8,43,80,0.06)] border border-sky-100/80 flex flex-col items-center text-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-200 group h-full"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#F15A24] mb-2 sm:mb-2.5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-[15px] font-extrabold text-[#082B50] mb-1.5 leading-snug group-hover:text-[#F15A24] transition-colors">
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Side: Generated Traveler in Mountains with Yellow Swoosh Artwork */}
          <div className="lg:col-span-3 flex justify-center items-center">
            <div className="relative w-full max-w-[320px] lg:max-w-none h-full min-h-[180px] rounded-2xl overflow-hidden shadow-sm border border-sky-100/70 bg-white group select-none">
              <Image
                src="/images/banners/why-choose-traveler.jpg"
                alt="Happy traveler with open arms overlooking snow mountains - TourTripHolidays"
                fill
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
