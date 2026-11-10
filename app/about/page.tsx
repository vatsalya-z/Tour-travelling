import type { Metadata } from "next";
import AboutPageClient from "./components/AboutPageClient";

export const metadata: Metadata = {
  title: "About Us | TourTripHolidays – Explore India with Us",
  description:
    "Discover TourTripHolidays, your travel companion for exploring India's beautiful destinations, cultural experiences, and memorable journeys.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}

