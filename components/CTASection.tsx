"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  onOpenEnquiry?: () => void;
}

export default function CTASection({ onOpenEnquiry }: CTASectionProps) {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl min-h-[180px] sm:min-h-[200px] flex items-center">
          {/* Panoramic Himalayan Mountains Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banners/cta-mountains.jpg"
              alt="Majestic Himalayan Mountains"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Deep Navy/Blue Atmospheric Overlay for Crisp White Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#082B50]/95 via-[#082B50]/80 to-[#123F68]/75" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 w-full px-6 py-8 sm:px-12 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Ready to Explore Incredible India?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-200 font-medium">
                Get a customized domestic tour package as per your travel dates, budget and preferences.
              </p>
            </div>

            <div className="flex-shrink-0">
              {onOpenEnquiry ? (
                <button
                  onClick={onOpenEnquiry}
                  className="inline-flex items-center gap-2.5 bg-[#F15A24] hover:bg-[#d94815] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group whitespace-nowrap cursor-pointer"
                >
                  <span>Get a Free Travel Plan</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
              ) : (
                <a
                  href="#packages"
                  className="inline-flex items-center gap-2.5 bg-[#F15A24] hover:bg-[#d94815] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group whitespace-nowrap"
                >
                  <span>Get a Free Travel Plan</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
