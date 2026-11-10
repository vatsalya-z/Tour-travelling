import { Destination } from "./destination";

export type TourStatus = "published" | "draft";

export interface TourItineraryDay {
  day: number;
  title: string;
  description: string;
  activities?: string;
  meals?: string;
  accommodation?: string;
  image?: string;
}

export interface Tour {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  destination_id: string | null;
  destination?: Destination;
  state?: string | null;
  category: string;
  tour_type: string;
  cover_image: string | null;
  gallery_images: string[];
  price: number;
  discounted_price: number | null;
  days: number;
  nights: number;
  max_travellers: number | null;
  min_travellers: number | null;
  available_seats: number | null;
  start_date: string | null;
  end_date: string | null;
  tour_availability?: string | null;
  highlights: string[];
  itinerary: TourItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  pickup_location: string | null;
  drop_location: string | null;
  cancellation_policy: string | null;
  payment_terms: string | null;
  terms?: string | null;
  important_notes: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  status: TourStatus;
  featured?: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

