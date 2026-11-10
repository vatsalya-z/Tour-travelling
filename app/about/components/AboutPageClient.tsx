"use client";

import React, { useState } from "react";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import EnquiryModal from "@/components/shared/EnquiryModal";
import FloatingContact from "@/components/shared/FloatingContact";
import MobileBottomBar from "@/components/shared/MobileBottomBar";

import AboutHero from "./AboutHero";
import WhoWeAre from "./WhoWeAre";
import MissionVision from "./MissionVision";
import WhyChooseUs from "./WhyChooseUs";
import ExploreIndia from "./ExploreIndia";
import TravelApproach from "./TravelApproach";
import AboutFAQ from "./AboutFAQ";
import AboutCTA from "./AboutCTA";

export default function AboutPageClient() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      {/* Top Notification Bar */}
      <TopBar />

      {/* Main Navigation Header */}
      <Header />

      {/* About Us Page Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <AboutHero />

        {/* Section 1: Who We Are */}
        <WhoWeAre />

        {/* Section 2: Our Mission and Vision */}
        <MissionVision />

        {/* Section 3: Why Choose TourTripHolidays? */}
        <WhyChooseUs />

        {/* Section 4: Explore the Beauty of India */}
        <ExploreIndia />

        {/* Section 5: Our Travel Approach */}
        <TravelApproach />

        {/* Section 6: Frequently Asked Questions */}
        <AboutFAQ />

        {/* Section 7: Call to Action */}
        <AboutCTA />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Interactive Free Travel Plan / Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDestination="Custom Holiday"
      />

      {/* Floating WhatsApp & Call Buttons (Desktop & Tablet) */}
      <FloatingContact />

      {/* Mobile Sticky Bottom Action Bar */}
      <MobileBottomBar onOpenEnquiry={() => setModalOpen(true)} />
    </div>
  );
}

