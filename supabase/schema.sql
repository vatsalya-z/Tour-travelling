-- ==============================================================================
-- TourTripHolidays – Complete Supabase SQL Setup Script
-- File: supabase/schema.sql
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to: SQL Editor -> "New query"
-- 3. Paste the entire content of this file and click "Run" (Ctrl+Enter / Cmd+Enter).
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (User profiles synced with Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  mobile_number TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'customer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 2. DESTINATIONS TABLE (Indian States, Regions & Holiday Spots)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  best_time_to_visit TEXT,
  attractions JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_status ON public.destinations(status);
CREATE INDEX IF NOT EXISTS idx_destinations_state ON public.destinations(state);

-- ==============================================================================
-- 3. TOURS TABLE (Domestic Packages Catalog & Inventory)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  state TEXT,
  category TEXT NOT NULL DEFAULT 'Family',
  tour_type TEXT NOT NULL DEFAULT 'Customized Tour',
  cover_image TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discounted_price NUMERIC(10, 2),
  days INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL DEFAULT 0,
  max_travellers INTEGER DEFAULT 15,
  min_travellers INTEGER DEFAULT 1,
  available_seats INTEGER DEFAULT 20,
  start_date DATE,
  end_date DATE,
  tour_availability TEXT DEFAULT 'All Year Round',
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
  inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
  pickup_location TEXT,
  drop_location TEXT,
  cancellation_policy TEXT,
  payment_terms TEXT,
  terms TEXT,
  important_notes TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tours_slug ON public.tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_status ON public.tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON public.tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_tours_category ON public.tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_price ON public.tours(price);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON public.tours(featured);

-- ==============================================================================
-- 4. BOOKINGS TABLE (Customer Bookings & Inquiries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  travellers_count INTEGER NOT NULL DEFAULT 1,
  travel_date DATE NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_tour ON public.bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON public.bookings(created_at DESC);

-- ==============================================================================
-- 5. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_destinations_updated_at ON public.destinations;
CREATE TRIGGER trigger_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_tours_updated_at ON public.tours;
CREATE TRIGGER trigger_tours_updated_at
  BEFORE UPDATE ON public.tours
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON public.bookings;
CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. AUTH.USERS AUTO-SYNC TRIGGER (Creates profile upon signup)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'user';
BEGIN
  -- If dev admin email or explicit role metadata is provided
  IF NEW.email = 'dev@tourtripholidays.com' THEN
    assigned_role := 'admin';
  ELSIF (NEW.raw_user_meta_data->>'role') = 'admin' THEN
    assigned_role := 'admin';
  ELSIF (NEW.raw_user_meta_data->>'role') IS NOT NULL AND (NEW.raw_user_meta_data->>'role') IN ('admin', 'user', 'customer') THEN
    assigned_role := (NEW.raw_user_meta_data->>'role');
  END IF;

  INSERT INTO public.profiles (id, full_name, email, mobile_number, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    mobile_number = EXCLUDED.mobile_number,
    role = CASE WHEN EXCLUDED.role = 'admin' THEN 'admin' ELSE profiles.role END,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Helper function: checks if requesting user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
CREATE POLICY "Admin can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- --- DESTINATIONS POLICIES ---
DROP POLICY IF EXISTS "Anyone can view published destinations" ON public.destinations;
CREATE POLICY "Anyone can view published destinations"
  ON public.destinations FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert destinations" ON public.destinations;
CREATE POLICY "Admin can insert destinations"
  ON public.destinations FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update destinations" ON public.destinations;
CREATE POLICY "Admin can update destinations"
  ON public.destinations FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete destinations" ON public.destinations;
CREATE POLICY "Admin can delete destinations"
  ON public.destinations FOR DELETE
  USING (public.is_admin());

-- --- TOURS POLICIES ---
DROP POLICY IF EXISTS "Anyone can view published tours" ON public.tours;
CREATE POLICY "Anyone can view published tours"
  ON public.tours FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert tours" ON public.tours;
CREATE POLICY "Admin can insert tours"
  ON public.tours FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update tours" ON public.tours;
CREATE POLICY "Admin can update tours"
  ON public.tours FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete tours" ON public.tours;
CREATE POLICY "Admin can delete tours"
  ON public.tours FOR DELETE
  USING (public.is_admin());

-- --- BOOKINGS POLICIES ---
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit a booking" ON public.bookings;
CREATE POLICY "Anyone can submit a booking"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update bookings" ON public.bookings;
CREATE POLICY "Admin can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete bookings" ON public.bookings;
CREATE POLICY "Admin can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- 8. STORAGE BUCKET: tour-images (Upload covers, galleries, destinations)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('tour-images', 'tour-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can view all images in tour-images
DROP POLICY IF EXISTS "Tour images are publicly accessible" ON storage.objects;
CREATE POLICY "Tour images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tour-images');

-- Authenticated users/admins can upload images
DROP POLICY IF EXISTS "Admins can upload tour images" ON storage.objects;
CREATE POLICY "Admins can upload tour images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tour-images' AND (auth.role() = 'authenticated'));

-- Authenticated users/admins can update images
DROP POLICY IF EXISTS "Admins can update tour images" ON storage.objects;
CREATE POLICY "Admins can update tour images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tour-images' AND (auth.role() = 'authenticated'));

-- Authenticated users/admins can delete images
DROP POLICY IF EXISTS "Admins can delete tour images" ON storage.objects;
CREATE POLICY "Admins can delete tour images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tour-images' AND (auth.role() = 'authenticated'));

-- ==============================================================================
-- 9. SEED DATA: 8 Top Destinations (Matches Existing Website)
-- ==============================================================================
INSERT INTO public.destinations (name, slug, state, description, cover_image, status)
VALUES
  ('Jammu & Kashmir', 'jammu-and-kashmir', 'Jammu & Kashmir', 'Paradise on Earth with scenic Dal Lake, Gulmarg snow meadows and Pahalgam valleys.', '/images/destinations/kashmir.jpg', 'published'),
  ('Himachal Pradesh', 'himachal-pradesh', 'Himachal Pradesh', 'Land of snowy peaks, pine forests, Manali, Shimla, and Dharamshala.', '/images/destinations/himachal.jpg', 'published'),
  ('Uttarakhand', 'uttarakhand', 'Uttarakhand', 'Devbhoomi with divine Rishikesh, Mussoorie queen of hills, and Nainital lakes.', '/images/destinations/uttarakhand.jpg', 'published'),
  ('Rajasthan', 'rajasthan', 'Rajasthan', 'Royal heritage palaces, golden desert safari in Jaisalmer, Udaipur lakes.', '/images/destinations/rajasthan.jpg', 'published'),
  ('Kerala', 'kerala', 'Kerala', 'Gods Own Country with serene backwaters, Alleppey houseboats, Munnar tea gardens.', '/images/destinations/kerala.jpg', 'published'),
  ('Goa', 'goa', 'Goa', 'Sun, golden sand beaches, lively nightlife, and Portuguese heritage architecture.', '/images/destinations/goa.jpg', 'published'),
  ('Tamil Nadu', 'tamil-nadu', 'Tamil Nadu', 'Ancient Dravidian temple towers, Meenakshi temple, and scenic Ooty hills.', '/images/destinations/tamil-nadu.jpg', 'published'),
  ('Assam', 'assam', 'Assam', 'Gateway to the North East, Kaziranga one-horned rhinos, and Brahmaputra river.', '/images/destinations/assam.jpg', 'published')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 10. SEED DATA: Popular Tour Packages (Linked with Destinations)
-- ==============================================================================
INSERT INTO public.tours (
  name,
  slug,
  short_description,
  description,
  state,
  category,
  tour_type,
  cover_image,
  price,
  discounted_price,
  days,
  nights,
  featured,
  status,
  highlights,
  itinerary,
  inclusions,
  exclusions
) VALUES
(
  'Majestic Kashmir Paradise Tour',
  'majestic-kashmir-paradise-tour',
  'Explore Srinagar, Gulmarg, and Pahalgam with Dal Lake houseboat stay.',
  'Experience the breathtaking beauty of Kashmir with Shikara rides on Dal Lake, skiing in Gulmarg, and the pine valleys of Pahalgam.',
  'Jammu & Kashmir',
  'Family',
  'Customized Tour',
  '/images/packages/kashmir-package.jpg',
  24999,
  21999,
  6,
  5,
  true,
  'published',
  '["Dal Lake Shikara Ride", "Gulmarg Gondola Ride", "Pahalgam Valley Excursion", "Houseboat Stay with Dinner"]'::jsonb,
  '[
    {"day": 1, "title": "Arrival in Srinagar & Shikara Ride", "description": "Welcome to Srinagar airport, transfer to luxury houseboat, evening Shikara ride on Dal Lake.", "meals": "Dinner", "accommodation": "Deluxe Houseboat"},
    {"day": 2, "title": "Srinagar to Gulmarg Day Trip", "description": "Full day trip to Gulmarg, experience the highest cable car gondola and snow views.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Srinagar"},
    {"day": 3, "title": "Srinagar to Pahalgam Valley", "description": "Drive through saffron fields and pine forests to Pahalgam, Betaab Valley visit.", "meals": "Breakfast & Dinner", "accommodation": "Resort in Pahalgam"},
    {"day": 4, "title": "Pahalgam Local Exploration", "description": "Visit Aru Valley and Chandanwari, horse riding along Lidder River.", "meals": "Breakfast & Dinner", "accommodation": "Resort in Pahalgam"},
    {"day": 5, "title": "Return to Srinagar & Mughal Gardens", "description": "Visit Shalimar Bagh, Nishat Bagh, and local handicraft markets.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Srinagar"},
    {"day": 6, "title": "Departure from Srinagar", "description": "Transfer to Srinagar airport with memorable travel souvenirs.", "meals": "Breakfast", "accommodation": "None"}
  ]'::jsonb,
  '["Deluxe accommodation for 5 nights", "Daily breakfast & dinner", "Private AC vehicle throughout tour", "Toll taxes, parking & driver allowance", "1 Hour Dal Lake Shikara ride"]'::jsonb,
  '["Airfare or train tickets", "Gondola ticket charges", "Personal expenses and pony rides", "5% GST"]'::jsonb
),
(
  'Enchanting Himachal Manali & Shimla Tour',
  'enchanting-himachal-manali-shimla',
  'Snow-capped mountains, Solang Valley adventure, and Mall Road walks.',
  'Discover the queen of hill stations Shimla and the adventure paradise Manali with Atal Tunnel and Solang Valley.',
  'Himachal Pradesh',
  'Honeymoon',
  'Customized Tour',
  '/images/packages/himachal-package.jpg',
  19999,
  17499,
  6,
  5,
  true,
  'published',
  '["Solang Valley Adventure", "Atal Tunnel Drive", "Shimla Ridge & Mall Road", "Kufri Snow Viewpoint"]'::jsonb,
  '[
    {"day": 1, "title": "Delhi/Chandigarh to Shimla", "description": "Scenic mountain highway drive, evening arrival in Shimla.", "meals": "Dinner", "accommodation": "Hotel in Shimla"},
    {"day": 2, "title": "Kufri Sightseeing & Ridge", "description": "Visit Kufri adventure park and historic Christ Church on the Ridge.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Shimla"},
    {"day": 3, "title": "Shimla to Manali via Kullu Valley", "description": "Drive alongside Beas River with a stop for Kullu river rafting.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Manali"},
    {"day": 4, "title": "Solang Valley & Atal Tunnel", "description": "Excursion to snow adventure hub Solang Valley and engineering marvel Atal Tunnel.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Manali"},
    {"day": 5, "title": "Manali Local Sightseeing", "description": "Visit ancient Hadimba Temple, Vashisht Hot Springs, and Old Manali cafes.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Manali"},
    {"day": 6, "title": "Manali to Delhi/Chandigarh Departure", "description": "Check-out and drop off for onward journey.", "meals": "Breakfast", "accommodation": "None"}
  ]'::jsonb,
  '["3-Star Hotel stay with mountain views", "Breakfast and Dinner included", "Private cab for transfers and sightseeing", "All driver allowances and toll parking"]'::jsonb,
  '["Adventure sport activities (paragliding, rafting)", "Monument entry fees", "GST 5%"]'::jsonb
),
(
  'Royal Rajasthan Heritage & Desert Safari',
  'royal-rajasthan-heritage-desert-safari',
  'Jaipur Pink City, Jodhpur Blue City, and Thar Desert camel safari.',
  'Immerse yourself in regal Indian royalty, majestic fortresses, folk dance performances, and camping under desert stars.',
  'Rajasthan',
  'Cultural',
  'Customized Tour',
  '/images/packages/rajasthan-package.jpg',
  22499,
  18999,
  7,
  6,
  true,
  'published',
  '["Amber Fort Elephant/Jeep Ride", "Jaisalmer Sam Sand Dunes", "Desert Camp Folk Dance", "Udaipur City Palace"]'::jsonb,
  '[
    {"day": 1, "title": "Arrival in Jaipur (Pink City)", "description": "Check-in, visit Birla Temple and local bazaars.", "meals": "Dinner", "accommodation": "Heritage Hotel in Jaipur"},
    {"day": 2, "title": "Jaipur Forts & Palaces", "description": "Visit Amber Fort, Hawa Mahal, City Palace, and Jantar Mantar.", "meals": "Breakfast & Dinner", "accommodation": "Heritage Hotel in Jaipur"},
    {"day": 3, "title": "Jaipur to Jodhpur (Sun City)", "description": "Drive to Jodhpur, visit colossal Mehrangarh Fort and Jaswant Thada.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Jodhpur"},
    {"day": 4, "title": "Jodhpur to Jaisalmer Desert Camp", "description": "Arrive at Thar Desert, sunset camel safari and cultural Rajasthani dance.", "meals": "Breakfast & Dinner", "accommodation": "Swiss Desert Tents"},
    {"day": 5, "title": "Jaisalmer Golden Fort & Havelis", "description": "Explore living fort of Jaisalmer and intricate Patwon Ki Haveli.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Jaisalmer"},
    {"day": 6, "title": "Jaisalmer to Jodhpur Departure", "description": "Transfer back with royal souvenirs.", "meals": "Breakfast", "accommodation": "None"}
  ]'::jsonb,
  '["Accommodation in heritage hotels and luxury desert camp", "Daily breakfast & traditional dinners", "Camel safari & cultural musical night", "Private AC sedan vehicle"]'::jsonb,
  '["Monument entry fees and camera charges", "Personal expenses", "5% GST"]'::jsonb
),
(
  'Kerala God’s Own Country Backwaters & Munnar',
  'kerala-backwaters-and-munnar',
  'Munnar tea hills, Thekkady spice plantations, and Alleppey houseboat.',
  'Rejuvenate with lush green tea gardens, misty hill stations, elephant encounters, and serene backwater cruises.',
  'Kerala',
  'Family',
  'Customized Tour',
  '/images/packages/kerala-package.jpg',
  21499,
  18499,
  6,
  5,
  true,
  'published',
  '["Munnar Tea Plantations", "Alleppey Houseboat Cruise", "Thekkady Spice Garden Walk", "Kochi Chinese Fishing Nets"]'::jsonb,
  '[
    {"day": 1, "title": "Arrival in Cochin to Munnar", "description": "Drive through Cheeyappara waterfalls to misty Munnar tea hills.", "meals": "Dinner", "accommodation": "Resort in Munnar"},
    {"day": 2, "title": "Munnar Sightseeing", "description": "Visit Eravikulam National Park (Nilgiri Tahr), Mattupetty Dam, and Echo Point.", "meals": "Breakfast & Dinner", "accommodation": "Resort in Munnar"},
    {"day": 3, "title": "Munnar to Thekkady", "description": "Scenic drive to Periyar wildlife sanctuary, spice plantation tour.", "meals": "Breakfast & Dinner", "accommodation": "Hotel in Thekkady"},
    {"day": 4, "title": "Thekkady to Alleppey Houseboat", "description": "Board private traditional Kerala houseboat, cruise serene backwaters.", "meals": "Lunch, Dinner & Breakfast", "accommodation": "Private Houseboat"},
    {"day": 5, "title": "Alleppey to Cochin Departure", "description": "Visit Fort Kochi, Jewish Synagogue, and drop off at Cochin airport.", "meals": "Breakfast", "accommodation": "None"}
  ]'::jsonb,
  '["5 Nights accommodation including 1 night private houseboat", "All meals on houseboat (Breakfast, Lunch, Dinner)", "Breakfast and Dinner at hotels", "Private AC vehicle for all transfers"]'::jsonb,
  '["Boat ride charges at Periyar Lake", "Air/train fares", "GST 5%"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Link tours with destinations where matching
