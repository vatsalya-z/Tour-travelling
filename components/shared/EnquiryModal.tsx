"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, Calendar, MapPin, Users } from "lucide-react";
import { FaPhone, FaEnvelope, FaUser, FaWhatsapp } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestination?: string;
}

export default function EnquiryModal({
  isOpen,
  onClose,
  defaultDestination = "",
}: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    destination: defaultDestination || "Kashmir",
    duration: "5 Nights / 6 Days",
    travelers: "2 Adults",
    travelMonth: "Next Month",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("bookings").insert({
          customer_name: formData.name.trim(),
          customer_email: formData.email.trim(),
          customer_phone: formData.phone.trim(),
          travellers_count: parseInt(formData.travelers) || 2,
          travel_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          total_price: 18999,
          status: "pending",
          special_requests: `Destination: ${formData.destination}, Duration: ${formData.duration}, Preferred Period: ${formData.travelMonth}`,
        });
      } catch (err) {
        console.warn("Could not save booking in Supabase:", err);
      }
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  const destinationsList = [
    "Jammu & Kashmir",
    "Himachal Pradesh (Manali / Shimla)",
    "Kerala (Munnar / Alleppey)",
    "Rajasthan (Jaipur / Udaipur)",
    "Goa",
    "Uttarakhand (Rishikesh / Nainital)",
    "Tamil Nadu & South India",
    "Assam & North East",
    "Golden Triangle (Delhi-Agra-Jaipur)",
    "All 28 States - Custom Tour",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#082B50] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-[#F15A24] tracking-wider block">
              TourTripHolidays.com
            </span>
            <h3 className="text-xl font-black tracking-tight">Plan Your Trip Today</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-[#082B50] mb-2">
                Thank You, {formData.name || "Traveler"}!
              </h4>
              <p className="text-sm text-slate-600 mb-6">
                Your enquiry for <span className="font-bold text-[#082B50]">{formData.destination}</span> has been received. Our senior travel expert will connect with you within 15 minutes with a custom quote.
              </p>
              <div className="inline-flex items-center gap-2 bg-[#EAF6FC] text-[#082B50] px-4 py-2 rounded-full text-xs font-bold">
                <span>Direct Hotline: +91 98765 43210</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 font-medium -mt-1 mb-2">
                Get free custom itineraries, best hotel rates, and verified cab quotes for all 28 states of India.
              </p>

              {/* Destination Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#082B50] mb-1">
                  Select Destination
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]/40 focus:border-[#F15A24] text-slate-800"
                  >
                    {destinationsList.map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <FaUser className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]/40 focus:border-[#F15A24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    WhatsApp / Phone *
                  </label>
                  <div className="relative">
                    <FaPhone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]/40 focus:border-[#F15A24]"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#082B50] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]/40 focus:border-[#F15A24]"
                  />
                </div>
              </div>

              {/* Duration & Travelers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    Trip Duration
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]/40 focus:border-[#F15A24] text-slate-800"
                    >
                      <option>3 Nights / 4 Days</option>
                      <option>4 Nights / 5 Days</option>
                      <option>5 Nights / 6 Days</option>
                      <option>6 Nights / 7 Days</option>
                      <option>7+ Nights (Customized)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    No. of Travelers
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={formData.travelers}
                      onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#F15A24]/40 focus:border-[#F15A24] text-slate-800"
                    >
                      <option>2 Adults (Couple)</option>
                      <option>Family (2 Adults + 1 Kid)</option>
                      <option>Family (2 Adults + 2 Kids)</option>
                      <option>Group of 4-6 Friends</option>
                      <option>Large Group (7+)</option>
                      <option>Solo Traveler</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Get Free Quote & Itinerary</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center pt-1">
                <span>🔒 Safe & 100% Spam Free · No Advance Fee Needed</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
