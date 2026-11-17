-- ==============================================================================
-- TourTripHolidays – Tour Leads Management Schema
-- File: supabase/migrations/004_tour_leads_schema.sql
-- ==============================================================================

-- 1. Create tour_leads table
CREATE TABLE IF NOT EXISTS public.tour_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '+91',
  customer_phone TEXT NOT NULL,
  tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
  tour_name TEXT,
  tour_slug TEXT,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  destination_name TEXT,
  package_url TEXT,
  package_price NUMERIC(10, 2),
  preferred_travel_date DATE,
  travellers_count INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  travelling_with TEXT,
  booking_timeline TEXT,
  travel_date_flexibility TEXT,
  flight_assistance TEXT,
  preferred_contact_time TEXT,
  lead_status TEXT NOT NULL DEFAULT 'NEW' CHECK (lead_status IN ('NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'CONVERTED', 'CLOSED', 'NOT_INTERESTED')),
  source_page TEXT,
  source_cta TEXT,
  admin_notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast search, filter, and reporting
CREATE INDEX IF NOT EXISTS idx_tour_leads_customer_email ON public.tour_leads(customer_email);
CREATE INDEX IF NOT EXISTS idx_tour_leads_customer_phone ON public.tour_leads(customer_phone);
CREATE INDEX IF NOT EXISTS idx_tour_leads_tour_id ON public.tour_leads(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_leads_destination_id ON public.tour_leads(destination_id);
CREATE INDEX IF NOT EXISTS idx_tour_leads_status ON public.tour_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_tour_leads_created_at ON public.tour_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_leads_customer_id ON public.tour_leads(customer_id);

-- 3. Automatic updated_at trigger (reuses handle_updated_at from 001_initial_schema.sql)
DROP TRIGGER IF EXISTS trigger_tour_leads_updated_at ON public.tour_leads;
CREATE TRIGGER trigger_tour_leads_updated_at
  BEFORE UPDATE ON public.tour_leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security (RLS)
ALTER TABLE public.tour_leads ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated users to submit leads (guest enquiry)
DROP POLICY IF EXISTS "Anyone can submit a tour lead" ON public.tour_leads;
CREATE POLICY "Anyone can submit a tour lead"
  ON public.tour_leads FOR INSERT
  WITH CHECK (true);

-- Authenticated customers can view their own submitted leads
DROP POLICY IF EXISTS "Users can view their own tour leads" ON public.tour_leads;
CREATE POLICY "Users can view their own tour leads"
  ON public.tour_leads FOR SELECT
  USING (auth.uid() = customer_id OR public.is_admin());

-- Only admins can view all tour leads
DROP POLICY IF EXISTS "Admins can view all tour leads" ON public.tour_leads;
CREATE POLICY "Admins can view all tour leads"
  ON public.tour_leads FOR SELECT
  USING (public.is_admin());

-- Only admins can update tour leads (status, admin notes, assignment)
DROP POLICY IF EXISTS "Admins can update tour leads" ON public.tour_leads;
CREATE POLICY "Admins can update tour leads"
  ON public.tour_leads FOR UPDATE
  USING (public.is_admin());

-- Only admins can delete tour leads
DROP POLICY IF EXISTS "Admins can delete tour leads" ON public.tour_leads;
CREATE POLICY "Admins can delete tour leads"
  ON public.tour_leads FOR DELETE
  USING (public.is_admin());
