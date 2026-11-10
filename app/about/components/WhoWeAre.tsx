"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, HeartHandshake, Map, Sparkles } from "lucide-react";

export default function WhoWeAre() {
  const highlights = [
    {
      title: "Thoughtful Planning",
      desc: "Every itinerary is carefully curated to balance iconic landmarks with offbeat gems.",
      icon: Map,
    },
    {
      title: "Authentic Local Culture",
      desc: "Immerse yourself in India's rich traditions, heritage, and genuine regional flavors.",
      icon: Sparkles,
    },
    {
      title: "Comfort & Reliability",
      desc: "Vetted stays, verified transport, and reliable support throughout your holiday.",
      icon: HeartHandshake,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F5F8FC] border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Text Content (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-white text-[#F15A24] text-xs font-bold uppercase tracking-wider mb-4 border border-[#DCEAF3] shadow-xs">
              <span>WHO WE ARE</span>
            </div>

            {/* Main Section Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight leading-tight">
              More Than Just a{" "}
              <span className="text-[#F15A24]">Travel Company</span>
            </h2>

            {/* Paragraph Content */}
            <div className="mt-4 sm:mt-5 space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              <p>
                At TourTripHolidays, we believe that traveling across India should be more than just visiting famous sights. It should be an enriching journey that touches your soul, connects you with remarkable local cultures, and leaves you with memories you cherish for a lifetime.
              </p>
              <p>
                Whether you dream of waking up to snow-clad peaks in Kashmir and Himachal, cruising through tranquil backwaters in Kerala, marveling at the royal grandeur of Rajasthan, or unwinding on golden coastal shores, our platform is built to make domestic travel effortless, transparent, and genuinely rewarding.
              </p>
              <p>
                We handle the logistics—from comfortable accommodations and dependable transfers to handpicked local activities—so you can immerse yourself completely in the vibrant colors, warm hospitality, and timeless heritage of incredible India.
              </p>
            </div>

            {/* Highlight Badges */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-3.5 border border-[#DCEAF3] shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EAF6FC] flex items-center justify-center text-[#F15A24] mb-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#082B50]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Realistic Indian Travel Photograph (5 cols on lg) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-[#DCEAF3] bg-white group">
              <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3]">
                <Image
                  src="/images/about/who-we-are.webp"
                  alt="Travelers exploring royal Indian heritage palace in Rajasthan - TourTripHolidays"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover object-center w-full h-full group-hover:scale-102 transition-transform duration-500 select-none"
                />
              </div>

              {/* Informative Floating Card at bottom */}
              <div className="p-4 sm:p-5 bg-white border-t border-[#DCEAF3]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EAF6FC] flex items-center justify-center text-[#F15A24] flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#082B50]">
                      Authentic Indian Experiences
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Customized holidays crafted with local expertise, cultural respect, and traveler safety at heart.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

