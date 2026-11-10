"use client";

import React from "react";
import Image from "next/image";
import { Mountain, Landmark, Waves, Trees, Sun, Compass } from "lucide-react";

export default function ExploreIndia() {
  const experiences = [
    {
      title: "Mountain Escapes",
      description:
        "Majestic snow-clad peaks, pine-scented valleys, and serene hill stations across Kashmir, Himachal Pradesh, and Uttarakhand.",
      image: "/images/about/mountain-escape.webp",
      alt: "Snow-capped Himalayan mountain peaks and pine valleys - TourTripHolidays",
      icon: Mountain,
    },
    {
      title: "Cultural Experiences",
      description:
        "Grand palaces, historic forts, vibrant folk arts, and centuries-old architectural heritage of Rajasthan and Central India.",
      image: "/images/about/cultural-experience.webp",
      alt: "Historic Indian royal architecture and carved stone palace arches - TourTripHolidays",
      icon: Landmark,
    },
    {
      title: "Beach Destinations",
      description:
        "Golden sun-kissed sands, swaying coconut palms, and tranquil coastal breezes across Goa, Kerala, and Andaman shores.",
      image: "/images/about/beach-destination.webp",
      alt: "Pristine tropical beach with golden sands and coconut palms in Goa - TourTripHolidays",
      icon: Waves,
    },
    {
      title: "Wildlife and Nature",
      description:
        "Thrilling jungle safaris, protected tiger reserves, and dense biodiversity in Corbett, Ranthambore, and Kaziranga.",
      image: "/images/about/wildlife-nature.webp",
      alt: "Royal Bengal tiger in lush natural Indian forest - TourTripHolidays",
      icon: Trees,
    },
    {
      title: "Spiritual Journeys",
      description:
        "Sacred river ghats, ancient temple towns, peaceful ashrams, and timeless spiritual traditions in Varanasi and Rishikesh.",
      image: "/images/about/spiritual-journey.webp",
      alt: "Evening Ganga Aarti and glowing diya lamps along sacred river ghats - TourTripHolidays",
      icon: Sun,
    },
    {
      title: "Adventure Travel",
      description:
        "Exciting river rafting, high-altitude trekking, desert camping, and adrenaline-filled outdoor expeditions across India.",
      image: "/images/about/adventure-travel.webp",
      alt: "White water river rafting adventure in Rishikesh Himalayas - TourTripHolidays",
      icon: Compass,
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3]">
            <span>EXPERIENCE INCREDIBLE INDIA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            Explore the Beauty of <span className="text-[#F15A24]">India</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            From towering Himalayan peaks to tropical coastlines and vibrant heritage, discover diverse travel experiences planned with care.
          </p>
        </div>

        {/* 6 Clean Image Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {experiences.map((exp, idx) => {
            const Icon = exp.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-[#DCEAF3] shadow-xs hover:border-[#F15A24]/40 hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Natural 4:3 Aspect Ratio */}
                <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                  <Image
                    src={exp.image}
                    alt={exp.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500 select-none"
                  />
                  {/* Subtle Top-Left Category Badge */}
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white text-[#082B50] text-xs font-bold border border-slate-200/80 shadow-xs flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#F15A24]" />
                    <span>{exp.title}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-start">
                  <h3 className="text-lg font-extrabold text-[#082B50] group-hover:text-[#F15A24] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {exp.description}
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
