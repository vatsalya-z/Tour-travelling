import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Travel Blog & Destination Guides | TourTripHolidays",
  description:
    "Explore inspiring travel stories, detailed domestic itineraries, state guides, and insider tips across all 28 states of India with TourTripHolidays.",
  openGraph: {
    title: "Travel Blog & Destination Guides | TourTripHolidays",
    description:
      "Explore inspiring travel stories, detailed domestic itineraries, state guides, and insider tips across all 28 states of India with TourTripHolidays.",
    url: "https://tourtripholidays.com/blog",
    siteName: "TourTripHolidays",
    locale: "en_US",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}

