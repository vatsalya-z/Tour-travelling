"use client";

import React from "react";
import Image from "next/image";
import { FaUserFriends } from "react-icons/fa";
import { FaHeart, FaPersonHiking, FaCamera, FaUsers } from "react-icons/fa6";
import { GiLotus } from "react-icons/gi";

interface TravelInterestsProps {
  onSelectInterest?: (interest: string) => void;
}

export default function TravelInterests({ onSelectInterest }: TravelInterestsProps) {
  const interests = [
    {
      name: "Family Holidays",
      line1: "Family",
      line2: "Holidays",
      icon: FaUserFriends,
      color: "text-[#F15A24]", // Warm Orange
    },
    {
      name: "Honeymoon Packages",
      line1: "Honeymoon",
      line2: "Packages",
      icon: FaHeart,
      color: "text-[#E11D48]", // Vibrant Pink/Rose
    },
    {
      name: "Adventure Tours",
      line1: "Adventure",
      line2: "Tours",
      icon: FaPersonHiking,
      color: "text-[#F97316]", // Outdoor Adventure Orange
    },
    {
      name: "Spiritual Tours",
      line1: "Spiritual",
      line2: "Tours",
      icon: GiLotus,
      color: "text-[#C026D3]", // Spiritual Magenta
    },
    {
      name: "Wildlife Tours",
      line1: "Wildlife",
      line2: "Tours",
      icon: FaCamera,
      color: "text-[#EA580C]", // Wildlife Amber/Orange
    },
    {
      name: "Group Tours",
      line1: "Group",
      line2: "Tours",
      icon: FaUsers,
      color: "text-[#9333EA]", // Social Group Violet
    },
  ];

  return (
    <section className="relative w-full py-8 sm:py-10 overflow-hidden border-y border-[#DCEAF3] select-none">
      {/* 
        Panoramic Background Banner:
        - Taj Mahal on Left
        - Rajasthan Hill Fort on Right
        - Soft sky-blue/white open center for clean text overlay
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/banners/travel-interests-banner.jpg"
          alt="Taj Mahal & Rajasthan Fort Background - Travel by Interest"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft center wash for crisp contrast and clear readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/85 to-transparent" />
      </div>

      {/* Main Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Decorative Centered Heading matching reference image with color theme */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="w-10 sm:w-20 h-[2px] bg-gradient-to-r from-transparent to-[#082B50]/30 rounded-full" />
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#082B50] tracking-tight whitespace-nowrap">
            Travel by <span className="text-[#F15A24]">Interest</span>
          </h2>
          <div className="w-10 sm:w-20 h-[2px] bg-gradient-to-l from-transparent to-[#082B50]/30 rounded-full" />
        </div>

        {/* 
          6 Category Badges:
          - Desktop (md+): Single horizontal strip with subtle vertical dividers between each item
          - Mobile: Clean 3-column grid
        */}
        <div className="max-w-4xl mx-auto">
          {/* Desktop & Tablet View (md+) */}
          <div className="hidden md:flex items-center justify-center">
            {interests.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.name}>
                  <button
                    type="button"
                    onClick={() => onSelectInterest?.(item.name)}
                    className="px-4 lg:px-6 py-2 flex flex-col items-center text-center cursor-pointer group focus:outline-none transition-transform"
                    aria-label={`Explore ${item.name}`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 flex items-center justify-center ${item.color} group-hover:scale-125 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* 2-line Label */}
                    <div className="flex flex-col text-xs font-extrabold text-[#082B50] group-hover:text-[#F15A24] transition-colors leading-tight mt-1.5">
                      <span>{item.line1}</span>
                      <span>{item.line2}</span>
                    </div>
                  </button>

                  {/* Vertical Divider Line between items */}
                  {index < interests.length - 1 && (
                    <div
                      key={`divider-${index}`}
                      className="w-[1px] h-7 bg-slate-300/80 my-auto flex-shrink-0"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile View (< md) */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-2 md:hidden">
            {interests.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onSelectInterest?.(item.name)}
                  className="p-2 flex flex-col items-center text-center rounded-xl bg-white/70 backdrop-blur-xs border border-white/60 shadow-2xs group active:scale-95 transition-transform"
                >
                  <div className={`w-8 h-8 flex items-center justify-center ${item.color} mb-1`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-[11px] font-extrabold text-[#082B50] group-hover:text-[#F15A24] leading-tight">
                    <span>{item.line1}</span>
                    <span>{item.line2}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
