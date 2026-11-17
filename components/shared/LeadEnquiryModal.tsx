"use client";

import React, { useState, useId } from "react";
import Image from "next/image";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  TravellingWith,
  BookingTimeline,
  TravelDateFlexibility,
  FlightAssistance,
  PreferredContactTime,
  EnquiryPackageInfo,
} from "@/types/lead";

export interface LeadEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestination?: string;
  packageInfo?: EnquiryPackageInfo;
}

// ---------------------------------------------------------------------------
// SVG Travel Group Artwork Components (matching the screenshot reference)
// ---------------------------------------------------------------------------

function SoloIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="80" cy="80" r="72" fill="#F8FAFC" />
      {/* Shadow */}
      <ellipse cx="80" cy="142" rx="42" ry="6" fill="#E2E8F0" />
      {/* Trolley Suitcase */}
      <rect x="42" y="85" width="22" height="38" rx="4" fill="#E52D27" />
      <rect x="46" y="89" width="14" height="2" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="46" y="94" width="14" height="2" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="50" y="72" width="6" height="13" stroke="#475569" strokeWidth="2.5" fill="none" />
      <circle cx="46" cy="125" r="3" fill="#1E293B" />
      <circle cx="60" cy="125" r="3" fill="#1E293B" />
      {/* Traveler Body */}
      {/* Legs */}
      <path d="M78 108 L76 138" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
      <path d="M92 108 L94 138" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
      {/* Shoes */}
      <ellipse cx="74" cy="139" rx="5" ry="3" fill="#E52D27" />
      <ellipse cx="96" cy="139" rx="5" ry="3" fill="#E52D27" />
      {/* Torso & Jacket */}
      <rect x="73" y="68" width="24" height="42" rx="6" fill="#F15A24" />
      <path d="M85 68 L85 110" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="2 2" />
      <path d="M78 68 L85 78 L92 68" fill="#FFFFFF" />
      {/* Arms */}
      <path d="M73 74 L55 90" stroke="#F15A24" strokeWidth="5" strokeLinecap="round" />
      <path d="M97 74 L104 94" stroke="#F15A24" strokeWidth="5" strokeLinecap="round" />
      {/* Hands */}
      <circle cx="53" cy="91" r="3.5" fill="#FCD34D" />
      <circle cx="105" cy="95" r="3.5" fill="#FCD34D" />
      {/* Head & Hair */}
      <circle cx="85" cy="52" r="11" fill="#FCD34D" />
      <path d="M74 48 C74 38 96 38 96 48 C96 52 93 54 85 54 C77 54 74 52 74 48 Z" fill="#1E293B" />
      {/* Backpack */}
      <rect x="94" y="70" width="10" height="24" rx="4" fill="#082B50" />
    </svg>
  );
}

function CoupleIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="80" cy="80" r="72" fill="#F8FAFC" />
      <ellipse cx="80" cy="142" rx="52" ry="6" fill="#E2E8F0" />
      {/* Person 1 (Left - Male) */}
      <path d="M52 108 L50 138" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 108 L64 138" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="48" cy="139" rx="4.5" ry="2.5" fill="#082B50" />
      <ellipse cx="66" cy="139" rx="4.5" ry="2.5" fill="#082B50" />
      <rect x="48" y="70" width="20" height="40" rx="5" fill="#0284C7" />
      <circle cx="58" cy="54" r="9.5" fill="#FCD34D" />
      <path d="M49 51 C49 43 67 43 67 51 C67 53 65 54 58 54 C51 54 49 53 49 51 Z" fill="#475569" />
      {/* Trolley on far left */}
      <rect x="24" y="92" width="18" height="32" rx="3" fill="#D97706" />
      <circle cx="28" cy="126" r="2.5" fill="#1E293B" />
      <circle cx="38" cy="126" r="2.5" fill="#1E293B" />
      <path d="M33 92 L33 80 L39 80" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 76 L39 80" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />

      {/* Person 2 (Right - Female) */}
      <path d="M96 112 L94 138" stroke="#F43F5E" strokeWidth="5" strokeLinecap="round" />
      <path d="M106 112 L108 138" stroke="#F43F5E" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="92" cy="139" rx="4" ry="2.5" fill="#BE123C" />
      <ellipse cx="110" cy="139" rx="4" ry="2.5" fill="#BE123C" />
      <path d="M92 72 L112 72 L116 110 L88 110 Z" fill="#E52D27" />
      <circle cx="102" cy="54" r="9.5" fill="#FCD34D" />
      <path d="M92 53 C92 42 112 42 112 53 C114 62 108 64 102 64 C96 64 90 62 92 53 Z" fill="#991B1B" />
      {/* Map in hand */}
      <rect x="114" y="78" width="14" height="11" rx="1" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
      <path d="M106 78 L114 82" stroke="#E52D27" strokeWidth="3.5" strokeLinecap="round" />
      {/* Suitcase beside */}
      <rect x="118" y="98" width="16" height="26" rx="3" fill="#475569" />
      <circle cx="122" cy="126" r="2.5" fill="#0F172A" />
      <circle cx="130" cy="126" r="2.5" fill="#0F172A" />
    </svg>
  );
}

function FriendsIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="80" cy="80" r="72" fill="#F8FAFC" />
      <ellipse cx="80" cy="142" rx="58" ry="6" fill="#E2E8F0" />
      {/* Friend 1 (Left - Green) */}
      <rect x="32" y="78" width="18" height="34" rx="4" fill="#0D9488" />
      <path d="M37 112 L35 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M45 112 L47 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="41" cy="64" r="8" fill="#FCD34D" />
      <path d="M33 60 C33 50 49 50 49 60 Z" fill="#1E293B" />
      {/* Raised Hand waving */}
      <path d="M32 82 L20 66" stroke="#0D9488" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="19" cy="65" r="3" fill="#FCD34D" />

      {/* Friend 2 (Mid-Left - Yellow) */}
      <rect x="58" y="74" width="18" height="38" rx="4" fill="#F59E0B" />
      <path d="M63 112 L61 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M71 112 L73 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="67" cy="60" r="8" fill="#FCD34D" />
      <path d="M59 56 C59 46 75 46 75 56 Z" fill="#78350F" />

      {/* Friend 3 (Mid-Right - Red/Coral) */}
      <rect x="84" y="74" width="18" height="38" rx="4" fill="#E52D27" />
      <path d="M89 112 L87 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M97 112 L99 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="93" cy="60" r="8" fill="#FCD34D" />
      <path d="M85 56 C85 46 101 46 101 56 Z" fill="#1E293B" />

      {/* Friend 4 (Right - Purple) */}
      <rect x="110" y="78" width="18" height="34" rx="4" fill="#7C3AED" />
      <path d="M115 112 L113 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M123 112 L125 138" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="119" cy="64" r="8" fill="#FCD34D" />
      <path d="M111 60 C111 50 127 50 127 60 Z" fill="#991B1B" />
      {/* Suitcases at front */}
      <rect x="44" y="104" width="14" height="24" rx="2" fill="#E11D48" />
      <rect x="100" y="102" width="14" height="26" rx="2" fill="#EA580C" />
    </svg>
  );
}

function FamilyIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="80" cy="80" r="72" fill="#F8FAFC" />
      <ellipse cx="80" cy="142" rx="58" ry="6" fill="#E2E8F0" />
      {/* Dad */}
      <rect x="42" y="70" width="19" height="42" rx="5" fill="#0284C7" />
      <path d="M46 112 L44 138" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
      <path d="M56 112 L58 138" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
      <circle cx="51.5" cy="54" r="9" fill="#FCD34D" />
      <path d="M43 51 C43 43 60 43 60 51 Z" fill="#334155" />

      {/* Mom */}
      <path d="M99 74 L117 74 L121 112 L95 112 Z" fill="#F59E0B" />
      <path d="M102 112 L100 138" stroke="#F43F5E" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M112 112 L114 138" stroke="#F43F5E" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="108" cy="55" r="9" fill="#FCD34D" />
      <path d="M98 55 C98 42 118 42 118 55 C120 62 114 65 108 65 C102 65 96 62 98 55 Z" fill="#78350F" />
      {/* Sunhat */}
      <ellipse cx="108" cy="49" rx="15" ry="3.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />

      {/* Kid 1 (Boy in middle) */}
      <rect x="68" y="94" width="13" height="24" rx="3" fill="#10B981" />
      <path d="M71 118 L70 138" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M78 118 L79 138" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="74.5" cy="84" r="6" fill="#FCD34D" />
      <path d="M68 82 C68 76 81 76 81 82 Z" fill="#1E293B" />

      {/* Kid 2 (Girl on right) */}
      <path d="M124 98 L136 98 L138 120 L122 120 Z" fill="#E11D48" />
      <path d="M126 120 L125 138" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <path d="M133 120 L134 138" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="130" cy="88" r="6" fill="#FCD34D" />
      <circle cx="127" cy="85" r="2" fill="#E11D48" />
      <circle cx="133" cy="85" r="2" fill="#E11D48" />

      {/* Luggage */}
      <rect x="26" y="98" width="13" height="26" rx="2" fill="#475569" />
      <circle cx="29" cy="126" r="2" fill="#0F172A" />
      <circle cx="36" cy="126" r="2" fill="#0F172A" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Step Question Definitions
