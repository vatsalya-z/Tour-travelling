"use client";

import React from "react";
import { SlidersHorizontal, CalendarCheck2, ShieldCheck, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: SlidersHorizontal,
      title: "Customized Travel Experiences",
      description:
        "Every traveler is unique. We tailor domestic itineraries to match your travel pace, personal interests, family needs, and budget.",
      tag: "Tailored For You",
    },
    {
      icon: CalendarCheck2,
      title: "Carefully Planned Tour Packages",
      description:
        "Handcrafted itineraries covering India's finest destinations with vetted accommodations, smooth transfers, and well-timed sightseeing.",
      tag: "Hassle-Free",
    },
    {
      icon: ShieldCheck,
      title: "Transparent Pricing",
      description:
        "Clear, competitive, and honest pricing with complete inclusions and zero hidden costs. You always know exactly what you are paying for.",
      tag: "Zero Hidden Costs",
    },
    {
      icon: Headphones,
      title: "Dedicated Travel Assistance",
      description:
        "From your initial enquiry to the moment you return home safely, our experienced travel specialists are just a call or message away.",
      tag: "Reliable Support",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#F5F8FC] border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#F15A24] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3] shadow-xs">
            <span>THE TOURTRIPHOLIDAYS ADVANTAGE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            Why Choose <span className="text-[#F15A24]">TourTripHolidays?</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            Dedicated to creating seamless, authentic, and unforgettable domestic travel memories.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DCEAF3] shadow-xs hover:border-[#F15A24]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Icon Box */}
                  <div className="w-12 h-12 rounded-xl bg-[#EAF6FC] flex items-center justify-center text-[#F15A24] mb-5 group-hover:scale-105 group-hover:bg-[#F15A24] group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-extrabold text-[#082B50] mb-2.5 leading-snug group-hover:text-[#F15A24] transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Tag */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="text-[#082B50] font-bold">{feature.tag}</span>
                  <span className="text-[#F15A24] font-mono text-[11px]">0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

