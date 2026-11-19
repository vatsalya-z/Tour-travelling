"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Calendar,
  Users,
  Compass,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Phone,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Tag,
  Plane,
  Sparkles,
  User,
  ExternalLink,
} from "lucide-react";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import MobileBottomBar from "@/components/shared/MobileBottomBar";
import FloatingContact from "@/components/shared/FloatingContact";
import AuthModal from "@/components/shared/AuthModal";
import { useAuth } from "@/features/auth/AuthContext";
import { FaWhatsapp } from "react-icons/fa6";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Booking, BookingStatus } from "@/types/booking";

interface ParsedInquiryDetails {
  packageName?: string;
  groupType?: string;
  flightHelp?: string;
  dateFlexibility?: string;
  bookingTimeline?: string;
  contactTime?: string;
  source?: string;
  customerNote?: string;
}

function parseInquiryDetails(text: string | null): ParsedInquiryDetails {
  if (!text) return {};
  const res: ParsedInquiryDetails = {};

  const pkgMatch = text.match(/(?:Tour \/ Package|Tour \/ Destination|Package):\s*([^\n•]+)/i);
  if (pkgMatch) res.packageName = pkgMatch[1].trim();

  const groupMatch = text.match(/(?:Travelling With|Group Type|Group):\s*([^\n•]+)/i);
  if (groupMatch) res.groupType = groupMatch[1].trim();

  const flightMatch = text.match(/(?:Flight Assistance|Flight Help):\s*([^\n•]+)/i);
  if (flightMatch) res.flightHelp = flightMatch[1].trim();

  const flexMatch = text.match(/(?:Date Flexibility|Flexibility):\s*([^\n•]+)/i);
  if (flexMatch) res.dateFlexibility = flexMatch[1].trim();

  const timelineMatch = text.match(/(?:Booking Timeline|Timeline):\s*([^\n•]+)/i);
  if (timelineMatch) res.bookingTimeline = timelineMatch[1].trim();

  const contactMatch = text.match(/(?:Best Time to Contact|Contact Time|Best Contact):\s*([^\n•]+)/i);
  if (contactMatch) res.contactTime = contactMatch[1].trim();

  const sourceMatch = text.match(/(?:Source|Enquiry Source):\s*([^\n•]+)/i);
  if (sourceMatch) res.source = sourceMatch[1].trim();

  const noteMatch = text.match(/(?:Customer Note|Customer Message|Notes|Message):\s*([^\n•]+)/i);
  if (noteMatch) res.customerNote = noteMatch[1].trim();

  return res;
}

