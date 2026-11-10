"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { ChevronDown, Menu, X, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
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

  const packageLinks = [
    { name: "All Tour Packages", href: "/packages" },
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
                pathname === "/"
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
              href="/about"
              className={`relative py-1 hover:text-[#F15A24] transition-colors ${
                pathname === "/about"
                  ? "text-[#F15A24] font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#F15A24] after:rounded-full"
                  : "hover:text-[#F15A24]"
              }`}
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
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#082B50] hover:bg-[#EAF6FC] hover:text-[#F15A24]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#F15A24]" />
                        <span>Admin Dashboard</span>
                      </Link>
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
                className={`px-3 py-2 rounded-lg font-bold transition-colors ${
                  pathname === "/"
                    ? "font-extrabold text-[#F15A24] bg-[#EAF6FC]"
                    : "hover:bg-slate-50 text-[#082B50]"
                }`}
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
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg font-bold transition-colors ${
                  pathname === "/about"
                    ? "font-extrabold text-[#F15A24] bg-[#EAF6FC]"
                    : "hover:bg-slate-50 text-[#082B50]"
                }`}
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

              {/* Mobile Auth Button */}
              <div className="pt-3 border-t border-slate-100">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#082B50] text-white flex items-center justify-center text-xs font-bold">
                        {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#082B50] truncate">{profile?.full_name || "User"}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-[#082B50] text-white text-xs font-bold rounded-lg shadow-xs"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#F15A24]" />
                        <span>Go to Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      className="w-full py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg text-center cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#082B50] text-white text-xs font-bold py-2.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#F15A24]" />
                    <span>Login / Register</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
