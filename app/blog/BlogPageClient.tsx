"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, Compass, BookOpen, RefreshCw } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0 font-sans">
      {/* TopBar & Navigation Header */}
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Blog Header / Hero with Scenic Background Image */}
        <section className="relative w-full sm:h-[600px] py-12 sm:py-16 md:py-20 lg:py-24 text-white overflow-hidden">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 ">
            <Image
              src="/images/blogs/blog-hero-banner.webp"
              alt="Incredible India Travel Journal"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Dark gradient overlay for high contrast, legibility and elegance */}
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 flex flex-col items-center">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4 border border-white/20 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
              <span>TOURTRIPHOLIDAYS TRAVEL JOURNAL</span>
            </div>

            {/* Main Heading (Centered & Mobile Responsive) */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.2] max-w-3xl">
              Incredible India, <span className="text-[#F15A24]">Story by Story</span>
            </h1>

            {/* Subtitle (Centered & Mobile Responsive) */}
            <p className="mt-3 sm:mt-4 text-xs sm:text-base md:text-lg text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
              Explore authentic travel guides, seasonal packing tips, regional traditions, and thoughtfully crafted domestic itineraries across India.
            </p>

            {/* Search Input Bar (Centered & Full Width on mobile up to max-w-xl) */}
           
          </div>
        </section>

        {/* Category Filter Pills & Content Section */}
        <section className="py-8 sm:py-12 md:py-14 bg-[#F5F8FC]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            {/* Category Filter Pills (Mobile Scrollable) */}
            

            {/* Articles Grid (2 cols mobile, 2 cols tablet, 3 cols desktop) */}
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