export default function MyEnquiriesPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [enquiries, setEnquiries] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchUserEnquiries = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const email = user.email || "";
      const userId = user.id || "";
      const res = await fetch(`/api/bookings?user_id=${userId}&customer_email=${encodeURIComponent(email)}&limit=100`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setEnquiries(json.data as Booking[]);
      }
    } catch (err) {
      console.warn("Failed to fetch customer enquiries:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserEnquiries();
    }
  }, [authLoading, fetchUserEnquiries]);

  const filteredEnquiries = enquiries.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Under Review by Expert</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Completed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <TopBar />
      <Header />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Section */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#E52D27] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">My Enquiries</span>
          </div>
        </div>

        

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 mt-8">
          {authLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 text-[#082B50] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Checking your account...</p>
            </div>
          ) : !user ? (
            /* Unauthenticated State */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
              <div className="w-14 h-14 bg-red-50 text-[#E52D27] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sign In to View Your Enquiries</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Please log in with your customer account to view your tour enquiries, travel requests, and customized quotes.
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="mt-6 px-6 py-2.5 rounded-full bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          ) : loading ? (
            /* Loading Enquiries */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 text-[#082B50] animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Fetching your tour enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 bg-[#EAF6FC] text-[#082B50] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#082B50]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Tour Enquiries Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                You haven&apos;t sent any tour queries yet. Explore our top holiday packages for Kashmir, Himachal, Kerala, or Rajasthan, and connect with our destination experts!
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/packages"
                  className="px-6 py-2.5 rounded-full bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all"
                >
                  Browse Tour Packages
                </Link>
                <button
                  type="button"
                  onClick={fetchUserEnquiries}
                  className="px-4 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          ) : (
            /* Enquiries List */
            <div className="space-y-6">
              {/* Cards Grid */}
              <div className="grid grid-cols-1 gap-5">
                {filteredEnquiries.map((b) => {
                  const details = parseInquiryDetails(b.special_requests);
                  const displayTourName =
                    (b as any).tour?.name ||
                    (b as any).tours?.name ||
                    details.packageName ||
                    "Customized Tour Package";

                  const tourImage =
                    (b as any).tour?.cover_image ||
                    "/images/packages/kashmir-5n6d-cover.webp";

                  const tourSlug = (b as any).tour?.slug;

                  const cleanPhone = b.customer_phone?.replace(/[^\d+]/g, "") || "";
                  const waNumber = "919876543210"; // TourTripHolidays official expert contact
                  const waText = encodeURIComponent(
                    `Hi TourTripHolidays! I have an inquiry for "${displayTourName}" (Reference ID: #${b.id.slice(0, 8)}). Please share the latest update.`
                  );

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-extrabold text-[#082B50] bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                            Ref: #{b.id.slice(0, 8)}
                          </span>
                          <span className="text-xs text-slate-500">
                            Submitted on {formatDate(b.created_at)}
                          </span>
                        </div>

                        <div>{getStatusBadge(b.status)}</div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left: Tour Thumbnail + Info */}
                        <div className="lg:col-span-5 flex gap-4 items-start">
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100 shadow-xs">
                            <Image
                              src={tourImage}
                              alt={displayTourName}
                              fill
                              unoptimized={tourImage.startsWith("http")}
                              className="object-cover"
                            />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <h3 className="text-base font-bold text-[#172B4D] leading-snug line-clamp-2">
                              {displayTourName}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                              <Calendar className="w-3.5 h-3.5 text-[#F04B16]" />
                              <span>Travel Date: <strong className="text-slate-800">{formatDate(b.travel_date)}</strong></span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Users className="w-3.5 h-3.5 text-[#F04B16]" />
                              <span>Travellers: <strong className="text-slate-800">{b.travellers_count} Persons</strong></span>
                            </div>

                            <div className="text-xs pt-1">
                              <span className="text-slate-500">Estimated Price: </span>
                              <span className="font-bold text-[#E52D27] text-sm">
                                {b.total_price > 0 ? formatCurrency(b.total_price) : "On Request"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Questionnaire Preferences */}
                        <div className="lg:col-span-4 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Your Trip Preferences
                          </span>

                          <div className="grid grid-cols-2 gap-2 text-slate-700">
                            {details.groupType && (
                              <div>
                                <span className="text-slate-400 text-[10px] block">Group Type</span>
                                <span className="font-semibold text-slate-800">{details.groupType}</span>
                              </div>
                            )}

                            {details.flightHelp && (
                              <div>
                                <span className="text-slate-400 text-[10px] block">Flight Help</span>
                                <span className="font-semibold text-slate-800">{details.flightHelp}</span>
                              </div>
                            )}

                            {details.dateFlexibility && (
                              <div>
                                <span className="text-slate-400 text-[10px] block">Date Flexibility</span>
                                <span className="font-semibold text-slate-800">{details.dateFlexibility}</span>
                              </div>
                            )}

                            {details.bookingTimeline && (
                              <div>
                                <span className="text-slate-400 text-[10px] block">Booking Timeline</span>
                                <span className="font-semibold text-slate-800">{details.bookingTimeline}</span>
                              </div>
                            )}

                            {details.contactTime && (
                              <div className="col-span-2">
                                <span className="text-slate-400 text-[10px] block">Preferred Contact Time</span>
                                <span className="font-semibold text-slate-800">{details.contactTime}</span>
                              </div>
                            )}
                          </div>

                          {details.customerNote && (
                            <div className="pt-2 border-t border-slate-200 mt-1">
                              <span className="text-[10px] text-slate-400 block font-semibold">Your Message:</span>
                              <p className="text-[11px] text-slate-700 italic mt-0.5">
                                &quot;{details.customerNote}&quot;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right: Quick Expert Follow-Up Actions */}
                        <div className="lg:col-span-3 flex flex-col gap-2.5 w-full">
                          <a
                            href={`https://wa.me/${waNumber}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            <FaWhatsapp className="w-4 h-4 text-white" />
                            <span>WhatsApp Expert</span>
                          </a>

                          <a
                            href="tel:+919876543210"
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#082B50] hover:bg-[#123F68] text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call Support</span>
                          </a>

                          {/* {tourSlug && (
                            <Link
                              href={`/packages/${tourSlug}`}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                            >
                              <span>View Itinerary</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )} */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomBar />
      <FloatingContact />

      {/* Auth Modal for guest prompt */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
