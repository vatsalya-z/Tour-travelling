"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  FileText,
  Compass,
  MapPin,
  Sparkles,
  BookOpen,
  Info,
  Phone,
} from "lucide-react";
import { FaWhatsapp, FaPhone } from "react-icons/fa6";
import AuthModal from "./AuthModal";
import { useAuth } from "@/features/auth/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, profile, isAdmin, signOut } = useAuth();

  // Scroll detection for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const packageLinks = [
    { name: "All Tour Packages", href: "/packages" },
    { name: "Odisha Tour Packages", href: "/packages?search=odisha" },
    { name: "Kashmir Tour Packages", href: "/packages?search=kashmir" },
    { name: "Himachal Tour Packages", href: "/packages?search=himachal" },
    { name: "Kerala Tour Packages", href: "/packages?search=kerala" },
    { name: "Rajasthan Tour Packages", href: "/packages?search=rajasthan" },
    { name: "Goa Tour Packages", href: "/packages?search=goa" },
    { name: "Golden Triangle Tours", href: "/packages?search=golden" },
    { name: "Uttarakhand Hill Stations", href: "/packages?search=uttarakhand" },
    { name: "North East Holidays", href: "/packages?search=north" },
  ];

  const destinationLinks = [
    { name: "Jammu & Kashmir", href: "/#destinations" },
    { name: "Himachal Pradesh", href: "/#destinations" },
    { name: "Uttarakhand", href: "/#destinations" },
    { name: "Rajasthan", href: "/#destinations" },
    { name: "Kerala", href: "/#destinations" },
    { name: "Goa", href: "/#destinations" },
    { name: "Tamil Nadu", href: "/#destinations" },
    { name: "Assam & North East", href: "/#destinations" },
    { name: "View All 28 States", href: "/#destinations" },
  ];

  // Active page helpers for existing routes
  const isHomeActive = pathname === "/";
  const isPackagesActive = pathname === "/packages" || pathname?.startsWith("/packages");
  const isBlogActive = pathname === "/blog" || pathname?.startsWith("/blog");
  const isAboutActive = pathname === "/about" || pathname?.startsWith("/about");

  return (
    <>
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
            {/* Home Link */}
            <Link
              href="/"
              className={`relative py-1 hover:text-[#F15A24] transition-colors ${
                isHomeActive
                  ? "text-[#F15A24] font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#F15A24] after:rounded-full"
                  : "hover:text-[#F15A24]"
              }`}
            >
              Home
            </Link>

            {/* Tour Packages Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setPackagesOpen(true)}
              onMouseLeave={() => setPackagesOpen(false)}
            >
              <Link
                href="/packages"
                className={`relative py-1 flex items-center gap-1 font-bold transition-colors ${
                  isPackagesActive
                    ? "text-[#F15A24] font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#F15A24] after:rounded-full"
                    : "hover:text-[#F15A24]"
                }`}
              >
                <span>Tour Packages</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    packagesOpen
                      ? "rotate-180 text-[#F15A24]"
                      : isPackagesActive
                      ? "text-[#F15A24]"
                      : "text-slate-500"
                  }`}
                />
              </Link>

              {packagesOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in duration-150">
                  {packageLinks.map((pkg) => (
                    <Link
                      key={pkg.name}
                      href={pkg.href}
                      onClick={() => setPackagesOpen(false)}
                      className={`block px-4 py-2 text-sm font-medium transition-colors ${
                        pkg.href === "/packages" && pathname === "/packages"
                          ? "bg-[#EAF6FC] text-[#F15A24] font-bold"
                          : "text-[#10264A] hover:bg-[#EAF6FC] hover:text-[#F15A24]"
                      }`}
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
              <a
                href="/#destinations"
                className="flex items-center gap-1 hover:text-[#F15A24] transition-colors py-1 cursor-pointer font-bold"
              >
                <span>Destinations</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    destinationsOpen ? "rotate-180 text-[#F15A24]" : "text-slate-500"
                  }`}
                />
              </a>

              {destinationsOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in duration-150">
                  {destinationLinks.map((dest) => (
                    <a
                      key={dest.name}
                      href={dest.href}
                      onClick={() => setDestinationsOpen(false)}
                      className="block px-4 py-2 text-sm text-[#10264A] hover:bg-[#EAF6FC] hover:text-[#F15A24] font-medium transition-colors"
                    >
                      {dest.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className={`relative py-1 hover:text-[#F15A24] transition-colors ${
                isBlogActive
                  ? "text-[#F15A24] font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#F15A24] after:rounded-full"
                  : "hover:text-[#F15A24]"
              }`}
            >
              Blog
            </Link>

            <Link
              href="/about"
              className={`relative py-1 hover:text-[#F15A24] transition-colors ${
                isAboutActive
                  ? "text-[#F15A24] font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#F15A24] after:rounded-full"
                  : "hover:text-[#F15A24]"
              }`}
            >
              About Us
            </Link>

            <Link
              href="/#footer"
              className="hover:text-[#F15A24] transition-colors py-1"
            >
              Contact Us
            </Link>
          </nav>

          {/* Right: Exact WhatsApp Button & Login / User Action */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-[#25D366] hover:text-[#20bd5a] hover:scale-110 transition-all duration-200"
            >
              <FaWhatsapp className="w-10 h-10" />
            </a>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#EAF6FC] hover:bg-[#d9effa] text-[#082B50] text-xs font-bold transition-all border border-[#082B50]/10 cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-[#082B50] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="max-w-[100px] truncate text-xs font-bold text-[#082B50]">
                    {profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-[#082B50] truncate">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#F15A24]/10 text-[#F15A24]">
                          Administrator
                        </span>
                      )}
                    </div>
                    {/* My Enquiries (Desktop) */}
                    <Link
                      href="/my-enquiries"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#082B50] hover:bg-[#EAF6FC] hover:text-[#F15A24] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#F15A24]" />
                      <span>My Enquiries</span>
                    </Link>

                    {isAdmin && (
                      <a
                        href={process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.tourtripholidays.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#082B50] hover:bg-[#EAF6FC] hover:text-[#F15A24]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#F15A24]" />
                        <span>Admin Dashboard</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#082B50] hover:bg-[#123F68] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#F15A24]" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* ===================================================================
              Mobile App-Bar Actions:
              - Direct Call shortcut
              - Direct WhatsApp shortcut
              - 44x44px Touch-friendly Hamburger Button
              =================================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            <a
              href="tel:+919876543210"
              aria-label="Call +91 98765 43210"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EAF6FC] text-[#082B50] flex items-center justify-center hover:bg-[#DCEAF3] active:scale-95 transition-transform"
            >
              <Phone className="w-4 h-4 text-[#082B50]" />
            </a>

            <a
              href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition-transform"
            >
              <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-[#082B50] hover:bg-slate-100 active:scale-90 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          Native-Like Slide-in Mobile Navigation Drawer
          - Backdrop blur overlay
          - Slide-in panel from right (transforms on x-axis)
          - Respects device top and bottom safe areas
          - Grouped app-like list tiles
          ===================================================================== */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-[#082B50]/60 backdrop-blur-xs transition-opacity"
        />

        {/* Slide Drawer Panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[86%] max-w-[340px] bg-white z-10 shadow-2xl flex flex-col justify-between overflow-hidden transform transition-transform duration-300 ease-out pt-safe pb-safe ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 1. Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Logo variant="light" />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center active:scale-90 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              aria-label="Close Navigation Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Scrollable Navigation List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 touch-scroll">
            {/* User Account Tile */}
            <div className="rounded-2xl p-3 bg-gradient-to-br from-[#082B50]/5 to-orange-500/5 border border-slate-200/80">
              {user ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#082B50] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-[#082B50] truncate">{profile?.full_name || "Traveler"}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/my-enquiries"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white border border-sky-100 text-[#082B50] text-xs font-bold rounded-xl shadow-xs active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#F15A24]" />
                      <span>My Enquiries</span>
                    </Link>

                    {isAdmin ? (
                      <a
                        href={process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.tourtripholidays.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#082B50] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#F15A24]" />
                        <span>Admin</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white border border-slate-200 text-red-600 text-xs font-bold rounded-xl shadow-xs active:scale-95"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#082B50]">Welcome, Traveler!</h4>
                    <p className="text-[11px] text-slate-500">Track tour enquiries & bookings</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#082B50] hover:bg-[#F15A24] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#F15A24]" />
                    <span>Login</span>
                  </button>
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            <nav className="space-y-1 font-medium text-[#082B50]">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  isHomeActive
                    ? "text-[#F15A24] bg-[#EAF6FC] font-extrabold"
                    : "text-[#082B50] hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Compass className={`w-4 h-4 ${isHomeActive ? "text-[#F15A24]" : "text-slate-400"}`} />
                  <span className="text-sm">Home</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* Tour Packages Accordion */}
              <div className="rounded-xl overflow-hidden">
                <div
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${
                    isPackagesActive ? "bg-[#EAF6FC]" : "hover:bg-slate-50"
                  }`}
                >
                  <Link
                    href="/packages"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 flex-1 text-sm font-bold ${
                      isPackagesActive ? "text-[#F15A24] font-extrabold" : "text-[#082B50]"
                    }`}
                  >
                    <MapPin className={`w-4 h-4 ${isPackagesActive ? "text-[#F15A24]" : "text-slate-400"}`} />
                    <span>Tour Packages</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setPackagesOpen(!packagesOpen)}
                    className="p-1.5 text-slate-500 hover:text-[#F15A24] cursor-pointer"
                    aria-label="Toggle Tour Packages list"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        packagesOpen ? "rotate-180 text-[#F15A24]" : isPackagesActive ? "text-[#F15A24]" : ""
                      }`}
                    />
                  </button>
                </div>

                {packagesOpen && (
                  <div className="pl-9 pr-2 py-1.5 space-y-1 bg-slate-50/60 rounded-b-xl border-l-2 border-[#F15A24]/40 ml-4 my-1">
                    {packageLinks.map((pkg) => (
                      <Link
                        key={pkg.name}
                        href={pkg.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block py-2 text-xs font-semibold transition-colors ${
                          pkg.href === "/packages" && pathname === "/packages"
                            ? "text-[#F15A24] font-bold"
                            : "text-slate-600 hover:text-[#F15A24]"
                        }`}
                      >
                        {pkg.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Destinations Accordion */}
              <div className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDestinationsOpen(!destinationsOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 text-left font-bold text-[#082B50] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">Destinations</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      destinationsOpen ? "rotate-180 text-[#F15A24]" : ""
                    }`}
                  />
                </button>

                {destinationsOpen && (
                  <div className="pl-9 pr-2 py-1.5 space-y-1 bg-slate-50/60 rounded-b-xl border-l-2 border-[#F15A24]/40 ml-4 my-1">
                    {destinationLinks.map((dest) => (
                      <a
                        key={dest.name}
                        href={dest.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-xs text-slate-600 hover:text-[#F15A24] font-semibold transition-colors"
                      >
                        {dest.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Blog */}
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  isBlogActive
                    ? "text-[#F15A24] bg-[#EAF6FC] font-extrabold"
                    : "text-[#082B50] hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={`w-4 h-4 ${isBlogActive ? "text-[#F15A24]" : "text-slate-400"}`} />
                  <span className="text-sm">Travel Stories & Blog</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* About Us */}
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  isAboutActive
                    ? "text-[#F15A24] bg-[#EAF6FC] font-extrabold"
                    : "text-[#082B50] hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Info className={`w-4 h-4 ${isAboutActive ? "text-[#F15A24]" : "text-slate-400"}`} />
                  <span className="text-sm">About Us</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* Contact Us */}
              <Link
                href="/#footer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-slate-50 font-bold text-[#082B50] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">Contact Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </nav>
          </div>

          {/* 3. Drawer Bottom Action Strip */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#082B50] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
              >
                <FaPhone className="w-3.5 h-3.5 text-[#F15A24]" />
                <span>Call Us</span>
              </a>

              <a
                href="https://wa.me/919876543210?text=Hello%20TourTripHolidays%2C%20I%20would%20like%20to%20enquire%20about%20a%20tour%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
              >
                <FaWhatsapp className="w-4 h-4 text-white" />
                <span>WhatsApp</span>
              </a>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-medium pt-1">
              Domestic Travel Partner • All 28 States of India
            </p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
