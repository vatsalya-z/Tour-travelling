"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on admin login page, render cleanly without dashboard frame
  if (pathname === "/admin/login") {
    return <AdminAuthGuard>{children}</AdminAuthGuard>;
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#F5F8FC] flex text-[#172B4D] font-sans antialiased selection:bg-[#F04B16]/10 selection:text-[#082B50]">
        {/* Fixed Desktop Sidebar & Mobile Drawer */}
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            collapsed ? "lg:pl-[72px]" : "lg:pl-[250px]"
          }`}
        >
          {/* Header */}
          <AdminHeader
            onOpenMobile={() => setMobileOpen(true)}
          />

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Admin Footer */}
          <footer className="border-t border-[#E5EAF1] px-6 py-4 bg-white text-center text-xs text-[#64748B]">
            TourTripHolidays SaaS Admin &copy; {new Date().getFullYear()} – All rights reserved.
          </footer>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