// ---------------------------------------------------------------------------

const TRAVELLING_WITH_OPTIONS: { id: TravellingWith; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "Solo", label: "Solo", icon: SoloIllustration },
  { id: "Couple", label: "Couple", icon: CoupleIllustration },
  { id: "Friends", label: "Friends", icon: FriendsIllustration },
  { id: "Family", label: "Family", icon: FamilyIllustration },
];

const BOOKING_TIMELINE_OPTIONS: BookingTimeline[] = [
  "Within 48 Hours",
  "Within 3 to 4 days",
  "Within a week",
  "Within a month",
  "Just Researching",
];

const TRAVEL_DATE_OPTIONS: TravelDateFlexibility[] = [
  "Date Fixed",
  "My travel dates are flexible upto 15 days",
  "I'm just exploring as of now",
];

const FLIGHT_ASSISTANCE_OPTIONS: FlightAssistance[] = [
  "Flight has been booked already",
  "I need help with flight booking",
  "No flights required",
];

const CONTACT_TIME_OPTIONS: PreferredContactTime[] = [
  "Morning 9 AM - 12 PM",
  "Noon 12 PM - 3 PM",
  "Noon 3 PM - 6 PM",
  "Evening 6 PM - 9 PM",
];

const COUNTRY_CODES = [
  { code: "+91", label: "+91 (India)" },
  { code: "+1", label: "+1 (USA/Canada)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
];

const getInitialTravelDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
};

