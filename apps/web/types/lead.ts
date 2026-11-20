export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "INTERESTED"
  | "CONVERTED"
  | "CLOSED"
  | "NOT_INTERESTED";

export type TravellingWith = "Solo" | "Couple" | "Friends" | "Family";

export type BookingTimeline =
  | "Within 48 Hours"
  | "Within 3 to 4 days"
  | "Within a week"
  | "Within a month"
  | "Just Researching";

export type TravelDateFlexibility =
  | "Date Fixed"
  | "My travel dates are flexible upto 15 days"
  | "I'm just exploring as of now";

export type FlightAssistance =
  | "Flight has been booked already"
  | "I need help with flight booking"
  | "No flights required";

export type PreferredContactTime =
  | "Morning 9 AM - 12 PM"
  | "Noon 12 PM - 3 PM"
  | "Noon 3 PM - 6 PM"
  | "Afternoon 3 PM - 6 PM"
  | "Evening 6 PM - 9 PM";

export interface TourLead {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  country_code: string;
  customer_phone: string;
  tour_id?: string | null;
  tour_name?: string | null;
  tour_slug?: string | null;
  destination_id?: string | null;
  destination_name?: string | null;
  package_url?: string | null;
  package_price?: number | null;
  preferred_travel_date?: string | null;
  travellers_count: number;
  message?: string | null;
  travelling_with?: TravellingWith | string | null;
  booking_timeline?: BookingTimeline | string | null;
  travel_date_flexibility?: TravelDateFlexibility | string | null;
  flight_assistance?: FlightAssistance | string | null;
  preferred_contact_time?: PreferredContactTime | string | null;
  lead_status: LeadStatus;
  source_page?: string | null;
  source_cta?: string | null;
  admin_notes?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;

  // Joined profile relation for assigned admin if queried
  assignee?: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface EnquiryPackageInfo {
  tourId?: string | null;
  tourName?: string | null;
  tourSlug?: string | null;
  destinationId?: string | null;
  destinationName?: string | null;
  packageUrl?: string | null;
  packagePrice?: number | null;
  packageImage?: string | null;
  sourcePage?: string | null;
  sourceCta?: string | null;
}
