"use client";

import React, { useState } from "react";
import TopBar from "@/components/shared/TopBar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import EnquiryModal from "@/components/shared/EnquiryModal";
import FloatingContact from "@/components/shared/FloatingContact";
import MobileBottomBar from "@/components/shared/MobileBottomBar";

import { AboutPageContent } from "@/types/about";
import AboutHero from "./components/AboutHero";
import WhoWeAre from "./components/WhoWeAre";
import MissionVision from "./components/MissionVision";
import WhyChooseUs from "./components/WhyChooseUs";
import ExploreIndia from "./components/ExploreIndia";
import TravelApproach from "./components/TravelApproach";
import AboutFAQ from "./components/AboutFAQ";
import AboutCTA from "./components/AboutCTA";

interface AboutPageClientProps {
  initialContent: AboutPageContent;
}

export default function AboutPageClient({ initialContent }: AboutPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("India");

  const handleOpenEnquiry = (destination?: string) => {
    if (destination) setSelectedDestination(destination);
    setModalOpen(true);
  };

  const content = initialContent;

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      {/* Top Information Bar */}
      <TopBar />

      {/* Main Navigation Header */}
      <Header />

      <main className="flex-1">
        {/* Section 1: Hero */}
        <AboutHero data={content.hero} />

        {/* Section 2: Who We Are */}
        <WhoWeAre data={content.who_we_are} />

        {/* Section 3: Mission & Vision */}
        <MissionVision data={content.mission_vision} />

        {/* Section 4: Why Choose Us */}
        <WhyChooseUs data={content.why_choose_us} />

        {/* Section 5: Explore India (Experiences, NO view-related-packages) */}
        <ExploreIndia data={content.explore_india} />

        {/* Section 6: Travel Approach (Vertical Zig-Zag Flow) */}
        <TravelApproach data={content.travel_approach} />

        {/* Section 7: FAQs Accordion */}
        <AboutFAQ data={content.faqs} />

        {/* Section 8: CTA Banner */}
        <AboutCTA data={content.cta} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Enquire / WhatsApp Buttons */}
      <FloatingContact />

      {/* Mobile Bottom Fixed Bar */}
      <MobileBottomBar onOpenEnquiry={() => handleOpenEnquiry("Tour Packages")} />

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDestination={selectedDestination}
      />
    </div>
  );
}
