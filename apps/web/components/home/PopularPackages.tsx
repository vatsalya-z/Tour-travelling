"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEFAULT_TOURS } from "@/lib/tour-default-data";

interface PackageItem {
  id: string | number;
  slug: string;
  title: string;
  image: string;
}

export default function PopularPackages() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultPackages: PackageItem[] = DEFAULT_TOURS.slice(0, 6).map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.name,
    image: t.cover_image || "/images/packages/kashmir-4n5d-cover.webp",
  }));

  const [packages, setPackages] = useState<PackageItem[]>(defaultPackages);

  useEffect(() => {
    const fetchPublishedTours = async () => {
      try {
        const res = await fetch("/api/tours?limit=20");
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const livePackages: PackageItem[] = json.data.map((t: any) => ({
            id: t.id,
            slug: t.slug,
            title: t.name,
            image: t.cover_image || "/images/packages/kashmir-4n5d-cover.webp",
          }));
          setPackages(livePackages);
          return;
        }

        // Fallback to client query if needed
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data } = await supabase
            .from("tours")
            .select("id, name, slug, cover_image")
            .eq("status", "published")
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            const livePackages: PackageItem[] = data.map((t: any) => ({
              id: t.id,
              slug: t.slug,
              title: t.name,
              image: t.cover_image || "/images/packages/kashmir-4n5d-cover.webp",
            }));
            setPackages(livePackages);
          }
        }
      } catch (err) {
        console.warn("Could not fetch published tours:", err);
      }
    };

    fetchPublishedTours();
  }, []);

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

  const ViewAllButton = () => {
    return (
      <Link
        href="/packages"
        className="inline-flex items-center gap-2 bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 group"
      >
        <span>View All Packages</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  };

  return (
    <section id="packages" className="py-14 sm:py-18 bg-white border-b border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Callout Column */}
          <div className="lg:col-span-3 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
            <h3 className="text-2xl sm:text-3xl font-black text-[#082B50] leading-tight">
              Our Most Popular
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
                  className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* 1. Package Cover Image */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      unoptimized={pkg.image.startsWith("http")}
                      sizes="260px"
                      className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* 2. Package Name & 3. View Details Button */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <h5 className="font-extrabold text-[#082B50] text-sm sm:text-[15px] leading-snug group-hover:text-[#F15A24] transition-colors line-clamp-2 min-h-[40px]">
                      {pkg.title}
                    </h5>

                    <Link
                      href={`/tours/${pkg.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full bg-[#082B50] hover:bg-[#F15A24] text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors group/btn shadow-xs cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile & Tablet Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-6 lg:hidden">
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
