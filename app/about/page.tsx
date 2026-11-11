import React from "react";
import { Metadata } from "next";
import { getAboutContent } from "@/lib/about-service";
import AboutPageClient from "./AboutPageClient";

export const revalidate = 0; // Always serve fresh data

export const metadata: Metadata = {
  title: "About Us | TourTripHolidays",
  description:
    "Learn about TourTripHolidays, your trusted domestic travel specialist across India. Discover handcrafted tour packages, transparent pricing, and 24/7 dedicated assistance.",
};

export default async function AboutPage() {
  const content = await getAboutContent();

  return <AboutPageClient initialContent={content} />;
}

