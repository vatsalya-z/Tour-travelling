"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, Calendar, MapPin, Users } from "lucide-react";
import { FaPhone, FaEnvelope, FaUser, FaWhatsapp } from "react-icons/fa6";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="text-xl font-extrabold text-[#082B50] mb-1">
                Thank You, {formData.name || "Traveler"}!
              </h4>
              <p className="text-sm text-slate-600 max-w-sm mb-4">
                Your travel plan request for <strong>{formData.destination}</strong> has been received. Our dedicated travel advisor will call you within 15 minutes with a customized itinerary and the best discounted price.
              </p>
              <div className="bg-[#EAF6FC] text-[#082B50] text-xs font-bold px-4 py-2 rounded-lg">
                Helpline: +91 98765 43210
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Fill this quick form to receive a free customized itinerary & guaranteed best quotes for domestic tours across India.
              </p>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FaUser className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <FaPhone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24]"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#082B50] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24]"
                  />
                </div>
              </div>

              {/* Destination Select */}
              <div>
                <label className="block text-xs font-bold text-[#082B50] mb-1">
                  Preferred Destination *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24]"
                  >
                    {destinationsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration & Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    Duration
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#F15A24]"
                    >
                      <option value="3 Nights / 4 Days">3 Nights / 4 Days</option>
                      <option value="4 Nights / 5 Days">4 Nights / 5 Days</option>
                      <option value="5 Nights / 6 Days">5 Nights / 6 Days</option>
                      <option value="6 Nights / 7 Days">6 Nights / 7 Days</option>
                      <option value="7+ Nights (Custom)">7+ Nights (Custom)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#082B50] mb-1">
                    Travelers
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={formData.travelers}
                      onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#F15A24]"
                    >
                      <option value="Couple / Honeymoon">Couple / Honeymoon</option>
                      <option value="Family (3-4 Members)">Family (3-4 Members)</option>
                      <option value="Group (5+ Members)">Group (5+ Members)</option>
                      <option value="Solo Traveler">Solo Traveler</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full mt-2 bg-[#F15A24] hover:bg-[#d94815] text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Free Itinerary & Discounted Quote</span>
                <Send className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-500">
                <span>Or speak directly:</span>
                <a
                  href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20plan%20a%20trip."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#25D366] font-bold hover:underline"
                >
                  <FaWhatsapp className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>
                <span>•</span>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-1 text-[#082B50] font-bold hover:underline"
                >
                  <FaPhone className="w-2.5 h-2.5 text-[#F15A24]" />
                  <span>+91 98765 43210</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

