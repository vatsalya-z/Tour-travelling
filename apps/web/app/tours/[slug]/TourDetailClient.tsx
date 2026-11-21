"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Phone,
  MessageCircle,
  HelpCircle,
  FileText,
  AlertCircle,
  Compass,
  Car,
  ChevronLeft,
  Share2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import EnquiryModal from "@/components/shared/EnquiryModal";
import FloatingContact from "@/components/shared/FloatingContact";
import { Tour } from "@/types/tour";
import { formatCurrency } from "@/lib/utils";
import { getPackageFourImages } from "@/lib/tour-service";
import { EnquiryPackageInfo } from "@/types/lead";

interface TourDetailClientProps {
  tour: Tour;
  relatedTours: Tour[];
}

export default function TourDetailClient({ tour, relatedTours }: TourDetailClientProps) {
  // Modal State for multi-step Lead Enquiry
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState("Hero Enquire Now Button");

  // Itinerary Accordion State: Set of open day indexes (all open by default)
  const initialOpenDays = useMemo(() => {
    return new Set((tour.itinerary || []).map((_, i) => i));
  }, [tour.itinerary]);
  const [openDays, setOpenDays] = useState<Set<number>>(initialOpenDays);

  // FAQ Accordion State: Set of open FAQ indexes (first open by default)
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set([0]));

  // Image Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Copy URL state for Share button
  const [copied, setCopied] = useState(false);

  // Extract exactly 4 distinct images
  const galleryImages = useMemo(() => getPackageFourImages(tour), [tour]);

  const destinationName = tour.destination?.name || tour.state || "India";
  const hasDiscount =
    tour.discounted_price !== null &&
    tour.discounted_price !== undefined &&
    Number(tour.discounted_price) > 0 &&
    Number(tour.discounted_price) < Number(tour.price);

  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(tour.price) - Number(tour.discounted_price)) / Number(tour.price)) * 100
      )
    : 0;

  const displayPrice = hasDiscount ? tour.discounted_price : tour.price;

  // Toggle single itinerary day
  const toggleDay = (idx: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Toggle all itinerary days
  const toggleAllDays = () => {
    if (openDays.size === (tour.itinerary || []).length) {
      setOpenDays(new Set());
    } else {
      setOpenDays(new Set((tour.itinerary || []).map((_, i) => i)));
    }
  };

  // Toggle FAQ item
  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Open Lead Enquiry Modal with complete package info
  const handleOpenEnquiry = (source: string) => {
    setCtaSource(source);
    setEnquiryModalOpen(true);
  };

  // Smooth scroll to itinerary
  const scrollToItinerary = () => {
    const el = document.getElementById("itinerary");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Share current tour
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Package info passed to existing Lead Enquiry Form
  const leadPackageInfo: EnquiryPackageInfo = {
    tourId: tour.id,
    tourName: tour.name,
    tourSlug: tour.slug,
    destinationId: tour.destination_id || null,
    destinationName: destinationName,
    packagePrice: Number(displayPrice) || null,
    packageImage: tour.cover_image || null,
    packageUrl: typeof window !== "undefined" ? window.location.href : `https://tourtripholidays.com/tours/${tour.slug}`,
    sourcePage: `/tours/${tour.slug}`,
    sourceCta: ctaSource,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] text-[#10264A]">
      {/* Top Bar & Main Header */}
      <TopBar />
      <Header />

      <main className="flex-1 pb-20 lg:pb-16">
        {/* ========================================================================
            BREADCRUMB NAVIGATION
        ======================================================================== */}
        <div className="bg-white border-b border-[#DCEAF3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-slate-500 flex-wrap gap-1.5">
              <Link href="/" className="hover:text-[#F15A24] transition-colors font-medium">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <Link href="/packages" className="hover:text-[#F15A24] transition-colors font-medium">
                Tour Packages
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href={`/packages?search=${encodeURIComponent(destinationName)}`}
                className="hover:text-[#F15A24] transition-colors font-medium"
              >
                {destinationName}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#082B50] font-semibold truncate max-w-[220px] sm:max-w-md">
                {tour.name}
              </span>
            </nav>
          </div>
        </div>

        {/* ========================================================================
            SECTION 1: PACKAGE HERO SECTION & SECTION 2: 4-IMAGE GALLERY
        ======================================================================== */}
        <section className="bg-white border-b border-[#DCEAF3] py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Top Badges & Share Row */}
            

            {/* Package Title & Duration / Starting Price */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#082B50] leading-tight tracking-tight">
                  {tour.name}
                </h1>

                {tour.short_description && (
                  <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed font-normal">
                    {tour.short_description}
                  </p>
                )}

                {/* Duration & Key Badges */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-4 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold text-[#082B50]">
                    <Clock className="w-4 h-4 text-[#F15A24]" />
                    <span>
                      {tour.days} Days / {tour.nights} Nights
                    </span>
                  </div>

                  {tour.tour_availability && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{tour.tour_availability}</span>
                    </div>
                  )}

                  {(tour.min_travellers || tour.max_travellers) && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>
                        {tour.min_travellers || 1} to {tour.max_travellers || 15} Travellers
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Primary Call-to-Actions (Desktop Top Card) */}
              {/* <div className="lg:col-span-4 bg-gradient-to-br from-white to-[#F5F8FC] border border-[#DCEAF3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                {/* <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Starting Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-[#082B50]">
                      {formatCurrency(displayPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through font-semibold">
                        {formatCurrency(tour.price)}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-[#F15A24]/10 text-[#F15A24] text-xs font-extrabold px-2 py-0.5 rounded-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Per Person (Twin Sharing Basis) • Inclusive of taxes
                  </span>
                </div> */}

                {/* <div className="grid grid-cols-2 gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={() => handleOpenEnquiry("Hero Section Enquire Now")}
                    className="w-full bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-xs sm:text-sm py-3 px-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Enquire Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={scrollToItinerary}
                    className="w-full bg-[#082B50] hover:bg-[#123F68] text-white font-bold text-xs sm:text-sm py-3 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Itinerary</span>
                  </button>
                </div> */}
              {/* </div> */}
            </div>

            {/* ====================================================================
                SECTION 2: PACKAGE IMAGE GALLERY — EXACTLY FOUR IMAGES
            ==================================================================== */}
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
                {/* 1st Image (Large Hero on Desktop, spans 8 cols) */}
                <div
                  onClick={() => {
                    setActiveImageIndex(0);
                    setLightboxOpen(true);
                  }}
                  className="md:col-span-8 relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer group shadow-sm bg-slate-100 border border-slate-200"
                >
                  <Image
                    src={galleryImages[0]}
                    alt={`${tour.name} - Cover View`}
                    fill
                    priority
                    unoptimized={galleryImages[0].startsWith("http")}
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-3 left-3 bg-[#082B50]/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Cover Photography • Click to Enlarge
                  </span>
                </div>

                {/* 2nd, 3rd, 4th Images (Right Stack on Desktop, spans 4 cols) */}
                <div className="md:col-span-4 grid grid-cols-3 md:grid-cols-1 gap-3 sm:gap-4">
                  {galleryImages.slice(1, 4).map((imgUrl, i) => (
                    <div
                      key={i + 1}
                      onClick={() => {
                        setActiveImageIndex(i + 1);
                        setLightboxOpen(true);
                      }}
                      className="relative aspect-[16/10] md:aspect-[16/9.5] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group shadow-xs bg-slate-100 border border-slate-200"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${tour.name} - Gallery Image ${i + 2}`}
                        fill
                        unoptimized={imgUrl.startsWith("http")}
                        sizes="(max-width: 768px) 33vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="hidden md:inline-block absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {i === 0 ? "Destination" : i === 1 ? "Itinerary" : "Experience"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================
            MAIN CONTENT AREA (2 Columns: 8 Col Content + 4 Col Sticky Booking Card)
        ======================================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* ==================================================================
                  SECTION 3: PACKAGE OVERVIEW
              ================================================================== */}
              <section className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs">
                <h3 className="text-xl sm:text-2xl font-black text-[#082B50] flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#F15A24]" />
                  <span>Package Overview</span>
                </h3>

                {tour.description && (
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3 whitespace-pre-line font-normal">
                    {tour.description}
                  </p>
                )}

                {/* Key Facts Grid */}
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {destinationName && (
                    <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Destination
                      </span>
                      <span className="text-sm font-bold text-[#082B50] mt-0.5 block truncate">
                        {destinationName}
                      </span>
                    </div>
                  )}

                  {tour.state && (
                    <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        State
                      </span>
                      <span className="text-sm font-bold text-[#082B50] mt-0.5 block truncate">
                        {tour.state}
                      </span>
                    </div>
                  )}

                  <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-[#082B50] mt-0.5 block">
                      {tour.days} Days / {tour.nights} Nights
                    </span>
                  </div>

                  {tour.category && (
                    <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Category
                      </span>
                      <span className="text-sm font-bold text-[#082B50] mt-0.5 block truncate">
                        {tour.category}
                      </span>
                    </div>
                  )}

                  {tour.tour_type && (
                    <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Tour Type
                      </span>
                      <span className="text-sm font-bold text-[#082B50] mt-0.5 block truncate">
                        {tour.tour_type}
                      </span>
                    </div>
                  )}

                  {(tour.min_travellers || tour.max_travellers) && (
                    <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Group Size
                      </span>
                      <span className="text-sm font-bold text-[#082B50] mt-0.5 block">
                        {tour.min_travellers || 1} to {tour.max_travellers || 15} Pax
                      </span>
                    </div>
                  )}

                  {tour.available_seats !== null && tour.available_seats !== undefined && tour.available_seats > 0 && (
                    <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Available Seats
                      </span>
                      <span className="text-sm font-bold text-[#082B50] mt-0.5 block">
                        {tour.available_seats} Seats Left
                      </span>
                    </div>
                  )}

                  {tour.tour_availability && (
                    <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Availability
                      </span>
                      <span className="text-sm font-bold text-[#082B50] mt-0.5 block truncate">
                        {tour.tour_availability}
                      </span>
                    </div>
                  )}

                  <div className="bg-[#F5F8FC] p-3.5 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Starting Price
                    </span>
                    <span className="text-sm font-black text-[#082B50] mt-0.5 block">
                      {formatCurrency(displayPrice)}
                    </span>
                  </div>
                </div>
              </section>

              {/* ==================================================================
                  SECTION 4: PACKAGE HIGHLIGHTS
              ================================================================== */}
              {Array.isArray(tour.highlights) && tour.highlights.length > 0 && (
                <section className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs">
                  <h3 className="text-xl sm:text-2xl font-black text-[#082B50] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F15A24]" />
                    <span>Package Highlights</span>
                  </h3>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tour.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-[#EAF6FC]/50 p-3.5 rounded-xl border border-[#DCEAF3]/60"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#082B50] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ==================================================================
                  SECTION 5: COMPLETE TOUR ITINERARY
              ================================================================== */}
              {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && (
                <section id="itinerary" className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#082B50] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#F15A24]" />
                        <span>Day-by-Day Tour Itinerary</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Comprehensive {tour.days} days / {tour.nights} nights travel program
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={toggleAllDays}
                      className="text-xs font-bold text-[#F15A24] hover:text-[#d94815] bg-[#F15A24]/10 hover:bg-[#F15A24]/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {openDays.size === tour.itinerary.length ? "Collapse All" : "Expand All"}
                    </button>
                  </div>

                  {/* Timeline Days Accordion */}
                  <div className="space-y-4">
                    {tour.itinerary.map((dayItem, idx) => {
                      const isOpen = openDays.has(idx);
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
                        >
                          {/* Accordion Header */}
                          <button
                            type="button"
                            onClick={() => toggleDay(idx)}
                            className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#082B50] text-white flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0 shadow-xs">
                                D{dayItem.day || idx + 1}
                              </span>
                              <div>
                                <span className="text-[11px] font-bold text-[#F15A24] block uppercase tracking-wider">
                                  Day {dayItem.day || idx + 1}
                                </span>
                                <h4 className="text-sm sm:text-base font-bold text-[#082B50] leading-snug">
                                  {dayItem.title}
                                </h4>
                              </div>
                            </div>

                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {/* Accordion Body */}
                          {isOpen && (
                            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-[#F5F8FC]/40 space-y-3">
                              {/* Day Description */}
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line mt-3">
                                {dayItem.description}
                              </p>

                              {/* Badges for Activities, Meals, Stay */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {dayItem.meals && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                                    <span>🍽️ Meals:</span>
                                    <span>{dayItem.meals}</span>
                                  </span>
                                )}
                                {dayItem.accommodation && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 px-2.5 py-1 rounded-md">
                                    <span>🏨 Stay:</span>
                                    <span>{dayItem.accommodation}</span>
                                  </span>
                                )}
                                {dayItem.activities && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 rounded-md">
                                    <span>🎯 Activities:</span>
                                    <span>{dayItem.activities}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ==================================================================
                  SECTION 7: INCLUSIONS & SECTION 8: EXCLUSIONS
              ================================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusions */}
                <section className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#082B50] flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A36A] flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span>Package Inclusions</span>
                    </h3>

                    {Array.isArray(tour.inclusions) && tour.inclusions.length > 0 ? (
                      <ul className="space-y-2.5">
                        {tour.inclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <Check className="w-4 h-4 text-[#16A36A] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Standard inclusions apply on request.</p>
                    )}
                  </div>
                </section>

                {/* Exclusions */}
                <section className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#082B50] flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#DC4444] flex items-center justify-center">
                        <X className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span>Package Exclusions</span>
                    </h3>

                    {Array.isArray(tour.exclusions) && tour.exclusions.length > 0 ? (
                      <ul className="space-y-2.5">
                        {tour.exclusions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <X className="w-4 h-4 text-[#DC4444] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Personal expenses & items not mentioned in inclusions.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* ==================================================================
                  SECTION 9: PICKUP & DROP DETAILS
              ================================================================== */}
              {(tour.pickup_location || tour.drop_location) && (
                <section className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-6 shadow-xs">
                  <h3 className="text-lg sm:text-xl font-black text-[#082B50] flex items-center gap-2 mb-4">
                    <Car className="w-5 h-5 text-[#F15A24]" />
                    <span>Pickup & Drop Logistics</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tour.pickup_location && (
                      <div className="bg-[#F5F8FC] p-4 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Pickup Location
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-sm font-bold text-[#082B50]">
                          <MapPin className="w-4 h-4 text-[#F15A24] flex-shrink-0" />
                          <span>{tour.pickup_location}</span>
                        </div>
                      </div>
                    )}

                    {tour.drop_location && (
                      <div className="bg-[#F5F8FC] p-4 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Drop Location
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-sm font-bold text-[#082B50]">
                          <MapPin className="w-4 h-4 text-[#082B50] flex-shrink-0" />
                          <span>{tour.drop_location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ==================================================================
                  SECTION 10: POLICIES, TERMS & IMPORTANT NOTES
              ================================================================== */}
              {(tour.cancellation_policy || tour.payment_terms || tour.important_notes || tour.terms) && (
                <section className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs space-y-5">
                  <h3 className="text-xl sm:text-2xl font-black text-[#082B50] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#F15A24]" />
                    <span>Policies, Terms & Important Notes</span>
                  </h3>

                  <div className="space-y-4">
                    {tour.cancellation_policy && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h4 className="text-xs font-bold text-[#082B50] uppercase tracking-wider">
                          Cancellation Policy
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {tour.cancellation_policy}
                        </p>
                      </div>
                    )}

                    {tour.payment_terms && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h4 className="text-xs font-bold text-[#082B50] uppercase tracking-wider">
                          Payment Terms
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {tour.payment_terms}
                        </p>
                      </div>
                    )}

                    {tour.important_notes && (
                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Important Travel Notes</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-950 mt-1.5 leading-relaxed">
                          {tour.important_notes}
                        </p>
                      </div>
                    )}

                    {tour.terms && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h4 className="text-xs font-bold text-[#082B50] uppercase tracking-wider">
                          Terms & Conditions
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {tour.terms}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ==================================================================
                  SECTION 11: FREQUENTLY ASKED QUESTIONS (FAQ)
              ================================================================== */}
              {Array.isArray(tour.faqs) && tour.faqs.length > 0 && (
                <section className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs">
                  <h3 className="text-xl sm:text-2xl font-black text-[#082B50] flex items-center gap-2 mb-2">
                    <HelpCircle className="w-5 h-5 text-[#F15A24]" />
                    <span>Frequently Asked Questions</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-6">
                    Essential questions and answers regarding {tour.name} and {destinationName}.
                  </p>

                  <div className="space-y-3">
                    {tour.faqs.map((faq, idx) => {
                      const isOpen = openFaqs.has(idx);
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFaq(idx)}
                            className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-xs sm:text-sm text-[#082B50] leading-snug">
                              {faq.question}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="p-4 pt-0 border-t border-slate-100 bg-[#F5F8FC]/50 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                              <p className="mt-2.5">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* ==================================================================
                RIGHT COLUMN: STICKY BOOKING CARD (Desktop / Tablet)
            ================================================================== */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-[#DCEAF3] p-6 shadow-lg">
                <span className="text-xs uppercase font-extrabold text-[#F15A24] tracking-wider block">
                  Best Price Assured
                </span>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-[#082B50]">
                    {formatCurrency(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      {formatCurrency(tour.price)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Per Person (Twin Sharing Basis)
                </span>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Duration:</span>
                    <span className="font-bold text-[#082B50]">
                      {tour.days} Days / {tour.nights} Nights
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Destination:</span>
                    <span className="font-bold text-[#082B50]">{destinationName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Tour Type:</span>
                    <span className="font-bold text-[#082B50]">{tour.tour_type || "Customized Tour"}</span>
                  </div>
                  {tour.pickup_location && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Pickup:</span>
                      <span className="font-bold text-[#082B50] truncate max-w-[170px]">
                        {tour.pickup_location}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEnquiry("Sticky Sidebar Enquire Now")}
                    className="w-full bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Enquire & Get Free Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="https://wa.me/919999999999?text=Hi%20TourTripHolidays%2C%20I%20am%20interested%20in%20the%20tour%20package%3A%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
                  <span>No Booking Fees • Free Expert Consultation</span>
                </div>
              </div>

              {/* Travel Expert Support Banner */}
              <div className="bg-[#082B50] text-white rounded-2xl p-5 shadow-sm text-center">
                <span className="text-xs uppercase font-extrabold text-[#F15A24] tracking-wider block">
                  Need Help Planning?
                </span>
                <h4 className="text-base font-bold mt-1">Speak with our Kashmir & India Experts</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Call our customer care for instant customization and personalized pricing.
                </p>
                <a
                  href="tel:+918000000000"
                  className="mt-4 inline-flex items-center justify-center gap-2 bg-white text-[#082B50] hover:bg-slate-100 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer w-full"
                >
                  <Phone className="w-3.5 h-3.5 text-[#F15A24]" />
                  <span>Call +91 80000 00000</span>
                </a>
              </div>
            </div>
          </div>

          {/* ====================================================================
              SECTION 13: RELATED TOUR PACKAGES
          ==================================================================== */}
          {relatedTours && relatedTours.length > 0 && (
            <section className="mt-16 pt-12 border-t border-slate-200">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold text-[#F15A24] uppercase tracking-wider block">
                    Similar Holidays
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#082B50]">
                    Related Tour Packages
                  </h3>
                </div>

                <Link
                  href="/packages"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F15A24] hover:text-[#d94815] group"
                >
                  <span>Explore All Packages</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTours.map((relTour) => (
                  <article
                    key={relTour.id}
                    className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* 1. Package Cover Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      {relTour.cover_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={relTour.cover_image}
                          alt={relTour.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <Compass className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* 2. Package Name & 3. View Details Button */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <h4 className="font-extrabold text-[#082B50] text-sm sm:text-base group-hover:text-[#F15A24] transition-colors line-clamp-2 leading-snug min-h-[44px]">
                        {relTour.name}
                      </h4>

                      <div className="mt-2 pt-3 border-t border-[#E5EAF1] flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500 font-semibold">
                          {relTour.days}D / {relTour.nights}N
                        </span>

                        <Link
                          href={`/tours/${relTour.slug}`}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#082B50] hover:bg-[#F15A24] text-white text-xs font-bold transition-all shadow-xs group/btn cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ====================================================================
              SECTION 14: FINAL ENQUIRY CTA BANNER
          ==================================================================== */}
          <section className="mt-16 bg-gradient-to-r from-[#082B50] via-[#123F68] to-[#082B50] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-block bg-[#F15A24] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Plan Your Dream Vacation
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                Ready to Explore {destinationName}?
              </h2>
              <p className="text-slate-200 text-sm sm:text-base mt-3 leading-relaxed">
                Connect with our certified holiday specialists to customize hotel stays, meal plans, and private transfers tailored to your family or group.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenEnquiry("Bottom Banner Enquire Now")}
                  className="w-full sm:w-auto bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Enquire Now & Get Free Custom Plan
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Contact Buttons */}
      <FloatingContact />

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            Starting Price
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#082B50]">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(tour.price)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenEnquiry("Mobile Sticky Bottom Enquire Now")}
          className="bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1"
        >
          <span>Enquire Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Multi-step Lead Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        defaultDestination={destinationName}
        packageInfo={leadPackageInfo}
      />

      {/* Lightbox Modal for 4-image gallery */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close Lightbox"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 text-white bg-white/20 hover:bg-white/30 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            aria-label="Previous Image"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
            }}
            className="absolute left-4 z-50 text-white bg-white/20 hover:bg-white/30 p-3 rounded-full cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-4xl aspect-[16/10] max-h-[80vh] rounded-2xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[activeImageIndex]}
              alt={`${tour.name} - Full Preview ${activeImageIndex + 1}`}
              fill
              unoptimized={galleryImages[activeImageIndex].startsWith("http")}
              className="object-contain"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              Image {activeImageIndex + 1} of {galleryImages.length}
            </div>
          </div>

          <button
            type="button"
            aria-label="Next Image"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
            }}
            className="absolute right-4 z-50 text-white bg-white/20 hover:bg-white/30 p-3 rounded-full cursor-pointer transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
