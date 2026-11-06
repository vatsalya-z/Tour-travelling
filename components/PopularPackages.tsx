"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Clock, Star } from "lucide-react";

interface PopularPackagesProps {
  onSelectPackage?: (packageName: string) => void;
}

export default function PopularPackages({ onSelectPackage }: PopularPackagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const packages = [
    {
      id: 1,
      title: "Kashmir Tour Package",
      duration: "5 Nights / 6 Days",
      image: "/images/packages/kashmir.jpg",
      rating: 4.9,
      reviews: 142,
      price: "₹18,999",
      destination: "Jammu & Kashmir",
    },
    {
      id: 2,
      title: "Himachal Tour Package",
      duration: "4 Nights / 5 Days",
      image: "/images/packages/himachal.jpg",
      rating: 4.8,
      reviews: 128,
      price: "₹14,499",
      destination: "Himachal Pradesh (Manali / Shimla)",
    },
    {
      id: 3,
      title: "Kerala Tour Package",
      duration: "5 Nights / 6 Days",
      image: "/images/packages/kerala.jpg",
      rating: 4.9,
      reviews: 195,
      price: "₹19,500",
      destination: "Kerala (Munnar / Alleppey)",
    },
    {
      id: 4,
      title: "Rajasthan Tour Package",
      duration: "5 Nights / 6 Days",
      image: "/images/packages/rajasthan.jpg",
      rating: 4.9,
      reviews: 164,
      price: "₹17,800",
      destination: "Rajasthan (Jaipur / Udaipur)",
    },
    {
      id: 5,
      title: "Goa Tour Package",
      duration: "3 Nights / 4 Days",
      image: "/images/packages/goa.jpg",
      rating: 4.7,
      reviews: 210,
      price: "₹11,999",
      destination: "Goa",
    },
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCardClick = (dest: string) => {
    if (onSelectPackage) {
      onSelectPackage(dest);
    }
  };

  const ViewAllButton = () => {
    if (onSelectPackage) {
      return (
        <button
          onClick={() => onSelectPackage("All 28 States - Custom Tour")}
          className="inline-flex items-center gap-2 bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
        >
          <span>View All Packages</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      );
    }
    return (
      <a
        href="#packages"
        className="inline-flex items-center gap-2 bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 group"
      >
        <span>View All Packages</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    );
  };

  return (
    <section id="packages" className="py-14 sm:py-18 bg-white border-b border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Callout Column */}
          <div className="lg:col-span-3 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
            <h3 className="text-2xl sm:text-3xl font-black text-[#082B50] leading-tight">
              Our 20 Most Popular
            </h3>
            <h4 className="text-2xl sm:text-3xl font-black text-[#F15A24] leading-tight mt-0.5">
              Tour Packages
            </h4>
            <p className="text-sm text-slate-600 font-medium mt-3 mb-2 lg:mb-6 leading-relaxed max-w-md mx-auto lg:mx-0">
              Handpicked domestic holidays across India&apos;s top destinations.
            </p>

            <div className="hidden lg:block">
              <ViewAllButton />
            </div>
          </div>

          {/* Right Carousel Column */}
          <div className="lg:col-span-9 relative">
            {/* Left Carousel Arrow (Desktop Only) */}
            <button
              onClick={() => scroll("left")}
              aria-label="Previous Package"
              className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#F15A24] text-white items-center justify-center shadow-md hover:bg-[#d94815] transition-all hover:scale-105 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Right Carousel Arrow (Desktop Only) */}
            <button
              onClick={() => scroll("right")}
              aria-label="Next Package"
              className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#F15A24] text-white items-center justify-center shadow-md hover:bg-[#d94815] transition-all hover:scale-105 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleCardClick(pkg.destination)}
                  className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Package Image */}
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      sizes="260px"
                      className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs text-xs font-bold text-[#082B50]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{pkg.rating}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <h5 className="font-extrabold text-[#082B50] text-sm sm:text-[15px] leading-snug group-hover:text-[#F15A24] transition-colors">
                        {pkg.title}
                      </h5>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F15A24]" />
                        <span>{pkg.duration}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Starting from</span>
                      <span className="text-sm font-black text-[#082B50]">
                        {pkg.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile & Tablet Controls (Buttons centered at the bottom of the section) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-6 lg:hidden">
              {/* Carousel Navigation Arrows */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  aria-label="Previous Package"
                  className="w-10 h-10 rounded-full bg-[#F15A24] text-white flex items-center justify-center shadow-md hover:bg-[#d94815] active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  aria-label="Next Package"
                  className="w-10 h-10 rounded-full bg-[#F15A24] text-white flex items-center justify-center shadow-md hover:bg-[#d94815] active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* View All Packages CTA Button */}
              <div>
                <ViewAllButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