UPDATE public.tours t
SET destination_id = d.id
FROM public.destinations d
WHERE t.state = d.state AND t.destination_id IS NULL;

-- ==============================================================================
-- 8. BLOGS TABLE (Travel Articles & Guides)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT DEFAULT 'Travel Guide',
  author_name TEXT DEFAULT 'TourTripHolidays Editorial',
  seo_title TEXT,
  seo_description TEXT,
  focus_keyword TEXT,
  image_alt TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;
CREATE POLICY "Anyone can view published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'PUBLISHED' OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage all blogs" ON public.blogs;
CREATE POLICY "Admin can manage all blogs"
  ON public.blogs FOR ALL
  USING (public.is_admin());

-- Initial 6 Published Travel Blogs
INSERT INTO public.blogs (
  id, title, slug, excerpt, content, featured_image, category, author_name, image_alt, status, published_at
)
VALUES
(
  'b1111111-1111-4111-8111-111111111111',
  'Exploring the Magical Dal Lake and Snow Valleys of Kashmir',
  'exploring-dal-lake-snow-valleys-kashmir',
  'Glide on shikaras across serene Dal Lake, surrounded by floating gardens and snow-capped Himalayan peaks.',
  'Exploring the Magical Dal Lake and Snow Valleys of Kashmir',
  '/images/blogs/kashmir-dal-lake.webp',
  'Himalayan Escapes',
  'TourTripHolidays Editorial',
  'Shikara on Dal Lake Srinagar with snow mountains background Kashmir',
  'PUBLISHED',
  '2026-11-01 10:00:00+00'
),
(
  'b2222222-2222-4222-8222-222222222222',
  'Cruising the Emerald Backwaters and Coconut Lagoons of Kerala',
  'cruising-emerald-backwaters-kerala',
  'Experience tranquil luxury on traditional houseboats drifting along palms-fringed backwaters of Alleppey.',
  'Cruising the Emerald Backwaters and Coconut Lagoons of Kerala',
  '/images/blogs/kerala-backwaters.webp',
  'Beach & Coastal',
  'TourTripHolidays Editorial',
  'Traditional houseboat gliding through Alleppey backwaters Kerala',
  'PUBLISHED',
  '2026-11-03 10:00:00+00'
),
(
  'b3333333-3333-4333-8333-333333333333',
  'Royal Heritage: Magnificent Forts, Palaces & Desert Nights of Rajasthan',
  'royal-heritage-forts-palaces-rajasthan',
  'Step back into imperial history with grand sandstone citadels, intricate jharokhas, and desert culture.',
  'Royal Heritage: Magnificent Forts, Palaces & Desert Nights of Rajasthan',
  '/images/blogs/rajasthan-royal-forts.webp',
  'Heritage & Culture',
  'TourTripHolidays Editorial',
  'Grand Rajasthan fortress illuminated at golden hour sunset',
  'PUBLISHED',
  '2026-11-05 10:00:00+00'
),
(
  'b4444444-4444-4444-8444-444444444444',
  'Unwinding in Himachal: Pine Forests, Mountain Passes & Serene Vistas',
  'unwinding-in-himachal-pine-forests-passes',
  'Breathe crisp mountain air among alpine pines, winding scenic roads, and tranquil Himalayan settlements.',
  'Unwinding in Himachal: Pine Forests, Mountain Passes & Serene Vistas',
  '/images/blogs/himachal-snow-valleys.webp',
  'Himalayan Escapes',
  'TourTripHolidays Editorial',
  'Evergreen pine forests and snow Himalayan peaks Himachal Pradesh',
  'PUBLISHED',
  '2026-11-07 10:00:00+00'
),
(
  'b5555555-5555-4555-8555-555555555555',
  'Coastal Charm: Sun-Kissed Beaches, Historic Chapels & Sunsets in Goa',
  'coastal-charm-beaches-sunsets-goa',
  'Golden Arabian Sea shorelines, warm tropical breezes, Portuguese architecture, and coastal hospitality.',
  'Coastal Charm: Sun-Kissed Beaches, Historic Chapels & Sunsets in Goa',
  '/images/blogs/goa-coastal-sunsets.webp',
  'Beach & Coastal',
  'TourTripHolidays Editorial',
  'Tropical Goa coastline with palm trees and sunset glow',
  'PUBLISHED',
  '2026-11-09 10:00:00+00'
),
(
  'b6666666-6666-4666-8666-666666666666',
  'Spiritual Serenity: Timeless Ghats and Sacred Evening Aarti in Varanasi',
  'spiritual-serenity-timeless-ghats-varanasi',
  'Witness centuries of living spiritual heritage along ancient riverbanks illuminated by twilight diya lamps.',
  'Spiritual Serenity: Timeless Ghats and Sacred Evening Aarti in Varanasi',
  '/images/blogs/varanasi-ganges-ghats.webp',
  'Spiritual Journeys',
  'TourTripHolidays Editorial',
  'Evening Ganga Aarti and floating diya lamps on Varanasi ghats',
  'PUBLISHED',
  '2026-11-11 10:00:00+00'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  featured_image = EXCLUDED.featured_image,
  category = EXCLUDED.category,
  image_alt = EXCLUDED.image_alt,
  status = EXCLUDED.status;

