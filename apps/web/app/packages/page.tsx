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
  ShieldCheck,
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
import { EnquiryPackageInfo } from "@/types/lead";

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
  const [selectedPackageInfo, setSelectedPackageInfo] = useState<EnquiryPackageInfo | undefined>(undefined);

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

  // Location-aware Hero Configuration based on active search / destination
  const heroConfig = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (q.includes("odisha") || q.includes("puri") || q.includes("konark") || q.includes("bhubaneswar")) {
      return {
        locationKey: "odisha",
        tag: "SOUL OF ODISHA · TEMPLE ARCHITECTURE, ART & NATURE",
        title: "Explore Soulful Odisha",
        highlight: "Tour Packages",
        description:
          "Discover ancient Kalinga temple architecture, Konark Sun Temple, Raghurajpur artisan villages, Sambalpuri Ikat handlooms, Chilika wetland birds, and pristine golden beaches.",
        image: "/images/packages/packages-hero-odisha.webp",
        alt: "Realistic panoramic view of Odisha Konark Sun Temple and Heritage",
        breadcrumb: "Odisha",
        badgeStyle: "bg-amber-500/20 text-amber-200 border-amber-400/30",
      };
    }

    if (q.includes("kashmir") || q.includes("srinagar") || q.includes("gulmarg") || q.includes("pahalgam")) {
      return {
        locationKey: "kashmir",
        tag: "PARADISE ON EARTH · WINTER & SUMMER SPECIALS",
        title: "Explore Handcrafted Kashmir",
        highlight: "Tour Packages",
        description:
          "Glide on Dal Lake shikaras, ride the high-altitude Gulmarg Gondola over snowy pines, and explore Sonamarg glaciers and lush Pahalgam valleys with certified local guides.",
        image: "/images/packages/packages-hero-kashmir.webp",
        alt: "Realistic scenic panoramic view of Kashmir snow mountains and valleys",
        breadcrumb: "Kashmir",
        badgeStyle: "bg-sky-500/20 text-sky-200 border-sky-400/30",
      };
    }

    return {
      locationKey: "india",
      tag: "HANDCRAFTED DOMESTIC HOLIDAYS · 28 STATES OF INDIA",
      title: "Explore India’s Most Popular",
      highlight: "Tour Packages",
      description:
        "From the golden temples & craft villages of Odisha and snow-capped peaks of Kashmir to the backwaters of Kerala and regal forts of Rajasthan. Premium stays, certified guides, and best price guarantee.",
      image: "/images/packages/packages-hero-banner.jpg",
      alt: "Scenic Indian Mountain Landscape and Travel Packages",
      breadcrumb: null,
      badgeStyle: "bg-white/10 text-slate-200 border-white/15",
    };
  }, [searchQuery]);

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

  // Featured Kashmir Winter Packages
  const kashmirTours = useMemo(() => {
    return tours.filter((tour) => {
      if (tour.status !== "published") return false;
      const dName = (tour.destination?.name || tour.state || "").toLowerCase();
      const tName = tour.name.toLowerCase();
      return dName.includes("kashmir") || tName.includes("kashmir");
    });
  }, [tours]);

  // Featured Odisha Tours (Culture • Art • Craft • Heritage • Nature)
  const odishaTours = useMemo(() => {
    return tours
      .filter((tour) => {
        if (tour.status !== "published") return false;
        const dName = (tour.destination?.name || "").toLowerCase();
        const sName = (tour.state || "").toLowerCase();
        const tName = tour.name.toLowerCase();
        return sName.includes("odisha") || dName.includes("odisha") || tName.includes("odisha");
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      })
      .slice(0, 6);
  }, [tours]);

  const handleOpenEnquiry = (tour: Tour | string, sourceCta?: string) => {
    if (typeof tour === "string") {
      setSelectedTourName(tour);
      setSelectedPackageInfo({
        tourName: tour,
        destinationName: tour,
        sourcePage: "/packages",
        sourceCta: sourceCta || "Tour Packages Listing",
      });
    } else {
      setSelectedTourName(tour.name);
      setSelectedPackageInfo({
        tourId: tour.id,
        tourName: tour.name,
        tourSlug: tour.slug,
        destinationId: tour.destination_id || null,
        destinationName: tour.destination?.name || tour.state || tour.name,
        packagePrice: tour.discounted_price || tour.price,
        packageImage: tour.cover_image || null,
        packageUrl: typeof window !== "undefined" ? `${window.location.origin}/packages#${tour.slug}` : undefined,
        sourcePage: "/packages",
        sourceCta: sourceCta || "Tour Packages Listing Card",
      });
    }
    setModalOpen(true);
  };

  const renderTourCard = (tour: Tour) => {
    return (
      <article
        key={tour.id}
        className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex flex-col overflow-hidden group"
      >
        {/* 1. Package Cover Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden flex-shrink-0 bg-slate-100">
          {tour.cover_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={tour.cover_image}
              alt={tour.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#082B50]/5 via-orange-500/5 to-slate-100 p-3 sm:p-4 text-center relative group-hover:scale-105 transition-transform duration-500">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white shadow-xs flex items-center justify-center mb-1.5 sm:mb-2 text-[#082B50] group-hover:text-[#F15A24] transition-colors">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#082B50] line-clamp-1 max-w-[90%]">
                {tour.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {tour.days}D / {tour.nights}N • {tour.state || "Tour Package"}
              </span>
            </div>
          )}
        </div>

        {/* 2. Package Name & 3. View Details Button */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-3">
          <h2 className="font-bold sm:font-extrabold text-[#082B50] text-xs sm:text-base group-hover:text-[#F15A24] transition-colors line-clamp-2 leading-snug min-h-[34px] sm:min-h-0">
            {tour.name}
          </h2>

          <div className="mt-2 pt-3 border-t border-[#E5EAF1]">
            <Link
              href={`/tours/${tour.slug}`}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-2.5 sm:py-2 rounded-xl bg-[#082B50] hover:bg-[#F15A24] text-white text-xs sm:text-sm font-bold transition-all shadow-xs group/btn cursor-pointer w-full text-center min-h-[44px] active:scale-95"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    );
  };

  return (
    <>
      
      <section className="relative w-full overflow-hidden bg-[#082B50] text-white">
        {/* Full-bleed Panoramic Scenic Background Image */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden">
          <Image
            key={heroConfig.image}
            src={heroConfig.image}
            alt={heroConfig.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center w-full h-full transition-all duration-700 ease-in-out"
          />
          {/* Flat translucent backdrop without gradients */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content Container - Broad & Expansive Full-width Layout */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-20 lg:py-28 min-h-[280px] sm:min-h-[440px] lg:min-h-[500px] flex flex-col justify-center items-center">
          {/* Breadcrumb Navigation Pill - Hidden on mobile view, visible on tablet & desktop */}
          <div className="hidden sm:flex items-center justify-center gap-2 mb-3 sm:mb-6">
            <nav
              aria-label="Breadcrumb"
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200"
            >
              <Link href="/" className="hover:text-[#F15A24] transition-colors font-medium">
                Home
              </Link>
              <span className="text-slate-400 text-xs">/</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-[#F15A24] transition-colors font-semibold cursor-pointer"
              >
                Tour Packages
              </button>
              {heroConfig.breadcrumb && (
                <>
                  <span className="text-slate-400 text-xs">/</span>
                  <span className="text-[#F15A24] font-semibold">{heroConfig.breadcrumb}</span>
                </>
              )}
            </nav>
          </div>

          <div className="w-full max-w-6xl mx-auto text-center flex flex-col items-center">
            {/* Dynamic Location Badge - No react-lucide icon */}
            <div
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3.5 sm:mb-4 border backdrop-blur-md shadow-xs transition-all duration-300 ${heroConfig.badgeStyle}`}
            >
              <span>{heroConfig.tag}</span>
            </div>

            {/* Main Headline (Expansive & Grand Width) */}
            <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display tracking-tight text-white leading-[1.15] text-center w-full max-w-5xl">
              {heroConfig.title}{" "}
              <span className="text-[#F15A24] block sm:inline">{heroConfig.highlight}</span>
            </h1>

            {/* Sub-headline / Description */}
            <p className="text-xs sm:text-base md:text-lg text-slate-100 mt-2.5 sm:mt-5 max-w-4xl mx-auto leading-relaxed text-center font-normal">
              {heroConfig.description}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. FLOATING SEARCH & FILTER BAR
          - Clean spacing below hero on mobile, sleek overlap on desktop
          - Search by tour name/destination, filter by category, and sorting
          =================================================================== */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 mt-4 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl border border-[#E5EAF1] p-3.5 sm:p-5 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3.5 items-center">
            {/* Search Box */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by tour name, destination, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-3 sm:py-2.5 text-[16px] sm:text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl text-[#172B4D] placeholder-[#94A3B8] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] transition-all font-medium min-h-[44px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-3 sm:py-2.5 text-[16px] sm:text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl text-[#172B4D] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] cursor-pointer font-medium min-h-[44px]"
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
                className="w-full px-3.5 py-3 sm:py-2.5 text-[16px] sm:text-xs bg-[#F8FAFC] border border-[#E5EAF1] rounded-xl text-[#172B4D] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] cursor-pointer font-medium min-h-[44px]"
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
          3. MAIN CONTENT: ALL TOUR PACKAGES (MOVED UPPER)
          - Placed directly after search & filter bar
          - Heading centered for both mobile & desktop
          - Responsive Grid: 2 columns on mobile, 2 on tablet, 3 on desktop
          - Centered CTA button at the bottom of the section
          =================================================================== */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 py-10 sm:py-14">
        {/* Section Heading - Centered for Mobile & Desktop */}
        {!loading && !error && filteredTours.length > 0 && (
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-2.5 border border-[#DCEAF3]">
              <Compass className="w-3.5 h-3.5 text-[#F15A24]" />
              <span>HANDCRAFTED HOLIDAY PACKAGES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#082B50] font-display tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : "All Tour Packages"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 max-w-xl mx-auto">
              Showing {filteredTours.length} verified {filteredTours.length === 1 ? "tour package" : "tour packages"} across Incredible India. Premium stays, guided tours, and guaranteed best prices.
            </p>
          </div>
        )}

        {/* 1. LOADING STATE: Skeleton Cards (2-col Mobile Grid) */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-7">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl border border-[#E5EAF1] overflow-hidden shadow-xs animate-pulse flex flex-col"
              >
                <div className="aspect-[16/10] w-full bg-slate-200" />
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="h-3.5 sm:h-5 w-14 sm:w-24 bg-slate-200 rounded-full" />
                      <div className="h-3.5 sm:h-5 w-12 sm:w-20 bg-slate-200 rounded-full" />
                    </div>
                    <div className="h-4 sm:h-5 bg-slate-200 rounded-md w-4/5" />
                  </div>
                  <div className="pt-2 sm:pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="h-4 sm:h-6 w-12 sm:w-20 bg-slate-200 rounded-md" />
                    <div className="h-6 sm:h-8 w-16 sm:w-24 bg-slate-200 rounded-lg" />
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

        {/* 4. SUCCESS STATE: Responsive Card Grid (Desktop: 3, Tablet: 2, Mobile: 2) */}
        {!loading && !error && filteredTours.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-7">
            {filteredTours.map((tour) => renderTourCard(tour))}
          </div>
        )}

        {/* Centered CTA Button Below Section (Mobile & Desktop) */}
        {!loading && !error && filteredTours.length > 0 && (
          <div className="mt-8 sm:mt-14 text-center px-2">
            <button
              type="button"
              onClick={() => handleOpenEnquiry("Custom Domestic Holiday", "All Packages Bottom CTA")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-3.5 rounded-full bg-[#082B50] hover:bg-[#F15A24] text-white text-xs sm:text-base font-bold shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 group cursor-pointer min-h-[48px]"
            >
              <span>Can&apos;t Find Your Package? Plan Custom Trip</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        )}
      </section>

      {/* ===================================================================
          4. FEATURED KASHMIR WINTER PACKAGES SPOTLIGHT
          - Dedicated spotlight section on Kashmir winter holidays
          - Heading centered on desktop and mobile
          - Centered CTA button placed below the cards grid
          - Responsive Grid: 2 cols on Mobile, 2 on Tablet, 3 on Desktop
          =================================================================== */}
      {!loading && !error && !searchQuery && selectedCategory === "all" && kashmirTours.length > 0 && (
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-4 pb-14">
          <div className="bg-gradient-to-br from-[#082B50]/5 via-amber-500/5 to-transparent rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-[#E5EAF1] shadow-xs">
            {/* Centered Heading for Desktop & Mobile */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F15A24]/10 text-[#F15A24] text-xs font-bold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Handcrafted Winter Specials</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-[#082B50] tracking-tight">
                Kashmir Winter Tour Packages
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed max-w-xl mx-auto">
                Glide on shikaras across Dal Lake, take the high-altitude Gulmarg Gondola over snowy pines, and explore Sonamarg glaciers &amp; Pahalgam valleys.
              </p>
            </div>

            {/* Responsive Card Grid (2-col mobile, 2-col tablet, 3-col desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-7">
              {kashmirTours.map((tour) => renderTourCard(tour))}
            </div>

            {/* Centered Button Below Section */}
            <div className="mt-8 sm:mt-12 text-center">
              <Link
                href="/packages?search=kashmir"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full bg-[#082B50] hover:bg-[#F15A24] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <span>View All Kashmir Packages</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================
          5. FEATURED ODISHA TOURS SPOTLIGHT
          - Heading: "Explore Odisha Beyond Tourism"
          - Subtext: "Culture • Art • Craft • Heritage • Nature"
          - Dynamically fetched from DB (state = 'Odisha' AND status = 'published')
          - Shows featured first, max 3-4 cards
          - Button "View All Odisha Tours" redirecting to /odisha-tours
          - If no published Odisha tours, hides the section
          =================================================================== */}
      {!loading && !error && !searchQuery && selectedCategory === "all" && odishaTours.length > 0 && (
        <section className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-0 pb-14">
          <div className="bg-gradient-to-br from-[#082B50]/5 via-amber-500/5 to-transparent rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-[#E5EAF1] shadow-xs">
            {/* Centered Heading */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F15A24]/10 text-[#F15A24] text-xs font-bold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Culture • Art • Craft • Heritage • Nature</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-[#082B50] tracking-tight">
                Explore Odisha Beyond Tourism
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed max-w-xl mx-auto">
                Discover ancient temple architecture, artisan village workshops, Sambalpuri and Ikat handlooms, tribal traditions and pristine coastal wetlands.
              </p>
            </div>

            {/* Responsive Card Grid (2-col mobile, 2-col tablet, 3-col desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-7">
              {odishaTours.map((tour) => renderTourCard(tour))}
            </div>

            {/* Centered Button Below Section */}
            <div className="mt-8 sm:mt-12 text-center">
              <Link
                href="/packages?search=odisha"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full bg-[#082B50] hover:bg-[#F15A24] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <span>View All Odisha Packages</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDestination={selectedTourName}
        packageInfo={selectedPackageInfo}
      />

      {/* Mobile Sticky Bottom Action Bar with Enquiry Trigger */}
      <MobileBottomBar onOpenEnquiry={() => handleOpenEnquiry("Custom Domestic Holiday")} />
    </>
  );
}

export default function TourPackagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-24 md:pb-0 font-sans text-[#172B4D]">
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
    </div>
  );
}
