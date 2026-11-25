import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTourBySlug, getRelatedTours } from "@/lib/tour-service";
import TourDetailClient from "./TourDetailClient";

interface TourPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    preview?: string;
  }>;
}

/**
 * Dynamic SEO Metadata Generation for individual tour detail page.
 * Uses actual tour data from Supabase backend.
 */
export async function generateMetadata({ params, searchParams }: TourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const isPreview = sParams.preview === "true";
  const tour = await getTourBySlug(slug, isPreview);

  if (!tour || (!isPreview && tour.status !== "published")) {
    return {
      title: "Tour Package Not Found | TourTripHolidays",
      description: "The requested tour package could not be found or is no longer available.",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tourtripholidays.com";
  const canonicalUrl = `${siteUrl}/tours/${tour.slug}`;
  const title = tour.meta_title?.trim() || `${tour.name} | TourTripHolidays`;
  const description =
    tour.meta_description?.trim() ||
    tour.short_description?.trim() ||
    tour.description?.slice(0, 160).trim() ||
    `Book ${tour.name} with TourTripHolidays. Verified hotels, private transfers, and customizable itinerary.`;

  const ogImage = tour.cover_image?.startsWith("http")
    ? tour.cover_image
    : tour.cover_image
    ? `${siteUrl}${tour.cover_image}`
    : `${siteUrl}/images/packages/kashmir-4n5d-cover.webp`;

  return {
    title,
    description,
    keywords: tour.meta_keywords || `${tour.name}, ${tour.destination?.name || tour.state || "India"} tour package, holiday`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "TourTripHolidays",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: tour.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Dynamic Tour Detail Page (Server Component).
 * Fetches tour package by slug from Supabase.
 * Returns 404 if tour doesn't exist or is unpublished/draft.
 */
export default async function TourDetailPage({ params, searchParams }: TourPageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const isPreview = sParams.preview === "true";
  const tour = await getTourBySlug(slug, isPreview);

  // Return proper 404 if package does not exist or is unpublished
  if (!tour || (!isPreview && tour.status !== "published")) {
    notFound();
  }

  // Fetch related published tours from same destination / state
  const relatedTours = await getRelatedTours(tour, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tourtripholidays.com";
  const tourUrl = `${siteUrl}/tours/${tour.slug}`;
  const destName = tour.destination?.name || tour.state || "India";

  // 1. TouristTrip Structured Data Schema
  const touristTripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.name,
    description: tour.short_description || tour.description,
    touristType: tour.category || "Family",
    provider: {
      "@type": "TravelAgency",
      name: "TourTripHolidays",
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: tour.discounted_price || tour.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: tourUrl,
    },
    itinerary: Array.isArray(tour.itinerary)
      ? tour.itinerary.map((day) => ({
          "@type": "ItemList",
          name: `Day ${day.day}: ${day.title}`,
          description: day.description,
        }))
      : undefined,
  };

  // 2. BreadcrumbList Structured Data Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tour Packages",
        item: `${siteUrl}/packages`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: destName,
        item: `${siteUrl}/packages?search=${encodeURIComponent(destName)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: tour.name,
        item: tourUrl,
      },
    ],
  };

  // 3. FAQPage Structured Data Schema (generated only when valid FAQs exist)
  const faqSchema =
    Array.isArray(tour.faqs) && tour.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tour.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      {/* Inject Google Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTripSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Render Client Tour Detail Page */}
      <TourDetailClient tour={tour} relatedTours={relatedTours} />
    </>
  );
}
