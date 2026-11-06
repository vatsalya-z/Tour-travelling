"use client";

import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BenefitsStrip from "@/components/BenefitsStrip";
import DestinationsSection from "@/components/DestinationsSection";
import PopularPackages from "@/components/PopularPackages";
import TravelInterests from "@/components/TravelInterests";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import EnquiryModal from "@/components/EnquiryModal";
import FloatingContact from "@/components/FloatingContact";
import MobileBottomBar from "@/components/MobileBottomBar";

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
