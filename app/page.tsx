"use client";

import React, { useState } from "react";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import HeroSection from "@/components/home/HeroSection";
import BenefitsStrip from "@/components/home/BenefitsStrip";
import DestinationsSection from "@/components/home/DestinationsSection";
import PopularPackages from "@/components/home/PopularPackages";
import TravelInterests from "@/components/home/TravelInterests";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/shared/Footer";
import EnquiryModal from "@/components/shared/EnquiryModal";
import FloatingContact from "@/components/shared/FloatingContact";
import MobileBottomBar from "@/components/shared/MobileBottomBar";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("Jammu & Kashmir");

  const handleOpenEnquiry = (destination?: string) => {
    if (destination) setSelectedDestination(destination);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      {/* Section A: Top Information Bar */}
      <TopBar />

      {/* Section B: Main Navigation Header */}
      <Header />

      <main className="flex-1">
        {/* Section C: Panoramic Hero Banner */}
        <HeroSection onOpenEnquiry={() => handleOpenEnquiry("Jammu & Kashmir")} />

        {/* Section D: Service Benefits Strip */}
        <BenefitsStrip />

        {/* Section E: Explore India – All 28 States */}
        <DestinationsSection onSelectDestination={handleOpenEnquiry} />

        {/* Section F: Popular Tour Packages */}
        <PopularPackages onSelectPackage={handleOpenEnquiry} />

        {/* Section G: Travel by Interest */}
        <TravelInterests onSelectInterest={handleOpenEnquiry} />

        {/* Section H: Why Choose TourTripHolidays? */}
        <WhyChooseUs />

        {/* Section I: Customer Testimonials */}
        <Testimonials />

        {/* Section J: Call-To-Action Banner */}
        <CTASection onOpenEnquiry={() => handleOpenEnquiry("Custom Domestic Holiday")} />

        {/* Section K: Newsletter Section */}
        <Newsletter />
      </main>

      {/* Section L: Dark Navy Footer */}
      <Footer />

      {/* Interactive Free Travel Plan / Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDestination={selectedDestination}
      />

      {/* Floating WhatsApp & Call Buttons (Desktop & Tablet) */}
      <FloatingContact />

      {/* Mobile Sticky Bottom Action Bar */}
      <MobileBottomBar onOpenEnquiry={() => handleOpenEnquiry("Custom Holiday")} />
    </div>
  );
}
