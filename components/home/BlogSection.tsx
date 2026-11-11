"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Blog } from "@/types/blog";

const DEFAULT_BLOGS: Blog[] = [
  {
    id: "b1111111-1111-4111-8111-111111111111",
    title: "Exploring the Magical Dal Lake and Snow Valleys of Kashmir",
    slug: "exploring-dal-lake-snow-valleys-kashmir",
    excerpt: "Glide on shikaras across serene Dal Lake, surrounded by floating gardens and snow-capped Himalayan peaks.",
    content: "Exploring the Magical Dal Lake and Snow Valleys of Kashmir",
    featured_image: "/images/blogs/kashmir-dal-lake.webp",
    category: "Himalayan Escapes",
    author_name: "TourTripHolidays Editorial",
    seo_title: null,
    seo_description: null,
    focus_keyword: null,
    image_alt: "Shikara on Dal Lake Srinagar with snow mountains background Kashmir",
    status: "PUBLISHED",
    published_at: "2026-11-01T10:00:00.000Z",
    created_at: "2026-11-01T10:00:00.000Z",
    updated_at: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    title: "Cruising the Emerald Backwaters and Coconut Lagoons of Kerala",
    slug: "cruising-emerald-backwaters-kerala",
    excerpt: "Experience tranquil luxury on traditional houseboats drifting along palms-fringed backwaters of Alleppey.",
    content: "Cruising the Emerald Backwaters and Coconut Lagoons of Kerala",
    featured_image: "/images/blogs/kerala-backwaters.webp",
    category: "Beach & Coastal",
    author_name: "TourTripHolidays Editorial",
    seo_title: null,
    seo_description: null,
    focus_keyword: null,
    image_alt: "Traditional houseboat gliding through Alleppey backwaters Kerala",
    status: "PUBLISHED",
    published_at: "2026-11-03T10:00:00.000Z",
    created_at: "2026-11-03T10:00:00.000Z",
    updated_at: "2026-11-03T10:00:00.000Z",
  },
  {
    id: "b3333333-3333-4333-8333-333333333333",
    title: "Royal Heritage: Magnificent Forts, Palaces & Desert Nights of Rajasthan",
    slug: "royal-heritage-forts-palaces-rajasthan",
    excerpt: "Step back into imperial history with grand sandstone citadels, intricate jharokhas, and desert culture.",
    content: "Royal Heritage: Magnificent Forts, Palaces & Desert Nights of Rajasthan",
    featured_image: "/images/blogs/rajasthan-royal-forts.webp",
    category: "Heritage & Culture",
    author_name: "TourTripHolidays Editorial",
    seo_title: null,
    seo_description: null,
    focus_keyword: null,
    image_alt: "Grand Rajasthan fortress illuminated at golden hour sunset",
    status: "PUBLISHED",
    published_at: "2026-11-05T10:00:00.000Z",
    created_at: "2026-11-05T10:00:00.000Z",
    updated_at: "2026-11-05T10:00:00.000Z",
  },
  {
    id: "b4444444-4444-4444-8444-444444444444",
    title: "Unwinding in Himachal: Pine Forests, Mountain Passes & Serene Vistas",
    slug: "unwinding-in-himachal-pine-forests-passes",
    excerpt: "Breathe crisp mountain air among alpine pines, winding scenic roads, and tranquil Himalayan settlements.",
    content: "Unwinding in Himachal: Pine Forests, Mountain Passes & Serene Vistas",
    featured_image: "/images/blogs/himachal-snow-valleys.webp",
    category: "Himalayan Escapes",
    author_name: "TourTripHolidays Editorial",
    seo_title: null,
    seo_description: null,
    focus_keyword: null,
    image_alt: "Evergreen pine forests and snow Himalayan peaks Himachal Pradesh",
    status: "PUBLISHED",
    published_at: "2026-11-07T10:00:00.000Z",
    created_at: "2026-11-07T10:00:00.000Z",
    updated_at: "2026-11-07T10:00:00.000Z",
  },
  {
    id: "b5555555-5555-4555-8555-555555555555",
    title: "Coastal Charm: Sun-Kissed Beaches, Historic Chapels & Sunsets in Goa",
    slug: "coastal-charm-beaches-sunsets-goa",
    excerpt: "Golden Arabian Sea shorelines, warm tropical breezes, Portuguese architecture, and coastal hospitality.",
    content: "Coastal Charm: Sun-Kissed Beaches, Historic Chapels & Sunsets in Goa",
    featured_image: "/images/blogs/goa-coastal-sunsets.webp",
    category: "Beach & Coastal",
    author_name: "TourTripHolidays Editorial",
    seo_title: null,
    seo_description: null,
    focus_keyword: null,
    image_alt: "Tropical Goa coastline with palm trees and sunset glow",
    status: "PUBLISHED",
    published_at: "2026-11-09T10:00:00.000Z",
    created_at: "2026-11-09T10:00:00.000Z",
    updated_at: "2026-11-09T10:00:00.000Z",
  },
  {
    id: "b6666666-6666-4666-8666-666666666666",
    title: "Spiritual Serenity: Timeless Ghats and Sacred Evening Aarti in Varanasi",
    slug: "spiritual-serenity-timeless-ghats-varanasi",
    excerpt: "Witness centuries of living spiritual heritage along ancient riverbanks illuminated by twilight diya lamps.",
    content: "Spiritual Serenity: Timeless Ghats and Sacred Evening Aarti in Varanasi",
    featured_image: "/images/blogs/varanasi-ganges-ghats.webp",
    category: "Spiritual Journeys",
    author_name: "TourTripHolidays Editorial",
    seo_title: null,
    seo_description: null,
    focus_keyword: null,
    image_alt: "Evening Ganga Aarti and floating diya lamps on Varanasi ghats",
    status: "PUBLISHED",
    published_at: "2026-11-11T10:00:00.000Z",
    created_at: "2026-11-11T10:00:00.000Z",
    updated_at: "2026-11-11T10:00:00.000Z",
  },
];

export default function BlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>(DEFAULT_BLOGS);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch("/api/blogs?limit=6");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBlogs(json.data.slice(0, 6));
        }
      } catch (e) {
        // Keep DEFAULT_BLOGS on any error
      }
    }
    loadBlogs();
  }, []);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white border-t border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3]">
              <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
              <span>TRAVEL STORIES & INSPIRATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
              Latest Travel <span className="text-[#F15A24]">Journals</span>
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium max-w-xl">
              Authentic glimpses and inspiring destination highlights from across Incredible India.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#F15A24] hover:text-[#d94815] transition-colors group self-start md:self-auto"
          >
            <span>Explore All Blogs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 6 Blog Cards Grid: Only Image & Heading */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#DCEAF3] shadow-xs hover:border-[#F15A24]/50 hover:shadow-md transition-all duration-300 flex flex-col group select-none h-full"
            >
              {/* Realistic Photo */}
              <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                {blog.featured_image && (
                  <Image
                    src={blog.featured_image}
                    alt={blog.image_alt || blog.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {blog.category && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#082B50] text-[10px] sm:text-xs font-bold border border-slate-200/80 shadow-xs max-w-[85%] truncate">
                    {blog.category}
                  </div>
                )}
              </div>

              {/* ONLY HEADING */}
              <div className="p-3 sm:p-5 md:p-6 flex-1 flex flex-col justify-center">
                <h3 className="text-xs sm:text-base md:text-lg font-bold sm:font-extrabold text-[#082B50] group-hover:text-[#F15A24] transition-colors leading-snug line-clamp-3">
                  {blog.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

