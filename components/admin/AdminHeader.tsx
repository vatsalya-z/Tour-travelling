"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

interface AdminHeaderProps {
  onOpenMobile: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  onOpenMobile,
  title,
  subtitle,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate dynamic breadcrumb segments from pathname
  const generateBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Admin", href: "/admin" }];

    if (parts.length > 1) {
      if (parts[1] === "tours") {
        crumbs.push({ label: "Tours", href: "/admin/tours" });
        if (parts[2] === "create") {
          crumbs.push({ label: "Create", href: "/admin/tours/create" });
        } else if (parts[3] === "edit") {
          crumbs.push({ label: "Edit Tour", href: pathname });
        }
      } else if (parts[1] === "destinations") {
        crumbs.push({ label: "Destinations", href: "/admin/destinations" });
      } else if (parts[1] === "bookings") {
        crumbs.push({ label: "Bookings", href: "/admin/bookings" });
      } else if (parts[1] === "users") {
        crumbs.push({ label: "Customers", href: "/admin/users" });
      } else if (parts[1] === "blogs") {
        crumbs.push({ label: "Blog Management", href: "/admin/blogs" });
        if (parts[2] === "create") {
          crumbs.push({ label: "Create Blog", href: "/admin/blogs/create" });
        } else if (parts[3] === "edit") {
          crumbs.push({ label: "Edit Blog", href: pathname });
        }
      } else if (parts[1] === "profile") {
        crumbs.push({ label: "Profile", href: "/admin/profile" });
      } else if (parts[1] === "settings") {
        crumbs.push({ label: "Settings", href: "/admin/settings" });
      }
    }

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EAF1] px-4 sm:px-6 h-16 flex items-center justify-between font-sans">
      {/* Left: Mobile Toggle & Breadcrumb Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#082B50] hover:bg-[#F5F8FC] border border-[#E5EAF1] transition-colors cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-[#082B50] truncate">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#082B50] hover:underline transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Search Input, Notification Badge, Admin Avatar & Dropdown */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tours, bookings..."
            className="w-52 lg:w-64 pl-9 pr-3 py-1.5 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] transition-all"
          />
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-lg border border-[#E5EAF1] hover:bg-[#F5F8FC] text-[#64748B] hover:text-[#082B50] flex items-center justify-center transition-colors relative cursor-pointer"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F04B16] rounded-full ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E5EAF1] py-3 z-50 animate-in fade-in duration-150">
              <div className="px-4 pb-2 border-b border-[#E5EAF1] flex items-center justify-between">
                <p className="text-xs font-bold text-[#082B50]">Notifications</p>
                <span className="text-[10px] font-semibold bg-[#EAF6FC] text-[#082B50] px-2 py-0.5 rounded-full">
                  1 New
                </span>
              </div>
              <div className="py-2 px-3 text-xs text-[#64748B] space-y-2">
                <div className="p-2.5 rounded-lg bg-[#F5F8FC] hover:bg-[#EEF4FB] transition-colors flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#172B4D] text-xs">System Online</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      TourTripHolidays SaaS admin environment is active and running.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar & Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-[#F5F8FC] transition-all border border-[#E5EAF1] cursor-pointer"
            aria-expanded={dropdownOpen}
          >
            <div className="w-7 h-7 rounded-md bg-[#082B50] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-[#172B4D] leading-tight truncate max-w-[120px]">
                {profile?.full_name || "Admin"}
              </p>
              <p className="text-[10px] text-[#64748B]">Tour Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E5EAF1] py-1.5 z-50 animate-in fade-in duration-150 text-xs">
              <div className="px-3.5 py-2 border-b border-[#E5EAF1]">
                <p className="font-semibold text-[#172B4D] truncate">
                  {profile?.full_name || "Administrator"}
                </p>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF4EE] text-[#F04B16] rounded text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Access</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[#172B4D] hover:bg-[#F5F8FC] hover:text-[#082B50] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Admin Profile</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[#172B4D] hover:bg-[#F5F8FC] hover:text-[#082B50] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Settings</span>
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[#172B4D] hover:bg-[#F5F8FC] hover:text-[#082B50] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>View Public Website</span>
                </Link>
              </div>

              <div className="border-t border-[#E5EAF1] pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    setDropdownOpen(false);
                    await signOut();
                    router.push("/admin/login");
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#DC4444] hover:bg-[#FEECEC] text-left font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