export default function LeadEnquiryModal({
  isOpen,
  onClose,
  defaultDestination = "Kashmir",
  packageInfo,
}: LeadEnquiryModalProps) {
  const { user, profile } = useAuth();
  const dateInputId = useId();

  // Current Step (1 to 7)
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State initialized with authenticated user profile prefill
  const [formData, setFormData] = useState(() => ({
    customer_name: profile?.full_name || (user?.user_metadata?.full_name as string) || "",
    customer_email: profile?.email || user?.email || "",
    country_code: "+91",
    customer_phone: profile?.mobile_number || (user?.user_metadata?.mobile_number as string) || "",
    preferred_travel_date: getInitialTravelDate(),
    travellers_count: 2,
    message: "",
    travelling_with: "Couple" as TravellingWith,
    booking_timeline: "Within a week" as BookingTimeline,
    travel_date_flexibility: "Date Fixed" as TravelDateFlexibility,
    flight_assistance: "I need help with flight booking" as FlightAssistance,
    preferred_contact_time: "Noon 12 PM - 3 PM" as PreferredContactTime,
  }));

  // Validation errors for Step 1
  const [step1Errors, setStep1Errors] = useState<{
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    preferred_travel_date?: string;
    travellers_count?: string;
  }>({});

  // Set minimum date to today
  const todayStr = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  // Destination / Package title to display
  const displayTitle =
    packageInfo?.destinationName ||
    packageInfo?.tourName ||
    defaultDestination ||
    "Kashmir";

  // Thumbnail image
  const displayImage =
    packageInfo?.packageImage ||
    (displayTitle.toLowerCase().includes("himachal")
      ? "/images/packages/himachal.jpg"
      : displayTitle.toLowerCase().includes("kerala")
      ? "/images/packages/kerala.jpg"
      : displayTitle.toLowerCase().includes("rajasthan")
      ? "/images/packages/rajasthan.jpg"
      : displayTitle.toLowerCase().includes("goa")
      ? "/images/packages/goa.jpg"
      : "/images/packages/kashmir.jpg");

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errors: typeof step1Errors = {};

    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      errors.customer_name = "Please enter your full name.";
    }

    const cleanPhone = formData.customer_phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.customer_phone = "Please enter a valid 10-digit mobile number.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customer_email.trim() || !emailRegex.test(formData.customer_email.trim())) {
      errors.customer_email = "Please enter a valid email address.";
    }

    if (!formData.preferred_travel_date) {
      errors.preferred_travel_date = "Please select a travel date.";
    } else {
      const selected = new Date(formData.preferred_travel_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.preferred_travel_date = "Travel date cannot be in the past.";
      }
    }

    if (!formData.travellers_count || formData.travellers_count < 1) {
      errors.travellers_count = "At least 1 traveller required.";
    }

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  // Submit complete lead to backend
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      customer_id: user?.id || null,
      customer_name: formData.customer_name.trim(),
      customer_email: formData.customer_email.trim(),
      country_code: formData.country_code,
      customer_phone: formData.customer_phone.trim(),
      tour_id: packageInfo?.tourId || null,
      tour_name: packageInfo?.tourName || (packageInfo?.destinationName ? `${packageInfo.destinationName} Tour Package` : `${displayTitle} Tour`),
      tour_slug: packageInfo?.tourSlug || null,
      destination_id: packageInfo?.destinationId || null,
      destination_name: packageInfo?.destinationName || displayTitle,
      package_url: packageInfo?.packageUrl || (typeof window !== "undefined" ? window.location.href : null),
      package_price: packageInfo?.packagePrice || null,
      preferred_travel_date: formData.preferred_travel_date,
      travellers_count: formData.travellers_count,
      message: formData.message.trim() || null,
      travelling_with: formData.travelling_with,
      booking_timeline: formData.booking_timeline,
      travel_date_flexibility: formData.travel_date_flexibility,
      flight_assistance: formData.flight_assistance,
      preferred_contact_time: formData.preferred_contact_time,
      source_page: packageInfo?.sourcePage || (typeof window !== "undefined" ? window.location.pathname : "Website"),
      source_cta: packageInfo?.sourceCta || "Multi-Step Enquiry Modal",
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit enquiry. Please try again.");
      }

      // Success -> move to Step 7
      setStep(7);
    } catch (err: unknown) {
      console.error("Lead submission error:", err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Reusable Persistent Header for Steps 2 to 6
  // ---------------------------------------------------------------------------
  const renderPersistentHeader = () => (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
      <div className="flex items-center gap-3">
        {/* Red circle with white checkmark badge */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#E52D27] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#172B4D] leading-tight">
            Thanks{" "}
            <span className="text-[#E52D27] font-black">
              {formData.customer_name ? formData.customer_name.split(" ")[0] : "Traveler"}!
            </span>
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            We have few more questions to curate your trip
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        type="button"
        aria-label="Close dialog"
        className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tour enquiry lead form"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Modal Scrollable Content Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {/* =============================================================== */}
          {/* STEP 1: Basic Travel Enquiry Details                            */}
          {/* =============================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Header: Destination Thumbnail + Title + Close */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-xs border border-slate-100">
                    <Image
                      src={displayImage}
                      alt={displayTitle}
                      fill
                      unoptimized={displayImage.startsWith("http")}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#082B50] tracking-tight">
                      {displayTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">Plan your next trip</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Pill Badge: No Cost EMI */}
              <div className="inline-flex items-center gap-1.5 bg-[#EAF6FC] text-[#082B50] px-3.5 py-1.5 rounded-full text-xs font-bold border border-sky-100">
                <span className="underline underline-offset-2">No Cost EMI options available</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleStep1Submit} className="space-y-3.5 pt-1">
                {/* 1. Full Name */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      name="customer_name"
                      placeholder="Your Full Name"
                      value={formData.customer_name}
                      onChange={(e) => {
                        setFormData({ ...formData, customer_name: e.target.value });
                        if (step1Errors.customer_name) setStep1Errors({ ...step1Errors, customer_name: undefined });
                      }}
                      className={`w-full px-4 py-3 text-sm text-slate-900 bg-white border ${
                        step1Errors.customer_name ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                      } rounded-xl placeholder-slate-400 focus:outline-hidden focus:border-[#E52D27] focus:ring-2 focus:ring-[#E52D27]/20 transition-all font-medium`}
                    />
                  </div>
                  {step1Errors.customer_name && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold">{step1Errors.customer_name}</p>
                  )}
                </div>

                {/* 2. Mobile Number with Country Code */}
                <div>
                  <div className="flex gap-2">
                    <select
                      value={formData.country_code}
                      onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                      className="w-24 px-2 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#E52D27] focus:ring-2 focus:ring-[#E52D27]/20 cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1">
                      <input
                        type="tel"
                        name="customer_phone"
                        placeholder="Mobile Number"
                        maxLength={15}
                        value={formData.customer_phone}
                        onChange={(e) => {
                          setFormData({ ...formData, customer_phone: e.target.value });
                          if (step1Errors.customer_phone) setStep1Errors({ ...step1Errors, customer_phone: undefined });
                        }}
                        className={`w-full px-4 py-3 text-sm text-slate-900 bg-white border ${
                          step1Errors.customer_phone ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                        } rounded-xl placeholder-slate-400 focus:outline-hidden focus:border-[#E52D27] focus:ring-2 focus:ring-[#E52D27]/20 transition-all font-medium`}
                      />
                    </div>
                  </div>
                  {step1Errors.customer_phone && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold">{step1Errors.customer_phone}</p>
                  )}
                </div>

                {/* 3. Email Address */}
                <div>
                  <input
                    type="email"
                    name="customer_email"
                    placeholder="Email Address"
                    value={formData.customer_email}
                    onChange={(e) => {
                      setFormData({ ...formData, customer_email: e.target.value });
                      if (step1Errors.customer_email) setStep1Errors({ ...step1Errors, customer_email: undefined });
                    }}
                    className={`w-full px-4 py-3 text-sm text-slate-900 bg-white border ${
                      step1Errors.customer_email ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                    } rounded-xl placeholder-slate-400 focus:outline-hidden focus:border-[#E52D27] focus:ring-2 focus:ring-[#E52D27]/20 transition-all font-medium`}
                  />
                  {step1Errors.customer_email && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold">{step1Errors.customer_email}</p>
                  )}
                </div>

                {/* 4. Travel Date & Travellers Count (2-Col Grid) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={dateInputId} className="block text-[11px] font-bold text-slate-600 mb-1">
                      Travel Date *
                    </label>
                    <div className="relative">
                      <input
                        id={dateInputId}
                        type="date"
                        min={todayStr}
                        value={formData.preferred_travel_date}
                        onChange={(e) => {
                          setFormData({ ...formData, preferred_travel_date: e.target.value });
                          if (step1Errors.preferred_travel_date)
                            setStep1Errors({ ...step1Errors, preferred_travel_date: undefined });
                        }}
                        className={`w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 bg-white border ${
                          step1Errors.preferred_travel_date ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                        } rounded-xl focus:outline-hidden focus:border-[#E52D27] focus:ring-2 focus:ring-[#E52D27]/20 font-medium`}
                      />
                    </div>
                    {step1Errors.preferred_travel_date && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">
                        {step1Errors.preferred_travel_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Travellers Count *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={formData.travellers_count}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setFormData({ ...formData, travellers_count: isNaN(val) ? 1 : val });
                          if (step1Errors.travellers_count)
                            setStep1Errors({ ...step1Errors, travellers_count: undefined });
                        }}
                        className={`w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 bg-white border ${
                          step1Errors.travellers_count ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                        } rounded-xl focus:outline-hidden focus:border-[#E52D27] focus:ring-2 focus:ring-[#E52D27]/20 font-medium`}
                      />
                    </div>
                    {step1Errors.travellers_count && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{step1Errors.travellers_count}</p>
                    )}
                  </div>
                </div>

                {/* 5. Message (Optional) */}
                <div>
                  <textarea
                    rows={2}
                    placeholder="Message (optional)"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-hidden focus:border-[#E52D27] focus:ring-2 focus:ring-[#E52D27]/20 transition-all font-medium resize-none"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 sm:py-4 rounded-xl bg-[#E52D27] hover:bg-[#c9221c] text-white font-extrabold text-sm sm:text-base tracking-wide shadow-md shadow-red-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Connect with Expert</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2: Planning This Trip With? (Solo / Couple / Friends / Family) */}
          {/* =============================================================== */}
          {step === 2 && (
            <div>
              {renderPersistentHeader()}

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base sm:text-lg font-bold text-[#172B4D]">
                  Planning this trip with?
                </h4>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Step 2 of 6
                </span>
              </div>

              {/* 2x2 Grid Selection Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4">
                {TRAVELLING_WITH_OPTIONS.map((opt) => {
                  const IconComponent = opt.icon;
                  const isSelected = formData.travelling_with === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setFormData({ ...formData, travelling_with: opt.id })}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                        isSelected
                          ? "border-[#E52D27] bg-[#FFF5F5] shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                        <IconComponent className="w-full h-full" />
                      </div>
                      <span
                        className={`mt-2 font-bold text-sm sm:text-base ${
                          isSelected ? "text-[#E52D27]" : "text-[#172B4D]"
                        }`}
                      >
                        {opt.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E52D27] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: Booking Timeline                                        */}
          {/* =============================================================== */}
          {step === 3 && (
            <div>
              {renderPersistentHeader()}

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base sm:text-lg font-bold text-[#172B4D]">
                  How soon would you like to book this trip?
                </h4>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Step 3 of 6
                </span>
              </div>

              {/* Radio-Style Options */}
              <div className="space-y-3 my-4">
                {BOOKING_TIMELINE_OPTIONS.map((timeline) => {
                  const isSelected = formData.booking_timeline === timeline;
                  return (
                    <div
                      key={timeline}
                      onClick={() => setFormData({ ...formData, booking_timeline: timeline })}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? "border-[#E52D27] bg-[#FFF5F5]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isSelected ? "border-[#E52D27] bg-[#E52D27]" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isSelected ? "text-[#E52D27]" : "text-slate-800"
                        }`}
                      >
                        {timeline}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 4: Travel Date Confirmation (Fixed / Flexible / Exploring)  */}
          {/* =============================================================== */}
          {step === 4 && (
            <div>
              {renderPersistentHeader()}

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base sm:text-lg font-bold text-[#172B4D]">
                  Is your travel date fixed?
                </h4>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Step 4 of 6
                </span>
              </div>

              <div className="space-y-3 my-4">
                {TRAVEL_DATE_OPTIONS.map((opt) => {
                  const isSelected = formData.travel_date_flexibility === opt;
                  return (
                    <div
                      key={opt}
                      onClick={() => setFormData({ ...formData, travel_date_flexibility: opt })}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? "border-[#E52D27] bg-[#FFF5F5]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isSelected ? "border-[#E52D27] bg-[#E52D27]" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isSelected ? "text-[#E52D27]" : "text-slate-800"
                        }`}
                      >
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 5: Flight Booking Assistance                               */}
          {/* =============================================================== */}
          {step === 5 && (
            <div>
              {renderPersistentHeader()}

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base sm:text-lg font-bold text-[#172B4D]">
                  Do you need help with flight booking?
                </h4>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Step 5 of 6
                </span>
              </div>

              <div className="space-y-3 my-4">
                {FLIGHT_ASSISTANCE_OPTIONS.map((opt) => {
                  const isSelected = formData.flight_assistance === opt;
                  return (
                    <div
                      key={opt}
                      onClick={() => setFormData({ ...formData, flight_assistance: opt })}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? "border-[#E52D27] bg-[#FFF5F5]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isSelected ? "border-[#E52D27] bg-[#E52D27]" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isSelected ? "text-[#E52D27]" : "text-slate-800"
                        }`}
                      >
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 6: Preferred Contact Time & Final Submission               */}
          {/* =============================================================== */}
          {step === 6 && (
            <div>
              {renderPersistentHeader()}

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base sm:text-lg font-bold text-[#172B4D]">
                  What is the best time to get in touch with you?
                </h4>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Step 6 of 6
                </span>
              </div>

              {submitError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="space-y-3 my-4">
                {CONTACT_TIME_OPTIONS.map((timeOpt) => {
                  const isSelected = formData.preferred_contact_time === timeOpt;
                  return (
                    <div
                      key={timeOpt}
                      onClick={() => setFormData({ ...formData, preferred_contact_time: timeOpt })}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? "border-[#E52D27] bg-[#FFF5F5]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isSelected ? "border-[#E52D27] bg-[#E52D27]" : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span
                        className={`text-sm sm:text-base font-semibold ${
                          isSelected ? "text-[#E52D27]" : "text-slate-800"
                        }`}
                      >
                        {timeOpt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions: Back & Final Connect with Expert button */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Enquiry</span>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 7: Final Submission / Success Screen                       */}
          {/* =============================================================== */}
          {step === 7 && (
            <div className="relative py-8 sm:py-12 text-center animate-in zoom-in-95 duration-300">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-0 right-0 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Large Red Checkmark Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#E52D27] rounded-full mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-red-500/25">
                <Check className="w-12 h-12 sm:w-14 sm:h-14 stroke-[3]" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Thank you,{" "}
                <span className="text-[#E52D27]">
                  {formData.customer_name ? formData.customer_name.split(" ")[0] : "Traveler"}!
                </span>
              </h3>

              <p className="text-sm sm:text-base text-slate-500 font-medium mt-3 max-w-sm mx-auto leading-relaxed">
                Our destination expert will reach out to you shortly!
              </p>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-[#082B50] hover:bg-[#123F68] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
