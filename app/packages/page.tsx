"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  Headphones,
  SlidersHorizontal,
  X,
} from "lucide-react";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import EnquiryModal from "@/components/shared/EnquiryModal";
import FloatingContact from "@/components/shared/FloatingContact";
import MobileBottomBar from "@/components/shared/MobileBottomBar";
import { Tour } from "@/types/tour";
import { formatCurrency } from "@/lib/utils";

function TourPackagesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "duration">("newest");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTourName, setSelectedTourName] = useState("");

  // Sync search param changes from URL
  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) {
      setSearchQuery(s);
    }
  }, [searchParams]);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Public GET /api/tours returns only published packages
      const res = await fetch("/api/tours?limit=100");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setTours(json.data);
      } else {
        throw new Error(json.error || json.message || "Failed to load packages.");
      }
    } catch (err: unknown) {
      console.error("Error fetching packages:", err);
      setError(err instanceof Error ? err.message : "Failed to load tour packages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tours.forEach((t) => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set);
  }, [tours]);

  // Filtered & Sorted Tours
  const filteredTours = useMemo(() => {
    return tours
      .filter((tour) => {
        // Enforce published status
        if (tour.status !== "published") return false;

        const destName = tour.destination?.name || tour.state || "";
        const matchesSearch =
          !searchQuery.trim() ||
          tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          destName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.category?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" ||
          tour.category?.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const priceA = a.discounted_price || a.price || 0;
        const priceB = b.discounted_price || b.price || 0;

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "duration") return b.days - a.days;
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      });
  }, [tours, searchQuery, selectedCategory, sortBy]);

  const handleOpenEnquiry = (tourName: string) => {
    setSelectedTourName(tourName);
    setModalOpen(true);
  };

  return (
    <>
      {/* ===================================================================
          1. FULL WIDTH HERO BANNER (100% Viewport Width)
          - Atmospheric Himalayan background image with deep navy gradient overlay
          - Breadcrumb navigation, promotional pill badges, grand typography
          - Key trust metrics & live packages count
          =================================================================== */}
      <section className="relative w-full overflow-hidden bg-[#082B50] text-white">
        {/* Full-bleed Panoramic Scenic Background Image */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden">
          <Image
            src="/images/packages/goa.jpg"
            alt="Scenic Mountains Landscape Background"
            fill
            priority
            sizes="100vw"
            className="object-fit object-center w-full h-full "
          />
       
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
          {/* Breadcrumb Navigation Pill */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <nav
              aria-label="Breadcrumb"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200"
            >
              <Link href="/" className="hover:text-[#F15A24] transition-colors font-medium">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#F15A24] font-semibold">Tour Packages</span>
            </nav>


          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Main Hero Typography */}
            <div className="lg:col-span-8 text-center sm:text-left">

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.15]">
                Explore India’s Most Popular{" "}
                <span className="text-[#F15A24] block sm:inline">Tour Packages</span>
              </h1>

              {/* Sub-headline / Description */}
              <p className="text-xs sm:text-base text-slate-200 mt-4 max-w-2xl leading-relaxed justify-center items-center">
                From the snow-capped mountains of Kashmir to the tropical backwaters of Kerala and regal forts of Rajasthan.
                Handcrafted domestic holidays with premium stays, certified local guides, and guaranteed best prices.
              </p>

              {/* Trust Feature Highlights Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/15">
                <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                  <div className="w-7 h-7 rounded-full bg-[#F15A24]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#F15A24]" />
                  </div>
                  <span>All 28 States</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                  <div className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-3.5 h-3.5 text-[#25D366]" />
                  </div>
                  <span>Best Price Assured</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                  <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span>Verified Stays</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                  <div className="w-7 h-7 rounded-full bg-sky-400/20 flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <span>24/7 On-Trip Help</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. FLOATING SEARCH & FILTER BAR
          - Overlaps the hero bottom for modern visual depth
          - Search by tour name/destination, filter by category, and sorting
          =================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E5EAF1] p-4 sm:p-5 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
            {/* Search Box */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by tour name, destination, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl text-[#172B4D] placeholder-[#94A3B8] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl text-[#172B4D] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] cursor-pointer font-medium"
              >
                <option value="all">All Tour Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c} Packages
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl text-[#172B4D] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] cursor-pointer font-medium"
              >
                <option value="newest">Sort: Newly Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration">Duration: Longest First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. MAIN CONTENT: PACKAGE CARDS GRID & STATES
          - 4 States: Loading, Error, Empty, and Success Grid (3 Desktop, 2 Tablet, 1 Mobile)
          =================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* 1. LOADING STATE: Skeleton Cards */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#E5EAF1] overflow-hidden shadow-xs animate-pulse flex flex-col"
              >
                <div className="aspect-[16/10] w-full bg-slate-200" />
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 w-24 bg-slate-200 rounded-full" />
                      <div className="h-5 w-20 bg-slate-200 rounded-full" />
                    </div>
                    <div className="h-5 bg-slate-200 rounded-md w-4/5" />
                    <div className="h-3.5 bg-slate-100 rounded-md w-full" />
                    <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="h-6 w-20 bg-slate-200 rounded-md" />
                    <div className="h-8 w-28 bg-slate-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="py-20 text-center max-w-md mx-auto bg-white rounded-2xl border border-red-100 p-8 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#082B50] font-display">
              Unable to Load Tour Packages
            </h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed mb-5">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchTours}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F15A24] hover:bg-[#d94815] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && filteredTours.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto bg-white rounded-2xl border border-[#E5EAF1] p-8 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#EAF6FC] text-[#082B50] flex items-center justify-center mx-auto mb-4">
              <Compass className="w-7 h-7 text-[#082B50]" />
            </div>
            <h3 className="text-base font-bold text-[#082B50] font-display">
              No Tour Packages Available
            </h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              {searchQuery || selectedCategory !== "all"
                ? "No packages matched your filters. Try clearing your search query or choosing another category."
                : "No tour packages are available right now. Please check back soon."}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#082B50] text-white text-xs font-semibold hover:bg-[#123F68] transition-colors cursor-pointer"
              >
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}

        {/* 4. SUCCESS STATE: Responsive Card Grid (Desktop: 3, Tablet: 2, Mobile: 1) */}
        {!loading && !error && filteredTours.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredTours.map((tour) => {
              const destinationName = tour.destination?.name || tour.state || "India";
              const hasDiscount =
                tour.discounted_price !== null &&
                tour.discounted_price !== undefined &&
                Number(tour.discounted_price) > 0 &&
                Number(tour.discounted_price) < Number(tour.price);

              const discountPercent = hasDiscount
                ? Math.round(
                    ((Number(tour.price) - Number(tour.discounted_price)) /
                      Number(tour.price)) *
                      100
                  )
                : 0;

              const displayPrice = hasDiscount ? tour.discounted_price : tour.price;

              return (
                <article
                  key={tour.id}
                  className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Tour Cover Image (100% Dynamic from Backend) */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 flex-shrink-0">
                    {tour.cover_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={tour.cover_image}
                        alt={tour.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
                        <Compass className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-500">
                          {tour.name}
                        </span>
                      </div>
                    )}

                    {/* Top Badges (100% Dynamic from Backend) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      {hasDiscount ? (
                        <span className="bg-[#F15A24] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                          {discountPercent}% OFF
                        </span>
                      ) : tour.category ? (
                        <span className="bg-[#082B50]/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          {tour.category}
                        </span>
                      ) : (
                        <span />
                      )}

                      <span className="bg-white/95 backdrop-blur-xs text-[#082B50] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#16A36A]" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body (100% Dynamic from Backend) */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Destination & Duration Chips */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        {destinationName && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#082B50] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full">
                            <MapPin className="w-3 h-3 text-[#F15A24] flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{destinationName}</span>
                          </span>
                        )}

                        {(tour.days || tour.nights) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-[#F15A24] flex-shrink-0" />
                            <span>
                              {tour.days} Days / {tour.nights} Nights
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Package Name */}
                      <h2 className="font-extrabold text-[#082B50] text-base group-hover:text-[#F15A24] transition-colors line-clamp-2 leading-snug">
                        {tour.name}
                      </h2>

                      {/* Short Description */}
                      {(tour.short_description || tour.description) && (
                        <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                          {tour.short_description || tour.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing and Action Row */}
                    <div className="mt-5 pt-3.5 border-t border-[#E5EAF1] flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                          Starting Price
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-lg font-black text-[#082B50]">
                            {formatCurrency(displayPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatCurrency(tour.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Details / Enquire Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEnquiry(tour.name)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#082B50] hover:bg-[#F15A24] text-white text-xs font-bold transition-all shadow-xs group/btn cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDestination={selectedTourName}
      />
    </>
  );
}

export default function TourPackagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-16 md:pb-0 font-sans text-[#172B4D]">
      {/* Top Notification Bar */}
      <TopBar />

      {/* Main Navigation Header */}
      <Header />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-xs text-[#64748B]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#F15A24]" />
              Loading tour packages...
            </div>
          }
        >
          <TourPackagesContent />
        </Suspense>
      </main>

      {/* Dark Navy Footer */}
      <Footer />

      {/* Floating WhatsApp & Call Buttons */}
      <FloatingContact />

      {/* Mobile Sticky Bottom Action Bar */}
      <MobileBottomBar />
    </div>
  );
}
