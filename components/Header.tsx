"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { ChevronDown, Menu, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const packageLinks = [
    { name: "Kashmir Tour Packages", href: "#packages" },
    { name: "Himachal Tour Packages", href: "#packages" },
    { name: "Kerala Tour Packages", href: "#packages" },
    { name: "Rajasthan Tour Packages", href: "#packages" },
    { name: "Goa Tour Packages", href: "#packages" },
    { name: "Golden Triangle Tours", href: "#packages" },
    { name: "Uttarakhand Hill Stations", href: "#packages" },
    { name: "North East Holidays", href: "#packages" },
  ];

  const destinationLinks = [
    { name: "Jammu & Kashmir", href: "#destinations" },
    { name: "Himachal Pradesh", href: "#destinations" },
    { name: "Uttarakhand", href: "#destinations" },
    { name: "Rajasthan", href: "#destinations" },
    { name: "Kerala", href: "#destinations" },
    { name: "Goa", href: "#destinations" },
    { name: "Tamil Nadu", href: "#destinations" },
    { name: "Assam & North East", href: "#destinations" },
    { name: "View All 28 States", href: "#destinations" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled
          ? "shadow-md py-2.5 border-b border-slate-100"
          : "shadow-xs py-3 border-b border-slate-200/90"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Official Brand Logo from Uploaded Image */}
        <Logo variant="light" />

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-[15px] font-bold text-[#082B50]">
          {/* Home Link with exact orange underline pill */}
          <Link
            href="/"
            className="text-[#F15A24] relative py-1 hover:text-[#F15A24] transition-colors font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#F15A24] after:rounded-full"
          >
            Home
          </Link>

          {/* Tour Packages Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setPackagesOpen(true)}
            onMouseLeave={() => setPackagesOpen(false)}
          >
            <button
              className="flex items-center gap-1 hover:text-[#F15A24] transition-colors py-1 cursor-pointer font-bold"
              onClick={() => setPackagesOpen(!packagesOpen)}
            >
              <span>Tour Packages</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  packagesOpen ? "rotate-180 text-[#F15A24]" : "text-slate-500"
                }`}
              />
            </button>

            {packagesOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in duration-150">
                {packageLinks.map((pkg) => (
                  <Link
                    key={pkg.name}
                    href={pkg.href}
                    onClick={() => setPackagesOpen(false)}
                    className="block px-4 py-2 text-sm text-[#10264A] hover:bg-[#EAF6FC] hover:text-[#F15A24] font-medium transition-colors"
                  >
                    {pkg.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Destinations Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDestinationsOpen(true)}
            onMouseLeave={() => setDestinationsOpen(false)}
          >
            <button
              className="flex items-center gap-1 hover:text-[#F15A24] transition-colors py-1 cursor-pointer font-bold"
              onClick={() => setDestinationsOpen(!destinationsOpen)}
            >
              <span>Destinations</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  destinationsOpen ? "rotate-180 text-[#F15A24]" : "text-slate-500"
                }`}
              />
            </button>

            {destinationsOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in duration-150">
                {destinationLinks.map((dest) => (
                  <Link
                    key={dest.name}
                    href={dest.href}
                    onClick={() => setDestinationsOpen(false)}
                    className="block px-4 py-2 text-sm text-[#10264A] hover:bg-[#EAF6FC] hover:text-[#F15A24] font-medium transition-colors"
                  >
                    {dest.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="#why-choose-us"
            className="hover:text-[#F15A24] transition-colors py-1"
          >
            Travel Guide
          </Link>

          <Link
            href="#why-choose-us"
            className="hover:text-[#F15A24] transition-colors py-1"
          >
            About Us
          </Link>

          <Link
            href="#footer"
            className="hover:text-[#F15A24] transition-colors py-1"
          >
            Contact Us
          </Link>
        </nav>

        {/* Right: Exact WhatsApp Button */}
        <div className="hidden sm:flex items-center">
          <a
            href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 rounded-xl shadow-xs hover:shadow transition-all duration-200 group"
          >
              <FaWhatsapp className="w-6 h-6 text-white" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden p-2 text-[#25D366] hover:bg-green-50 rounded-lg flex items-center justify-center"
            aria-label="WhatsApp"
          >
            <FaWhatsapp className="w-6 h-6 text-[#25D366]" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#082B50] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2 font-medium text-[#082B50]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-extrabold text-[#F15A24] bg-[#EAF6FC]"
            >
              Home
            </Link>

            {/* Mobile Packages Accordion */}
            <div>
              <button
                onClick={() => setPackagesOpen(!packagesOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-bold"
              >
                <span>Tour Packages</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${packagesOpen ? "rotate-180 text-[#F15A24]" : ""}`}
                />
              </button>
              {packagesOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1">
                  {packageLinks.map((pkg) => (
                    <Link
                      key={pkg.name}
                      href={pkg.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm text-slate-600 hover:text-[#F15A24]"
                    >
                      {pkg.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Destinations Accordion */}
            <div>
              <button
                onClick={() => setDestinationsOpen(!destinationsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left font-bold"
              >
                <span>Destinations</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${destinationsOpen ? "rotate-180 text-[#F15A24]" : ""}`}
                />
              </button>
              {destinationsOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1">
                  {destinationLinks.map((dest) => (
                    <Link
                      key={dest.name}
                      href={dest.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-sm text-slate-600 hover:text-[#F15A24]"
                    >
                      {dest.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="#why-choose-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 font-bold"
            >
              Travel Guide
            </Link>

            <Link
              href="#why-choose-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 font-bold"
            >
              About Us
            </Link>

            <Link
              href="#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 font-bold"
            >
              Contact Us
            </Link>


          </nav>
        </div>
      )}
    </header>
  );
}
