-- ==============================================================================
-- TourTripHolidays – Blog Management Schema & 6 Initial Seed Blogs
-- File: supabase/migrations/002_blogs_schema.sql
-- ==============================================================================

-- 1. Create blogs table
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

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);

-- 3. Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;
CREATE POLICY "Anyone can view published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'PUBLISHED' OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage all blogs" ON public.blogs;
CREATE POLICY "Admin can manage all blogs"
  ON public.blogs FOR ALL
  USING (public.is_admin());

-- 4. Seed the 6 realistic travel blogs
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

