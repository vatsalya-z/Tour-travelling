"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Phone,
  HelpCircle,
  FileText,
  AlertCircle,
  Compass,
  Car,
  ChevronLeft,
  ChevronRight,
  Share2,
  BedDouble,
  Utensils,
  Eye,
  Star,
  Info,
  Calendar,
  Maximize2,
  MessageSquareText,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import EnquiryModal from "@/components/shared/EnquiryModal";
import FloatingContact from "@/components/shared/FloatingContact";
import { Tour } from "@/types/tour";
import { formatCurrency } from "@/lib/utils";
import { getPackageGenuineImages } from "@/lib/tour-service";
import { EnquiryPackageInfo } from "@/types/lead";

interface TourDetailClientProps {
  tour: Tour;
  relatedTours: Tour[];
}

interface ExtractedAccommodation {
  name: string;
  nightsCount: number;
  daysCovered: number[];
  meals?: string;
  location?: string;
}

interface AdvisoryItem {
  id: string;
  title: string;
  content: string;
}

interface PolicyItem {
  id: string;
  title: string;
  content: string;
}

export default function TourDetailClient({ tour, relatedTours }: TourDetailClientProps) {
  // Modal State for multi-step Lead Enquiry
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState("Hero Get Best Quote");

  // Hero carousel active image index
  const [activeHeroImageIndex, setActiveHeroImageIndex] = useState(0);

  // Itinerary Accordion State: Set of open day indexes (all open by default)
  const initialOpenDays = useMemo(() => {
    return new Set((tour.itinerary || []).map((_, i) => i));
  }, [tour.itinerary]);
  const [openDays, setOpenDays] = useState<Set<number>>(initialOpenDays);

  // Active day in day-pill bar
  const [activeDayPill, setActiveDayPill] = useState<number>(0);
  const dayPillsContainerRef = useRef<HTMLDivElement>(null);
  const isManualScrollingRef = useRef(false);

  // FAQ Accordion State: Set of open FAQ indexes (first open by default)
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set([0]));

  // Travel Advisory Accordion State (first open by default)
  const [openAdvisories, setOpenAdvisories] = useState<Set<number>>(new Set([0]));

  // Policies & Terms Accordion State (first open by default)
  const [openPolicies, setOpenPolicies] = useState<Set<number>>(new Set([0]));

  // Active section for in-page sticky sub-navigation
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isStickyNavVisible, setIsStickyNavVisible] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Extract all genuine unique images (no unrelated images or duplicated fillers)
  const galleryImages = useMemo(() => getPackageGenuineImages(tour), [tour]);

  const destinationName = tour.destination?.name || tour.state || "India";

  // Price calculations
  const originalPriceNum = Number(tour.price) || 0;
  const discountedPriceNum =
    tour.discounted_price !== null && tour.discounted_price !== undefined
      ? Number(tour.discounted_price)
      : null;

  const hasDiscount =
    discountedPriceNum !== null &&
    discountedPriceNum > 0 &&
    discountedPriceNum < originalPriceNum;

  const discountPercent = hasDiscount
    ? Math.round(((originalPriceNum - discountedPriceNum) / originalPriceNum) * 100)
    : 20;

  const savingsAmount = hasDiscount
    ? originalPriceNum - discountedPriceNum
    : Math.round(originalPriceNum * 0.2);

  const displayPrice = hasDiscount ? discountedPriceNum : originalPriceNum;

  // Strikethrough display price if no backend discount is provided
  const strikethroughPrice = hasDiscount
    ? originalPriceNum
    : Math.round(originalPriceNum * 1.25);

  // Extract travel route stops from itinerary or locations
  const routeStops = useMemo(() => {
    const stops: string[] = [];
    const seen = new Set<string>();

    const addStop = (name: string) => {
      const clean = name.trim();
      if (clean && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        stops.push(clean);
      }
    };

    if (tour.pickup_location) {
      addStop(tour.pickup_location.split("(")[0].replace(/Airport|Railway Station/i, "").trim());
    }

    if (Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
      for (const day of tour.itinerary) {
        const title = day.title || "";
        const match = title.match(
          /(?:Arrival in|to|in|visit)\s+([A-Za-z\s&]+?)(?:\s+(?:Day|Excursion|Valley|Sightseeing|Transfer|Houseboat|Local)|$)/i
        );
        if (match && match[1]) {
          const candidate = match[1].trim();
          if (candidate.length > 2 && candidate.length < 24) {
            addStop(candidate);
          }
        }
      }
    }

    if (stops.length < 2 && tour.destination?.name) {
      addStop(tour.destination.name);
    }

    if (tour.drop_location) {
      addStop(tour.drop_location.split("(")[0].replace(/Airport|Railway Station/i, "").trim());
    }

    return stops;
  }, [tour]);

  // Extract distinct accommodations from itinerary
  const accommodations = useMemo(() => {
    if (!Array.isArray(tour.itinerary) || tour.itinerary.length === 0) return [];

    const map = new Map<string, ExtractedAccommodation>();

    tour.itinerary.forEach((day, idx) => {
      const stay = day.accommodation?.trim();
      if (
        stay &&
        stay.toLowerCase() !== "none" &&
        stay.toLowerCase() !== "departure" &&
        stay.toLowerCase() !== "n/a"
      ) {
        const dayNum = day.day || idx + 1;
        const existing = map.get(stay);
        if (existing) {
          existing.nightsCount += 1;
          existing.daysCovered.push(dayNum);
          if (!existing.meals && day.meals) existing.meals = day.meals;
        } else {
          let loc = "";
          const parenMatch = stay.match(/\(([^)]+)\)/);
          if (parenMatch) {
            const parts = parenMatch[1].split(",");
            loc = parts[parts.length - 1].trim();
          } else if (stay.includes("in ")) {
            loc = stay.split("in ")[1].trim();
          }
          map.set(stay, {
            name: stay,
            nightsCount: 1,
            daysCovered: [dayNum],
            meals: day.meals,
            location: loc || destinationName,
          });
        }
      }
    });

    return Array.from(map.values());
  }, [tour.itinerary, destinationName]);

  // Structured Travel Advisory items for FAQ-style accordion (location-aware)
  const advisoryItems = useMemo<AdvisoryItem[]>(() => {
    const isOdisha =
      (tour.state || "").toLowerCase().includes("odisha") ||
      destinationName.toLowerCase().includes("odisha") ||
      tour.name.toLowerCase().includes("odisha");

    let list: AdvisoryItem[] = [];

    if (isOdisha) {
      list = [
        {
          id: "temple-entry",
          title: "Temple Entry & Heritage Protocol Advisory",
          content:
            "Non-Hindu visitors generally cannot enter the inner sanctum of the Jagannath Temple in Puri; a dedicated alternative heritage and cultural experience is arranged. Please dress respectfully (shoulders and knees covered) when visiting active temple sites.",
        },
        {
          id: "craft-villages",
          title: "Artisan Villages & Photography Etiquette",
          content:
            "When visiting artisan communities like Raghurajpur (Pattachitra) and Pipili (appliqué), always obtain consent before photographing artisans at work. Direct purchases from artisan families and craft cooperatives are warmly welcomed and support authentic heritage preservation.",
        },
        {
          id: "weather-clothing",
          title: "Weather, Coastal Clothing & Packing Tips",
          content:
            "Odisha enjoys a pleasant tropical climate with warm coastal breezes. Lightweight breathable cotton clothes, comfortable slip-on walking shoes for temple complexes, sun protection, and hats are recommended. For winter mornings in coastal or forested reserves, a light cardigan is ideal.",
        },
        {
          id: "nature-seasonal",
          title: "Boat Safaris, Wildlife & Seasonal Permissions",
          content:
            "Mangalajodi birdwatching boat rides, Chilika lagoon cruises, and Bhitarkanika mangrove safaris are subject to daily forest department clearances and seasonal conditions (peak bird migration season runs October through March).",
        },
      ];
    } else {
      list = [
        {
          id: "mobile-network",
          title: "Mobile Network Connectivity & SIM Card Advisory",
          content:
            "Due to regional telecom regulations, prepaid mobile connections issued outside Jammu & Kashmir do not operate in the valley. We strongly recommend carrying an active postpaid connection (Jio, Airtel, or BSNL) or obtaining a local temporary prepaid tourist SIM upon arrival at Srinagar Airport.",
        },
        {
          id: "identity-docs",
          title: "Identity Verification & Travel Documents",
          content:
            "All adult travellers must carry valid original government-issued photo ID (Aadhaar Card, Passport, Voter ID, or Driving Licence) for airport access, hotel check-ins, and local travel permits. Foreign nationals must carry their original passport with a valid Indian Visa.",
        },
        {
          id: "weather-clothing",
          title: "Weather, Seasonal Clothing & Packing Tips",
          content:
            "Mountain weather conditions can fluctuate rapidly. For winter departures (November through March), heavy thermal innerwear, fleece jackets, waterproof gloves, woollen caps, and sturdy snow boots are essential. For summer travel, comfortable daytime clothing with a light jacket or cardigan for cooler evenings is recommended.",
        },
        {
          id: "cash-payments",
          title: "Cash Availability & Local Payment Methods",
          content:
            "While major hotels and commercial shops in Srinagar accept UPI and credit cards, ATM availability can be limited in high-altitude destinations such as Gulmarg, Sonamarg, and inner Pahalgam valleys. We recommend carrying adequate liquid cash for pony rides, snow sledging, local union taxis, and small souvenir markets.",
        },
      ];
    }

    if (tour.important_notes) {
      list.push({
        id: "package-specific-notes",
        title: "Package-Specific Travel Instructions & Notes",
        content: tour.important_notes,
      });
    }

    return list;
  }, [tour.important_notes]);

  // Structured Policies & Terms items for FAQ-style accordion
  const policyItems = useMemo<PolicyItem[]>(() => {
    const list: PolicyItem[] = [];

    if (tour.cancellation_policy) {
      list.push({
        id: "cancellation-policy",
        title: "Cancellation & Refund Policy",
        content: tour.cancellation_policy,
      });
    } else {
      list.push({
        id: "standard-cancellation",
        title: "Cancellation & Refund Policy",
        content:
          "Cancellations requested 30+ days prior to departure qualify for a full refund minus minimal administrative processing fees. Cancellations between 15–29 days prior incur a 25% retention, 7–14 days prior incur a 50% retention, and cancellations within 7 days of travel are non-refundable.",
      });
    }

    if (tour.payment_terms) {
      list.push({
        id: "payment-terms",
        title: "Payment Terms & Booking Confirmation",
        content: tour.payment_terms,
      });
    } else {
      list.push({
        id: "standard-payment",
        title: "Payment Terms & Booking Deposit",
        content:
          "A nominal advance deposit (typically 25%–30%) is required to confirm hotel reservations, dedicated cab allocation, and itinerary scheduling. The balance payment is payable prior to trip commencement or on day one upon arrival.",
      });
    }

    if (tour.terms) {
      list.push({
        id: "general-terms",
        title: "General Terms & Travel Conditions",
        content: tour.terms,
      });
    }

    list.push({
      id: "itinerary-adjustments",
      title: "Itinerary Adjustments & Weather Disruption Terms",
      content:
        "Mountain passes, Gondola operations, and specific high-altitude sightseeing routes are subject to weather, road safety clearances, and local administration directives. In the event of unforeseen roadblocks or closures, alternate scenic routes and activities will be arranged seamlessly.",
    });

    return list;
  }, [tour.cancellation_policy, tour.payment_terms, tour.terms]);

  // Scroll listener for sticky sub-nav and day-wise scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById("package-hero-section");
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setIsStickyNavVisible(rect.bottom < 60);
      }

      const sections = [
        "overview",
        "stays",
        "itinerary",
        "inclusions",
        "faqs",
        "details",
        "advisory",
        "policies",
      ];

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveTab(sectionId);
            break;
          }
        }
      }

      // Day-wise Scroll Spy: update activeDayPill based on which itinerary day is currently in view
      if (!isManualScrollingRef.current && Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
        let currentDayIdx = -1;
        for (let i = 0; i < tour.itinerary.length; i++) {
          const dayNum = tour.itinerary[i].day || i + 1;
          const dayEl = document.getElementById(`day-${dayNum}`);
          if (dayEl) {
            const rect = dayEl.getBoundingClientRect();
            // As user scrolls, detect which day is active (its top has scrolled into or past the reading threshold)
            if (rect.top <= 240) {
              currentDayIdx = i;
            }
          }
        }
        if (currentDayIdx !== -1) {
          setActiveDayPill((prev) => (prev !== currentDayIdx ? currentDayIdx : prev));
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tour.itinerary]);

  // Auto-scroll the day-pill selector horizontally to keep the active day visible and centered
  useEffect(() => {
    if (dayPillsContainerRef.current) {
      const activeBtn = dayPillsContainerRef.current.querySelector(
        `[data-day-pill="${activeDayPill}"]`
      ) as HTMLElement;
      if (activeBtn) {
        const container = dayPillsContainerRef.current;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: btnLeft - containerWidth / 2 + btnWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeDayPill]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      }
      if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, galleryImages.length]);

  // Hero carousel navigation handlers
  const handlePrevHeroImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveHeroImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextHeroImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveHeroImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const handleOpenLightbox = (indexToOpen: number) => {
    setSelectedPhotoIndex(indexToOpen);
    setLightboxOpen(true);
  };

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

  // Scroll to a specific day in the itinerary
  const scrollToDay = (dayIndex: number) => {
    setActiveDayPill(dayIndex);
    setOpenDays((prev) => new Set(prev).add(dayIndex));
    isManualScrollingRef.current = true;

    const dayNum = tour.itinerary?.[dayIndex]?.day || dayIndex + 1;
    const dayEl = document.getElementById(`day-${dayNum}`);
    if (dayEl) {
      const yOffset = -140;
      const y = dayEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 700);
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

  // Toggle Travel Advisory item (FAQ-style accordion)
  const toggleAdvisory = (idx: number) => {
    setOpenAdvisories((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Toggle Policy item (FAQ-style accordion)
  const togglePolicy = (idx: number) => {
    setOpenPolicies((prev) => {
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

  // Smooth scroll to element id
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
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
    packageImage: tour.cover_image || galleryImages[0] || null,
    packageUrl:
      typeof window !== "undefined"
        ? window.location.href
        : `https://tourtripholidays.com/tours/${tour.slug}`,
    sourcePage: `/tours/${tour.slug}`,
    sourceCta: ctaSource,
  };

  // Selected hero image
  const currentHeroImg = galleryImages[activeHeroImageIndex] || galleryImages[0] || tour.cover_image;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] text-[#10264A] pb-24 lg:pb-0">
      {/* Top Bar & Main Website Header */}
      <TopBar />
      <Header />

      {/* ========================================================================
          STICKY IN-PAGE SUB-NAVIGATION BAR
      ======================================================================== */}
      {isStickyNavVisible && (
        <div className="hidden lg:block sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCEAF3] shadow-xs transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              <button
                type="button"
                onClick={() => scrollToSection("overview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "overview"
                  ? "bg-[#082B50] text-white"
                  : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                  }`}
              >
                Overview
              </button>

              {accommodations.length > 0 && (
                <button
                  type="button"
                  onClick={() => scrollToSection("stays")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "stays"
                    ? "bg-[#082B50] text-white"
                    : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                    }`}
                >
                  Stays
                </button>
              )}

              {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && (
                <button
                  type="button"
                  onClick={() => scrollToSection("itinerary")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "itinerary"
                    ? "bg-[#082B50] text-white"
                    : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                    }`}
                >
                  Itinerary
                </button>
              )}

              <button
                type="button"
                onClick={() => scrollToSection("inclusions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "inclusions"
                  ? "bg-[#082B50] text-white"
                  : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                  }`}
              >
                Inclusions
              </button>

              {Array.isArray(tour.faqs) && tour.faqs.length > 0 && (
                <button
                  type="button"
                  onClick={() => scrollToSection("faqs")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "faqs"
                    ? "bg-[#082B50] text-white"
                    : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                    }`}
                >
                  FAQs
                </button>
              )}

              <button
                type="button"
                onClick={() => scrollToSection("details")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "details"
                  ? "bg-[#082B50] text-white"
                  : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                  }`}
              >
                Details
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("advisory")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "advisory"
                  ? "bg-[#082B50] text-white"
                  : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                  }`}
              >
                Travel Advisory
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("policies")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${activeTab === "policies"
                  ? "bg-[#082B50] text-white"
                  : "text-slate-600 hover:text-[#082B50] hover:bg-slate-100"
                  }`}
              >
                Policies & Terms
              </button>
            </nav>

            {/* Quick Price & Action in Sticky Nav */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                  {originalPriceNum > 0 ? "Starting from" : "Pricing"}
                </span>
                <span className="text-sm font-black text-[#082B50] leading-none">
                  {originalPriceNum > 0 ? formatCurrency(displayPrice) : "On Request"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEnquiry("Sticky Subnav Book Button")}
                className="bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Get Best Quote</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-20 lg:pb-16">
        {/* ========================================================================
            1. BREADCRUMB NAVIGATION
        ======================================================================== */}
        <div className="bg-white border-b border-[#DCEAF3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-slate-500 flex-wrap gap-1.5 text-center sm:text-left"
            >
              <Link href="/" className="hover:text-[#F15A24] transition-colors font-medium">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <Link href="/packages" className="hover:text-[#F15A24] transition-colors font-medium">
                Packages
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href={`/packages?search=${encodeURIComponent(destinationName)}`}
                className="hover:text-[#F15A24] transition-colors font-medium"
              >
                {destinationName}
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-[#082B50] font-semibold truncate max-w-[200px] sm:max-w-md">
                {tour.name}
              </span>
            </nav>
          </div>
        </div>

        {/* ========================================================================
            2. HERO SECTION — EXACT REPLICA OF USER REFERENCE IMAGE
            - Left: Single prominent Image Carousel with:
                    - Red pill badge: -20% OFF (top right)
                    - Left & Right white circle navigation buttons (< >)
                    - Bottom right pill: ⛶ 1/2 (lightbox expand icon + counter)
            - Right:
                    - Badges: HONEYMOON (gold) + 6N/7D (navy)
                    - Title: Package Name (h1)
                    - Route: MapPin + Srinagar → Gulmarg → Pahalgam
                    - Tagline: Short description
                    - Booking Card:
                      - Strikethrough price + Big Display Price /person + Green "You save ₹14,000!"
                      - Per person + 6 Nights meta
                      - "Get Best Quote" CTA button
                      - "Inquire on WhatsApp" green CTA button
                      - "Free cancellation · No hidden charges"
                      - Bottom dashed box: Save up to ₹8,400 with code HONEYMOON15
        ======================================================================== */}
        <section id="package-hero-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 items-stretch mb-6 sm:mb-8">
            {/* ----------------- LEFT: IMAGE CAROUSEL CONTAINER (On mobile: order-2, on desktop: order-1) ----------------- */}
            <div className="order-2 lg:order-1 relative w-full h-[260px] sm:h-[380px] lg:h-full lg:min-h-[480px] rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-[#DCEAF3] select-none group">
              {currentHeroImg ? (
                <Image
                  src={currentHeroImg}
                  alt={`${tour.name} - Slide ${activeHeroImageIndex + 1}`}
                  fill
                  priority
                  unoptimized={currentHeroImg.startsWith("http")}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-all duration-500 cursor-pointer"
                  onClick={() => handleOpenLightbox(activeHeroImageIndex)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <Compass className="w-16 h-16 text-[#082B50]" />
                </div>
              )}

              {/* Top-Right Discount Badge */}
              {originalPriceNum > 0 && hasDiscount && (
                <div className="absolute top-3.5 right-3.5 z-10">
                  <span className="rounded-full bg-[#EF4444] text-white px-3 py-1 text-xs font-black shadow-md tracking-wide">
                    -{discountPercent}% OFF
                  </span>
                </div>
              )}

              {/* Left Carousel Arrow Button */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={handlePrevHeroImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-800" />
                </button>
              )}

              {/* Right Carousel Arrow Button */}
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={handleNextHeroImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-slate-800" />
                </button>
              )}

              {/* Bottom-Right Expand / Counter Pill (⛶ 1/2) */}
              <button
                type="button"
                onClick={() => handleOpenLightbox(activeHeroImageIndex)}
                className="absolute bottom-3.5 right-3.5 z-10 rounded-md bg-black/75 hover:bg-black/90 text-white backdrop-blur-xs px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View full screen photos"
              >
                <Maximize2 className="w-3.5 h-3.5 text-white" />
                <span>
                  {activeHeroImageIndex + 1}/{galleryImages.length > 0 ? galleryImages.length : 1}
                </span>
              </button>
            </div>

            {/* ----------------- RIGHT: TITLE, METADATA & BOOKING CARD (On mobile: contents, on desktop: flex) ----------------- */}
            <div className="contents lg:flex lg:flex-col lg:justify-between lg:order-2">
              {/* Header Meta & Title (On mobile: order-1) */}
              <div className="order-1 lg:order-none text-center sm:text-left">
                {/* Badges Row (HONEYMOON in gold + 6N/7D in navy) */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                  <span className="rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold px-3 py-0.5 uppercase tracking-wide">
                    {tour.tour_type || "HONEYMOON"}
                  </span>

                  <span className="rounded-full bg-[#082B50] text-white text-xs font-bold px-3 py-0.5">
                    {tour.nights}N/{tour.days}D
                  </span>
                </div>

                {/* H1 Main Heading */}
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#082B50] leading-tight mb-1.5 text-center sm:text-left">
                  {tour.name}
                </h1>

                {/* Route Location with Map Pin */}
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs sm:text-sm text-slate-500 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
                  <span className="truncate">
                    {routeStops.length > 1 ? routeStops.join(" → ") : destinationName}
                  </span>
                </div>

                {/* Short Subtitle / Tagline */}
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4 text-center sm:text-left">
                  {tour.short_description ||
                    ((tour.state || "").toLowerCase().includes("odisha") || destinationName.toLowerCase().includes("odisha")
                      ? `Discover the Soul of Odisha — Ancient Kalinga Temples, Artisan Craft Villages, Sambalpuri Handlooms, and Scenic Coastal Wonders.`
                      : (tour.state || "").toLowerCase().includes("kashmir") || destinationName.toLowerCase().includes("kashmir")
                      ? `Welcome the New Year Amid Snow-Covered Mountains, Enchanting Valleys and the Timeless Beauty of Kashmir.`
                      : `Discover the Breathtaking Landscapes, Rich Heritage, and Warm Hospitality of ${destinationName}.`)}
                </p>
              </div>

              {/* The White Booking Box (#booking-panel) (On mobile: order-3, below image) */}
              <div
                id="booking-panel"
                className="order-3 lg:order-none rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3.5"
              >
                {/* Price & Specs Header Row */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    {originalPriceNum > 0 ? (
                      <>
                        <p className="text-xs sm:text-sm text-slate-400 line-through font-medium leading-none mb-1">
                          {formatCurrency(strikethroughPrice)}/person
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display font-black text-2xl sm:text-3xl text-[#082B50] leading-tight">
                            {formatCurrency(displayPrice)}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-500 font-normal">/person</span>
                        </div>
                        {hasDiscount && (
                          <p className="text-emerald-600 text-xs sm:text-sm font-semibold mt-1">
                            You save {formatCurrency(savingsAmount)}!
                          </p>
                        )}
                      </>
                    ) : (
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pricing</span>
                        <span className="font-display font-black text-xl sm:text-2xl text-[#082B50] leading-tight block mt-0.5">
                          Custom Quote on Request
                        </span>
                        <p className="text-emerald-600 text-xs font-semibold mt-1">
                          Personalized for your group &amp; dates
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-500 space-y-1">
                    <p className="flex items-center justify-end gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Per person</span>
                    </p>
                    <p className="flex items-center justify-end gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tour.nights} Nights</span>
                    </p>
                  </div>
                </div>

                {/* Button 1: "Get Best Quote" */}
                <button
                  type="button"
                  onClick={() => handleOpenEnquiry("Hero Get Best Quote")}
                  className="w-full rounded-xl bg-[#F15A24] hover:bg-[#d94815] text-white font-bold py-3 px-4 text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer min-h-[48px]"
                >
                  <MessageSquareText className="w-4 h-4 text-white" />
                  <span>Get Best Quote</span>
                </button>

                {/* Button 2: "Inquire on WhatsApp" */}
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(
                    `Hi TourTripHolidays, I want to inquire about: ${tour.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-3 px-4 text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer min-h-[48px]"
                >
                  <FaWhatsapp className="w-4 h-4 text-white" />
                  <span>Inquire on WhatsApp</span>
                </a>

                {/* Free cancellation reassurance */}
                <p className="text-center text-xs text-slate-400 font-medium">
                  Free cancellation · No hidden charges
                </p>

                {/* Bottom Dashed Box (Save up to ₹8,400 with code HONEYMOON15) */}
                {originalPriceNum > 0 && (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 text-center">
                    <p className="text-xs text-slate-500">Save up to</p>
                    <p className="font-display text-lg font-bold text-emerald-600 mt-0.5">
                      {formatCurrency(savingsAmount || Math.round(Number(displayPrice) * 0.15))}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      with code{" "}
                      <span className="font-bold text-[#082B50] font-mono">HONEYMOON15</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================================
              TRIP SUMMARY STATS BAR
          ==================================================================== */}
          <div className="bg-white rounded-2xl border border-[#DCEAF3] p-3.5 sm:p-4 shadow-2xs mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="pt-2 sm:pt-0 sm:px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#082B50] mt-0.5">
                  {tour.days} Days / {tour.nights} Nights
                </span>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#082B50] mt-0.5 truncate max-w-[130px]">
                  {destinationName}
                </span>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meal Plan</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#082B50] mt-0.5">
                  MAP (Breakfast & Dinner)
                </span>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accommodations</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#082B50] mt-0.5">
                  {accommodations.length > 0 ? `${accommodations.length} Verified Stays` : "Standard Hotels"}
                </span>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transport</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#082B50] mt-0.5 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-[#F15A24]" />
                  <span>Private Cab Included</span>
                </span>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sightseeing</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#082B50] mt-0.5">
                  {Array.isArray(tour.itinerary) ? `${tour.itinerary.length} Days Planned` : "Complete Tour"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================
            3. MAIN CONTENT (2/3 LEFT COLUMN) + DETAILS SIDEBAR (1/3 RIGHT COLUMN)
        ======================================================================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* ---------------- LEFT CONTENT COLUMN (2/3) ---------------- */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* ================================================================
                  A. PACKAGE OVERVIEW
              ================================================================ */}
              <section
                id="overview"
                className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24"
              >
                <div className="border-b border-slate-100 pb-3 sm:pb-4 mb-4 text-center sm:text-left">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-[#082B50]">
                    Package Overview
                  </h2>
                </div>

                {tour.description ? (
                  <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-3 font-normal">
                    {tour.description.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Experience an unforgettable holiday in {destinationName}. Contact our travel specialists for custom arrangements.
                  </p>
                )}

                {/* Route Sequence Visualizer */}
                {routeStops.length > 1 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 text-center sm:text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#082B50] block mb-2">
                      Journey Route:
                    </span>
                    <div className="flex items-center justify-center sm:justify-start flex-wrap gap-1.5 sm:gap-2 text-xs font-semibold text-[#082B50]">
                      {routeStops.map((stop, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F5F8FC] border border-[#DCEAF3]">
                            <MapPin className="w-3 h-3 text-[#F15A24]" />
                            <span>{stop}</span>
                          </span>
                          {sIdx < routeStops.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-[#082B50]/50 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* ================================================================
                  B. TOUR HIGHLIGHTS
              ================================================================ */}
              {Array.isArray(tour.highlights) && tour.highlights.length > 0 && (
                <section
                  id="highlights"
                  className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24"
                >
                  <div className="border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-5 text-center sm:text-left">
                    <h2 className="font-display font-bold text-lg sm:text-xl text-[#082B50] flex items-center justify-center sm:justify-start gap-2">
                      <Sparkles className="w-5 h-5 text-[#F15A24]" />
                      <span>Tour Highlights</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tour.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-[#EAF6FC]/50 hover:bg-[#EAF6FC]/80 p-3.5 rounded-xl border border-[#DCEAF3] transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#082B50] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm text-[#082B50] font-semibold leading-relaxed">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ================================================================
                  C. WHERE YOU’LL STAY (2-Column Mobile Grid strictly maintained)
              ================================================================ */}
              {accommodations.length > 0 && (
                <section
                  id="stays"
                  className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24"
                >
                  <div className="border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-5 text-center sm:text-left">
                    <h2 className="font-display font-bold text-lg sm:text-xl text-[#082B50] flex items-center justify-center sm:justify-start gap-2">
                      <BedDouble className="w-5 h-5 text-[#F15A24]" />
                      <span>Where you’ll stay</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {accommodations.length} verified propert{accommodations.length === 1 ? "y" : "ies"} included in this package.
                    </p>
                  </div>

                  {/* Responsive Grid: 2-column on mobile strictly preserved */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                    {accommodations.map((acc, aIdx) => (
                      <div
                        key={aIdx}
                        className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-4 shadow-2xs hover:border-[#082B50]/30 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-2">
                            <span className="text-[9px] sm:text-[11px] font-extrabold bg-[#082B50] text-white px-2 py-0.5 rounded-md inline-block w-fit">
                              {acc.nightsCount} {acc.nightsCount === 1 ? "Night" : "Nights"}
                            </span>
                            <span className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
                              Day {acc.daysCovered.join(", ")}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-[#082B50] text-xs sm:text-sm md:text-base leading-snug line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                            {acc.name}
                          </h3>

                          {acc.location && (
                            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-1.5">
                              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F15A24] flex-shrink-0" />
                              <span className="truncate">{acc.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600">
                          <span className="inline-flex items-center gap-1 text-[#082B50] font-semibold text-[9px] sm:text-[11px] truncate">
                            <Utensils className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F15A24] flex-shrink-0" />
                            <span className="truncate">{acc.meals ? `Meals: ${acc.meals}` : "MAP Plan Included"}</span>
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium hidden sm:inline">
                            Verified Stay
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ================================================================
                  D. DAY-BY-DAY ITINERARY WITH STICKY DAY PILLS
              ================================================================ */}
              {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 && (
                <section
                  id="itinerary"
                  className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between flex-wrap gap-3 pb-4 mb-4 border-b border-slate-100 text-center sm:text-left">
                    <div>
                      <h2 className="font-display font-bold text-lg sm:text-xl text-[#082B50] flex items-center justify-center sm:justify-start gap-2">
                        <Clock className="w-5 h-5 text-[#F15A24]" />
                        <span>Day-by-Day Itinerary</span>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        {tour.days} Days / {tour.nights} Nights comprehensive schedule.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={toggleAllDays}
                      className="text-xs font-bold text-[#F15A24] hover:text-[#d94815] bg-[#F15A24]/10 hover:bg-[#F15A24]/20 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer w-full sm:w-auto text-center flex items-center justify-center mx-auto sm:mx-0"
                    >
                      {openDays.size === tour.itinerary.length ? "Collapse All" : "Expand All"}
                    </button>
                  </div>

                  {/* Horizontal Scrollable Day-Pill Selector (Active Day Changes Dynamically on Scroll) */}
                  <div className="sticky top-14 z-20 -mx-5 sm:-mx-7 px-5 sm:px-7 py-2.5 bg-white/95 backdrop-blur-md border-y border-slate-100 mb-6 shadow-2xs">
                    <div
                      ref={dayPillsContainerRef}
                      className="flex gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth"
                    >
                      {tour.itinerary.map((dayItem, dIdx) => {
                        const dayNum = dayItem.day || dIdx + 1;
                        const isCurrent = activeDayPill === dIdx;

                        return (
                          <button
                            key={dIdx}
                            data-day-pill={dIdx}
                            type="button"
                            onClick={() => scrollToDay(dIdx)}
                            className={`shrink-0 rounded-full border px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${isCurrent
                              ? "border-[#082B50] bg-[#082B50] text-white shadow-xs scale-[1.02]"
                              : "border-slate-200 bg-white text-slate-700 hover:border-[#082B50]/40 hover:text-[#082B50]"
                              }`}
                          >
                            Day {dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline Days */}
                  <ol className="space-y-4">
                    {tour.itinerary.map((dayItem, idx) => {
                      const isOpen = openDays.has(idx);
                      const dayNumber = dayItem.day || idx + 1;

                      return (
                        <li
                          key={idx}
                          id={`day-${dayNumber}`}
                          className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-2xs hover:border-slate-300 scroll-mt-36"
                        >
                          <button
                            type="button"
                            onClick={() => toggleDay(idx)}
                            className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3.5">
                              <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#082B50] text-white flex flex-col items-center justify-center font-black flex-shrink-0 shadow-xs">
                                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
                                  DAY
                                </span>
                                <span className="text-sm sm:text-base leading-none">
                                  {dayNumber < 10 ? `0${dayNumber}` : dayNumber}
                                </span>
                              </span>

                              <div>
                                <span className="text-[11px] font-bold text-[#F15A24] block uppercase tracking-wider">
                                  Day {dayNumber} of {tour.days}
                                </span>
                                <h3 className="text-sm sm:text-base font-extrabold text-[#082B50] leading-snug">
                                  {dayItem.title}
                                </h3>
                              </div>
                            </div>

                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-[#082B50]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#082B50]" />
                              )}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 bg-[#F5F8FC]/30 space-y-4">
                              {dayItem.image && (
                                <div
                                  onClick={() => handleOpenLightbox(0)}
                                  className="relative aspect-[16/9] max-h-[300px] w-full rounded-xl overflow-hidden cursor-pointer group mt-4 border border-slate-200"
                                >
                                  <Image
                                    src={dayItem.image}
                                    alt={`Day ${dayNumber} - ${dayItem.title}`}
                                    fill
                                    unoptimized={dayItem.image.startsWith("http")}
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    className="object-cover group-hover:scale-103 transition-transform duration-500"
                                  />
                                  <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                                    <Eye className="w-3 h-3 text-[#F15A24]" />
                                    <span>Sightseeing Preview</span>
                                  </span>
                                </div>
                              )}

                              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line pt-2">
                                {dayItem.description}
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                {dayItem.meals && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#EAF6FC] text-[#082B50] border border-[#DCEAF3] px-3 py-1.5 rounded-lg">
                                    <Utensils className="w-3.5 h-3.5 text-[#F15A24]" />
                                    <span>Meals: {dayItem.meals}</span>
                                  </span>
                                )}

                                {dayItem.accommodation && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#EAF6FC] text-[#082B50] border border-[#DCEAF3] px-3 py-1.5 rounded-lg">
                                    <BedDouble className="w-3.5 h-3.5 text-[#082B50]" />
                                    <span>Stay: {dayItem.accommodation}</span>
                                  </span>
                                )}

                                {dayItem.activities && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F15A24]/10 text-[#082B50] border border-[#F15A24]/20 px-3 py-1.5 rounded-lg">
                                    <Sparkles className="w-3.5 h-3.5 text-[#F15A24]" />
                                    <span>Activities: {dayItem.activities}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* ================================================================
                  E. INCLUSIONS AND EXCLUSIONS
              ================================================================ */}
              <section id="inclusions" className="scroll-mt-24 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* What's Included */}
                  <div className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2.5 mb-4 pb-3 border-b border-slate-100 text-center sm:text-left">
                        <div className="w-8 h-8 rounded-xl bg-[#EAF6FC] text-[#082B50] flex items-center justify-center shadow-2xs">
                          <Check className="w-4 h-4 text-[#082B50] stroke-[3]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#082B50] block">
                            Included
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-[#082B50]">
                            What&apos;s Included
                          </h3>
                        </div>
                      </div>

                      {Array.isArray(tour.inclusions) && tour.inclusions.length > 0 ? (
                        <ul className="space-y-3">
                          {tour.inclusions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                              <Check className="w-4 h-4 text-[#082B50] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Standard verified inclusions apply to this tour package.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* What's Not Included */}
                  <div className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2.5 mb-4 pb-3 border-b border-slate-100 text-center sm:text-left">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
                          <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 block">
                            Excluded
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-[#082B50]">
                            What&apos;s Not Included
                          </h3>
                        </div>
                      </div>

                      {Array.isArray(tour.exclusions) && tour.exclusions.length > 0 ? (
                        <ul className="space-y-3">
                          {tour.exclusions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                              <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Personal expenses, flights and optional sports not included.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ================================================================
                  F. PACKAGE-SPECIFIC FAQS
              ================================================================ */}
              {Array.isArray(tour.faqs) && tour.faqs.length > 0 && (
                <section
                  id="faqs"
                  className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24"
                >
                  <div className="border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-5 text-center sm:text-left">
                    <h2 className="font-display font-bold text-lg sm:text-xl text-[#082B50] flex items-center justify-center sm:justify-start gap-2">
                      <HelpCircle className="w-5 h-5 text-[#F15A24]" />
                      <span>{tour.name} — FAQs</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Important answers regarding this holiday package and {destinationName}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {tour.faqs.map((faq, idx) => {
                      const isOpen = openFaqs.has(idx);
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 bg-white shadow-2xs hover:border-[#082B50]/30"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFaq(idx)}
                            className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-xs sm:text-sm text-[#082B50] leading-snug">
                              {faq.question}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-[#EAF6FC] flex items-center justify-center flex-shrink-0">
                              {isOpen ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#082B50]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#082B50]" />
                              )}
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

            {/* ---------------- RIGHT SIDEBAR COLUMN (1/3) ---------------- */}
            <div className="lg:col-span-1 space-y-5 sticky top-20">
              {/* Box 1: Package Specifications */}
              <div id="details" className="rounded-2xl border border-[#DCEAF3] bg-white p-5 shadow-xs space-y-3.5 scroll-mt-24">
                <h3 className="font-display font-bold text-base text-[#082B50] pb-2 border-b border-slate-100 flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
                  <Info className="w-4 h-4 text-[#F15A24]" />
                  <span>Package Details</span>
                </h3>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500 font-medium">Duration:</span>
                    <span className="font-bold text-[#082B50]">{tour.days}D / {tour.nights}N</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="font-bold text-[#082B50]">{tour.tour_type || "Standard"}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500 font-medium">Destination:</span>
                    <span className="font-bold text-[#082B50] truncate max-w-[140px]">{destinationName}</span>
                  </div>

                  {(tour.min_travellers || tour.max_travellers) && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-500 font-medium">Group Size:</span>
                      <span className="font-bold text-[#082B50]">
                        {tour.min_travellers || 1} - {tour.max_travellers || 15} Pax
                      </span>
                    </div>
                  )}

                  {tour.pickup_location && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-500 font-medium">Pickup:</span>
                      <span className="font-bold text-[#082B50] truncate max-w-[140px]">{tour.pickup_location}</span>
                    </div>
                  )}

                  {tour.drop_location && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-500 font-medium">Drop:</span>
                      <span className="font-bold text-[#082B50] truncate max-w-[140px]">{tour.drop_location}</span>
                    </div>
                  )}

                  {tour.tour_availability && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-slate-500 font-medium">Availability:</span>
                      <span className="font-bold text-[#082B50]">{tour.tour_availability}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEnquiry("Sidebar Details Enquire")}
                  className="w-full mt-3 bg-[#082B50] hover:bg-[#123F68] text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center"
                >
                  Request Detailed Itinerary
                </button>
              </div>

              {/* Box 2: Trust & Assurance Guarantees */}
              <div className="rounded-2xl border border-[#DCEAF3] bg-white p-5 space-y-3 text-xs text-slate-600 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#082B50] flex-shrink-0" />
                  <span className="font-semibold text-[#082B50]">100% Handcrafted Itineraries</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#082B50] flex-shrink-0" />
                  <span className="font-semibold text-[#082B50]">Verified Hotels & Houseboats</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#082B50] flex-shrink-0" />
                  <span className="font-semibold text-[#082B50]">Dedicated Chauffeur & Cab</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#082B50] flex-shrink-0" />
                  <span className="font-semibold text-[#082B50]">24/7 Local On-Ground Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================================
              CENTERED SECTIONS (Travel Advisory & Policies)
              Positioned below the complete 2-column section and right above Similar Holidays
          ==================================================================== */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto space-y-8 sm:space-y-10">
            {/* Travel Advisory & Essential Information (FAQ-Style Accordion) */}
            <section
              id="advisory"
              className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24 space-y-4"
            >
              <div className="border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-5 text-center sm:text-left">
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#082B50] flex items-center justify-center sm:justify-start gap-2">
                  <AlertCircle className="w-5 h-5 text-[#F15A24]" />
                  <span>Travel Advisory & Essential Information</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Important travel advisory, SIM guidelines, documentation, and weather precautions for {destinationName}.
                </p>
              </div>

              <div className="space-y-3">
                {advisoryItems.map((item, idx) => {
                  const isOpen = openAdvisories.has(idx);

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 bg-white shadow-2xs hover:border-[#082B50]/30"
                    >
                      <button
                        type="button"
                        onClick={() => toggleAdvisory(idx)}
                        className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-xs sm:text-sm text-[#082B50] leading-snug">
                          {item.title}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-[#EAF6FC] flex items-center justify-center flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#082B50]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#082B50]" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 border-t border-slate-100 bg-[#F5F8FC]/50 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          <p className="mt-2.5">{item.content}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Policies, Cancellation & Terms (FAQ-Style Accordion) */}
            <section
              id="policies"
              className="bg-white rounded-2xl border border-[#DCEAF3] p-5 sm:p-7 shadow-xs scroll-mt-24 space-y-4"
            >
              <div className="border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-5 text-center sm:text-left">
                <h2 className="font-display font-bold text-lg sm:text-xl text-[#082B50] flex items-center justify-center sm:justify-start gap-2">
                  <FileText className="w-5 h-5 text-[#F15A24]" />
                  <span>Policies, Cancellation & Terms</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Clear guidelines on bookings, cancellations, rescheduling, and holiday terms.
                </p>
              </div>

              <div className="space-y-3">
                {policyItems.map((policy, idx) => {
                  const isOpen = openPolicies.has(idx);

                  return (
                    <div
                      key={policy.id}
                      className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 bg-white shadow-2xs hover:border-[#082B50]/30"
                    >
                      <button
                        type="button"
                        onClick={() => togglePolicy(idx)}
                        className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-xs sm:text-sm text-[#082B50] leading-snug">
                          {policy.title}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-[#EAF6FC] flex items-center justify-center flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#082B50]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#082B50]" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 border-t border-slate-100 bg-[#F5F8FC]/50 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          <p className="mt-2.5">{policy.content}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ====================================================================
              4. RELATED TOUR PACKAGES ("Similar Holidays")
          ==================================================================== */}
          {relatedTours && relatedTours.length > 0 && (
            <section className="mt-16 pt-12 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-8 gap-4 text-center sm:text-left">
                <div>
                  <span className="text-xs font-bold text-[#F15A24] uppercase tracking-wider block">
                    Similar Holidays
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#082B50] font-display">
                    Similar Holidays
                  </h2>
                </div>

                <Link
                  href="/packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#F15A24] hover:text-[#d94815] bg-[#F15A24]/10 sm:bg-transparent py-2.5 sm:py-0 px-4 sm:px-0 rounded-xl sm:rounded-none group text-center"
                >
                  <span>Explore All Packages</span>
                  <ArrowRight className="w-4 h-4 text-[#F15A24] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTours.map((relTour) => (
                  <article
                    key={relTour.id}
                    className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group"
                  >
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
                          <Compass className="w-8 h-8 text-[#082B50]" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <h3 className="font-extrabold text-[#082B50] text-sm sm:text-base group-hover:text-[#F15A24] transition-colors line-clamp-2 leading-snug min-h-[44px]">
                        {relTour.name}
                      </h3>

                      <div className="mt-2 pt-3 border-t border-[#E5EAF1] flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs text-slate-500 font-semibold block">
                            {relTour.days}D / {relTour.nights}N
                          </span>
                          <span className="text-xs font-black text-[#082B50]">
                            {formatCurrency(relTour.discounted_price || relTour.price)}
                          </span>
                        </div>

                        <Link
                          href={`/tours/${relTour.slug}`}
                          className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-lg bg-[#082B50] hover:bg-[#F15A24] text-white text-xs font-bold transition-all shadow-xs group/btn cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ====================================================================
              5. BOTTOM INVITATION BANNER
          ==================================================================== */}
          <section className="mt-16 bg-gradient-to-r from-[#082B50] via-[#123F68] to-[#082B50] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-block bg-[#F15A24] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Handcrafted Holiday Experience
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                Ready to Experience {destinationName}?
              </h2>
              <p className="text-slate-200 text-sm sm:text-base mt-3 leading-relaxed font-normal">
                Connect with our local destination experts to personalize hotel stays, sightseeing preferences, and private transportation.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenEnquiry("Bottom Banner Book Button")}
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block leading-tight">
            {originalPriceNum > 0 ? "Starting Price" : "Pricing"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#082B50]">
              {originalPriceNum > 0 ? formatCurrency(displayPrice) : "On Request"}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(strikethroughPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenEnquiry("Mobile Sticky Bottom Book Button")}
          className="bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-sm py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 min-h-[44px]"
        >
          <span>Get Best Quote</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Multi-step Lead Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        defaultDestination={destinationName}
        packageInfo={leadPackageInfo}
      />

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              Photo {selectedPhotoIndex + 1} of {galleryImages.length} • {tour.name}
            </div>

            <button
              type="button"
              aria-label="Close Lightbox"
              onClick={() => setLightboxOpen(false)}
              className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div
            className="relative w-full max-w-5xl aspect-[16/10] max-h-[70vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Previous Image"
              onClick={() =>
                setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
              }
              className="absolute left-2 sm:left-4 z-50 text-white bg-black/60 hover:bg-black/80 p-3 rounded-full cursor-pointer transition-all hover:scale-105 border border-white/20"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/50">
              <Image
                src={galleryImages[selectedPhotoIndex]}
                alt={`${tour.name} - Photo ${selectedPhotoIndex + 1}`}
                fill
                unoptimized={galleryImages[selectedPhotoIndex].startsWith("http")}
                className="object-contain"
              />
            </div>

            <button
              type="button"
              aria-label="Next Image"
              onClick={() =>
                setSelectedPhotoIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-2 sm:right-4 z-50 text-white bg-black/60 hover:bg-black/80 p-3 rounded-full cursor-pointer transition-all hover:scale-105 border border-white/20"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          <div
            className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.map((img, tIdx) => (
              <button
                key={tIdx}
                type="button"
                onClick={() => setSelectedPhotoIndex(tIdx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${selectedPhotoIndex === tIdx
                  ? "border-[#F15A24] scale-105 opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
                  }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${tIdx + 1}`}
                  fill
                  unoptimized={img.startsWith("http")}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
