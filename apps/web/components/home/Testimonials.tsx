"use client";

import React from "react";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Rahul Mehta",
      city: "Delhi",
      avatar: "/images/testimonials/rahul.jpg",
      review:
        "“Our Kashmir trip was perfectly organized. Hotels, transport and sightseeing were excellent. Highly recommended!”",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      city: "Mumbai",
      avatar: "/images/testimonials/priya.jpg",
      review:
        "“We booked a Kerala package with TourTripHolidays and it was a wonderful experience. Great service and very supportive team.”",
      rating: 5,
    },
    {
      name: "Amit Verma",
      city: "Bengaluru",
      avatar: "/images/testimonials/amit.jpg",
      review:
        "“The Rajasthan tour was amazing. Well planned itinerary, comfortable stay and great coordination throughout the trip.”",
      rating: 5,
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#FAFCFE] border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            What Our Travelers Say
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Real experiences from our happy travelers.
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, City, Stars */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative w-13 h-13 rounded-full overflow-hidden border-2 border-[#F15A24] flex-shrink-0 shadow-xs">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="52px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#082B50] text-base leading-tight">
                      {t.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                      <MapPin className="w-3 h-3 text-[#F15A24]" />
                      <span>{t.city}</span>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm text-slate-700 leading-relaxed font-normal italic">
                  {t.review}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

