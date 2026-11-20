import { Tour } from "./tour";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  tour_id: string | null;
  tour?: Tour;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  travellers_count: number;
  travel_date: string;
  total_price: number;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

