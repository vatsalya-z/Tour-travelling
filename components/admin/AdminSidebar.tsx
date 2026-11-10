"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  MapPin,
  CalendarCheck,
  Users,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useAuth } from "@/features/auth/AuthContext";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const navigation = [
    {
      name: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Tour Management",
      href: "/admin/tours",
      icon: Compass,
      exact: false,
    },
    {
      name: "Destinations",
      href: "/admin/destinations",
      icon: MapPin,
      exact: false,
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: CalendarCheck,
      exact: false,
    },
    {
      name: "Customers",
      href: "/admin/users",
      icon: Users,
      exact: false,
    },
    {
      name: "Admin Profile",
      href: "/admin/profile",
      icon: UserCog,
      exact: false,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      exact: false,
    },
  ];

  const isActive = (item: (typeof navigation)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E5EAF1] select-none text-[#172B4D] font-sans">
      {/* Brand & Collapse Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5EAF1]">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Logo variant="light" className="scale-90 origin-left" />
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-[#082B50] to-[#123F68] flex items-center justify-center font-black text-white text-sm shadow-xs">
            TT
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-7 h-7 rounded-lg text-[#64748B] hover:text-[#082B50] hover:bg-[#F5F8FC] border border-[#E5EAF1] items-center justify-center transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          {!collapsed && (
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Management
            </p>
          )}
        </div>

        {navigation.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                active
                  ? "bg-[#FFF4EE] text-[#082B50] font-semibold border-l-3 border-[#F04B16]"
                  : "text-[#64748B] hover:bg-[#F5F8FC] hover:text-[#172B4D]"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  active ? "text-[#F04B16]" : "text-[#64748B] group-hover:text-[#082B50]"
                }`}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}

              {/* Active Indicator dot when collapsed */}
              {collapsed && active && (
                <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-[#F04B16]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Actions: Public Site & Logout */}
      <div className="p-3 border-t border-[#E5EAF1] space-y-1 bg-[#FAFCFF]">
        <Link
          href="/"
          target="_blank"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#082B50] hover:bg-[#F0F5FA] transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title={collapsed ? "View Public Website" : undefined}
        >
          <ExternalLink className="w-4 h-4 text-[#64748B] flex-shrink-0" />
          {!collapsed && <span>View Website</span>}
        </Link>

        <button
          onClick={() => signOut()}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#DC4444] hover:bg-[#FEECEC] transition-colors cursor-pointer ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 text-[#DC4444] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && user && (
          <div className="pt-2 px-3 flex items-center gap-2 border-t border-[#E5EAF1] mt-1">
            <div className="w-6 h-6 rounded-full bg-[#082B50] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {user.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[#172B4D] truncate">{user.email}</p>
              <p className="text-[9px] text-[#16A36A] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" /> Authenticated
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[250px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#082B50]/40 backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
