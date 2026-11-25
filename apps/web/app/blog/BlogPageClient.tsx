"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Compass, BookOpen, RefreshCw, ArrowRight } from "lucide-react";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import EnquiryModal from "@/components/shared/EnquiryModal";
import FloatingContact from "@/components/shared/FloatingContact";
import MobileBottomBar from "@/components/shared/MobileBottomBar";
import BlogCard from "@/components/blog/BlogCard";
import { Blog } from "@/types/blog";
import { DEFAULT_BLOGS } from "@/lib/blog-default-data";

export default function BlogPageClient() {
  const [blogs, setBlogs] = useState<Blog[]>(DEFAULT_BLOGS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch("/api/blogs?limit=50");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBlogs(json.data);
        }
      } catch (err) {
        console.warn("Failed to load published blogs:", err);
      }
    }
    loadBlogs();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) {
        set.add(b.category.trim());
      }
    });
    return ["all", ...Array.from(set)];
  }, [blogs]);

  // Filtered blogs
  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q) ||
        (b.author_name || "").toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all" || b.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-24 md:pb-0 font-sans">
      {/* TopBar & Navigation Header */}
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Blog Header / Hero Banner - 100% Full Width Panoramic */}
        <section className="relative w-full min-h-[360px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[580px] flex items-center justify-center py-16 sm:py-24 md:py-28 lg:py-32 text-white overflow-hidden bg-[#082B50]">
          {/* Background Image & High Contrast Gradient Overlay (100% Full Width Edge-to-Edge) */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/images/blogs/blog-hero-banner.webp"
              alt="Incredible India Travel Journal"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center w-full h-full select-none"
            />
            {/* Cinematic dark gradient overlay for crystal clear contrast & legibility across 100% full width */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#082B50] via-[#082B50]/75 to-black/55" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-4 sm:mb-5 border border-white/20 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
              <span>TOURTRIPHOLIDAYS TRAVEL JOURNAL</span>
            </div>

            {/* Main Heading (Full Width Expansive & Centered) */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] w-full max-w-5xl">
              Incredible India, <span className="text-[#F15A24]">Story by Story</span>
            </h1>

            {/* Subtitle (Full Width & Centered) */}
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl lg:text-2xl text-slate-100 font-medium w-full max-w-4xl mx-auto leading-relaxed">
              Explore authentic travel guides, seasonal packing tips, regional traditions, and thoughtfully crafted domestic itineraries across all 28 states of India.
            </p>
          </div>
        </section>

        {/* Category Filter Pills & Content Section */}
        <section className="py-10 sm:py-14 md:py-18 bg-[#F5F8FC]">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
            {/* Section Header - Centered for both mobile & desktop */}
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3]">
                <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
                <span>TRAVEL STORIES & INSPIRATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
                Authentic Glimpses of <span className="text-[#F15A24]">India</span>
              </h2>
              <p className="mt-2 text-slate-600 text-xs sm:text-base font-medium max-w-2xl mx-auto">
                Handcrafted travel highlights, cultural insights, and inspiring destination stories from across Incredible India.
              </p>
            </div>

            {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto touch-scroll no-scrollbar pb-3 mb-6 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const label = cat === "all" ? "All Stories" : cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all min-h-[38px] active:scale-95 cursor-pointer ${
                        isSelected
                          ? "bg-[#082B50] text-white shadow-sm"
                          : "bg-white text-slate-700 border border-[#DCEAF3] hover:border-[#082B50]/30"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mobile Responsive Grid: 2 columns on mobile, 2 cols on tablet, 3 cols on desktop */}
            {loading ? (
              <div className="py-16 sm:py-20 text-center text-xs text-slate-500">
                <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-[#082B50] animate-spin mx-auto mb-3" />
                <p className="font-semibold text-sm text-[#082B50]">Loading Travel Stories...</p>
                <p className="mt-1">Fetching the latest published articles for you.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 sm:py-20 px-4 text-center max-w-md mx-auto">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-[#CBD5E1] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#082B50]">No Articles Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "No published articles match your current search or category filter."
                    : "New destination guides and travel stories will appear here soon."}
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#082B50] text-white text-xs font-semibold hover:bg-[#123F68] transition-colors cursor-pointer"
                  >
                    <span>Clear Search Filters</span>
                  </button>
                )}
              </div>
            ) : (
              /* Responsive Grid: 2 cards mobile, 2 cards tablet, 3 cards desktop */
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                {filtered.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}

            {/* Centered CTA Button Below Section (Mobile & Desktop) */}
            <div className="mt-10 sm:mt-14 text-center">
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#082B50] hover:bg-[#F15A24] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <span>Explore All Tour Packages</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer & Global Modals */}
      <Footer />
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDestination="Custom Holiday"
      />
      <FloatingContact />
      <MobileBottomBar onOpenEnquiry={() => setModalOpen(true)} />
    </div>
  );
}
