"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaChevronRight,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa6";

export default function Footer() {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Tour Packages", href: "/packages" },
    { name: "Destinations", href: "/#destinations" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/#footer" },
  ];

  const popularDestinations = [
    { name: "Kashmir Tour Packages", href: "/packages?search=kashmir" },
    { name: "Himachal Tour Packages", href: "/packages?search=himachal" },
    { name: "Kerala Tour Packages", href: "/packages?search=kerala" },
    { name: "Rajasthan Tour Packages", href: "/packages?search=rajasthan" },
    { name: "Goa Tour Packages", href: "/packages?search=goa" },
    { name: "All Destinations", href: "/#destinations" },
  ];

  return (
    <footer id="footer" className="bg-[#082B50] text-white pt-14 pb-8 border-t border-[#123F68]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-[#123F68]/80">
          {/* Column 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4">
            <Logo variant="dark" className="mb-4" />
            <p className="text-slate-300 text-sm leading-relaxed mt-3 max-w-sm">
              Your trusted domestic travel partner for unforgettable journeys across all 28 states of India. Discover beautiful destinations, customized packages and memorable experiences with TourTripHolidays.
            </p>
          </div>

          {/* Column 2: Quick Links (2.5 cols) */}
          <div className="lg:col-span-2 sm:pl-2">
            <h4 className="text-base font-bold text-white tracking-wide mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-[2px] after:bg-[#F15A24]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-[#F15A24] transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="w-2.5 h-2.5 text-[#F15A24] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Destinations (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-base font-bold text-white tracking-wide mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-[2px] after:bg-[#F15A24]">
              Popular Destinations
            </h4>
            <ul className="space-y-2 text-sm">
              {popularDestinations.map((dest) => (
                <li key={dest.name}>
                  <Link
                    href={dest.href}
                    className="text-slate-300 hover:text-[#F15A24] transition-colors flex items-center gap-1.5 group"
                  >
                    <FaChevronRight className="w-2.5 h-2.5 text-[#F15A24] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    <span>{dest.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us (2.5 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-base font-bold text-white tracking-wide mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-[2px] after:bg-[#F15A24]">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#123F68] flex items-center justify-center flex-shrink-0 text-[#F15A24]">
                  <FaPhone className="w-3.5 h-3.5" />
                </div>
                <a
                  href="tel:+919876543210"
                  className="hover:text-[#F15A24] transition-colors font-medium"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#123F68] flex items-center justify-center flex-shrink-0 text-[#25D366]">
                  <FaWhatsapp className="w-3.5 h-3.5" />
                </div>
                <a
                  href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors font-medium"
                >
                  +91 98765 43210 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#123F68] flex items-center justify-center flex-shrink-0 text-[#F15A24]">
                  <FaEnvelope className="w-3.5 h-3.5" />
                </div>
                <a
                  href="mailto:info@tourtripholidays.com"
                  className="hover:text-[#F15A24] transition-colors"
                >
                  info@tourtripholidays.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#123F68] flex items-center justify-center flex-shrink-0 text-[#F15A24]">
                  <FaLocationDot className="w-3.5 h-3.5" />
                </div>
                <span>New Delhi, India</span>
              </li>
            </ul>

            {/* Social Media Icons with React Icons */}
            <div className="flex items-center gap-2.5 mt-5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-200"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-200"
              >
                <FaFacebookF className="w-3.5 h-3.5" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-200"
              >
                <FaInstagram className="w-3.5 h-3.5" />
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-200"
              >
                <FaYoutube className="w-3.5 h-3.5" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all duration-200"
              >
                <FaLinkedinIn className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Credits & Legal Policies */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <p>© 2026 TourTripHolidays.com | All Rights Reserved.</p>
            <p className="text-slate-400">
              Design And Developed By -{" "}
              <a
                href="https://www.zoomdigital.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 hover:text-[#F15A24] font-medium transition-colors hover:underline"
              >
                Zoom Digital
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="#terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="#cancellation" className="hover:text-white transition-colors">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

