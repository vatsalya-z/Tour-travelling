"use client";

import React from "react";
import { FaWhatsapp, FaPhone } from "react-icons/fa6";

export default function FloatingContact() {
  return (
    <aside
      aria-label="Quick contact buttons"
      className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3 pointer-events-none select-none"
    >
      {/* Floating Call Button */}
      <a
        href="tel:+919876543210"
        title="Call Our Travel Expert"
        aria-label="Call +91 98765 43210"
        className="pointer-events-auto flex items-center gap-2 group cursor-pointer focus:outline-none"
      >
        
        <div className="w-12 h-12 rounded-full bg-[#082B50] hover:bg-[#F15A24] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300">
          <FaPhone className="w-5 h-5 text-white" />
        </div>
      </a>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        aria-label="Chat with us on WhatsApp"
        className="pointer-events-auto flex items-center gap-2 group cursor-pointer relative focus:outline-none"
      >
        
        <div className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300">
          {/* Subtle pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping -z-10" />
          <FaWhatsapp className="w-8 h-8 text-white" />
        </div>
      </a>
    </aside>
  );
}

