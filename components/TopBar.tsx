"use client";

import React from "react";
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

export default function TopBar() {
  return (
    <div className="bg-[#082B50] text-slate-200 text-xs py-2 px-4 border-b border-[#123F68]/40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Left Side: Agency Status & States */}
        <div className="flex items-center gap-2 font-medium">
          <FaLocationDot className="w-3.5 h-3.5 text-[#F15A24] flex-shrink-0" />
          <span>Domestic Travel Agency</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">All 28 States of India</span>
        </div>

        {/* Right Side: Phone, Email, WhatsApp, Social Icons */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
          <a
            href="tel:+919876543210"
            className="flex items-center gap-1.5 hover:text-[#F15A24] transition-colors"
          >
            <FaPhone className="w-3 h-3 text-[#F15A24] flex-shrink-0" />
            <span>+91 98765 43210</span>
          </a>

          {/* <a
            href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
          >
            <FaWhatsapp className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" />
            <span>WhatsApp</span>
          </a> */}

          <a
            href="mailto:info@tourtripholidays.com"
            className="flex items-center gap-1.5 hover:text-[#F15A24] transition-colors"
          >
            <FaEnvelope className="w-3 h-3 text-[#F15A24] flex-shrink-0" />
            <span>info@tourtripholidays.com</span>
          </a>

          {/* Social Icons with React Icons */}
          <div className="flex items-center gap-2 pl-2">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all"
            >
              <FaFacebookF className="w-2.5 h-2.5" />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all"
            >
              <FaInstagram className="w-2.5 h-2.5" />
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-5 h-5 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all"
            >
              <FaYoutube className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

