"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface DestinationsSectionProps {
  onSelectDestination?: (destination: string) => void;
}

interface DestinationCardItem {
  name: string;
  image: string;
  destinationValue: string;
  isSpecial?: boolean;
}

export default function DestinationsSection({ onSelectDestination }: DestinationsSectionProps) {
  const defaultDestinations: DestinationCardItem[] = [
    {
      name: "Jammu & Kashmir",
      image: "/images/destinations/kashmir.jpg",
      destinationValue: "Jammu & Kashmir",
    },
    {
      name: "Himachal Pradesh",
      image: "/images/destinations/himachal.jpg",
      destinationValue: "Himachal Pradesh (Manali / Shimla)",
    },
    {
      name: "Uttarakhand",
      image: "/images/destinations/uttarakhand.jpg",
      destinationValue: "Uttarakhand (Rishikesh / Nainital)",
    },
    {
      name: "Rajasthan",
      image: "/images/destinations/rajasthan.jpg",
      destinationValue: "Rajasthan (Jaipur / Udaipur)",
    },
    {
      name: "Kerala",
      image: "/images/destinations/kerala.jpg",
      destinationValue: "Kerala (Munnar / Alleppey)",
    },
    {
      name: "Goa",
      image: "/images/destinations/goa.jpg",
      destinationValue: "Goa",
    },
    {
      name: "Tamil Nadu",
      image: "/images/destinations/tamil-nadu.jpg",
      destinationValue: "Tamil Nadu & South India",
    },
    {
      name: "Assam",
      image: "/images/destinations/assam.jpg",
      destinationValue: "Assam & North East",
    },
    {
      name: "All 28 States",
      image: "/images/destinations/all-states.jpg",
      isSpecial: true,
      destinationValue: "All 28 States - Custom Tour",
    },
  ];

  const [destinations, setDestinations] = useState<DestinationCardItem[]>(defaultDestinations);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const fetchLiveDestinations = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("destinations")
          .select("name, cover_image, state, slug")
          .eq("status", "published")
          .limit(8);

        if (data && !error && data.length > 0) {
          const liveList: DestinationCardItem[] = data.map((d: any) => ({
            name: d.name,
            image: d.cover_image || "/images/destinations/kashmir.jpg",
            destinationValue: d.state || d.name,
          }));

          // Always append the special "All 28 States" card
          liveList.push({
            name: "All 28 States",
            image: "/images/destinations/all-states.jpg",
            isSpecial: true,
            destinationValue: "All 28 States - Custom Tour",
          });

          setDestinations(liveList);
        }
      } catch (err) {
        console.warn("Could not load live destinations from Supabase:", err);
      }
    };

    fetchLiveDestinations();
  }, []);

  const handleClick = (destValue: string) => {
    if (onSelectDestination) {
      onSelectDestination(destValue);
    }
  };

  return (
    <section id="destinations" className="py-12 sm:py-16 bg-[#FAFCFE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#082B50] tracking-tight">
            Explore India – All 28 States
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Plan your journey to any corner of India with our domestic tour packages.
          </p>
        </div>

        {/* Destination Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-3.5">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(dest.destinationValue)}
              className={`group relative rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block aspect-[3/4.2] cursor-pointer ${
                dest.isSpecial ? "ring-2 ring-[#F15A24]/70" : "border border-slate-200/90"
              }`}
            >
              {/* Destination Image */}
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                unoptimized={dest.image.startsWith("http")}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 12vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />

              {/* Dark Gradient Overlay for legible title */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  dest.isSpecial
                    ? "bg-gradient-to-t from-[#082B50]/95 via-[#082B50]/50 to-black/20"
                    : "bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90"
                }`}
              />

              {/* Card Label at bottom */}
              <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 text-center flex flex-col items-center justify-end z-10">
                <span className="text-[12px] sm:text-[13px] font-bold text-white leading-tight drop-shadow-md">
                  {dest.name}
                </span>

                {dest.isSpecial && (
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#F15A24] mt-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
