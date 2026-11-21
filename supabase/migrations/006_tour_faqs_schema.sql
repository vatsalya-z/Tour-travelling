-- ==============================================================================
-- Migration: 006_tour_faqs_schema.sql
-- TourTripHolidays – Tour Package FAQs Schema and Seed Data
-- ==============================================================================

-- 1. Add faqs JSONB column to public.tours table
ALTER TABLE public.tours 
ADD COLUMN IF NOT EXISTS faqs JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Create GIN index for fast JSONB querying and indexing
CREATE INDEX IF NOT EXISTS idx_tours_faqs ON public.tours USING gin (faqs);

-- 3. Comment on column
COMMENT ON COLUMN public.tours.faqs IS 'Array of package-specific FAQ objects: [{"question": text, "answer": text, "order": integer}]';

-- ==============================================================================
-- 4. Seed / Update Package-Specific FAQs for Existing Tours
-- ==============================================================================

-- Package 1: 4-night-5-days-kashmir-paradise-tour
UPDATE public.tours
SET faqs = '[
  {
    "order": 1,
    "question": "What is the best time to visit Kashmir for snow and winter sports?",
    "answer": "December to February is the peak winter snow season in Kashmir. During these months, Gulmarg, Sonamarg, and Pahalgam are covered under thick snowfall, and the Gulmarg Gondola operates offering skiing, snowboarding, and snowmobile rides."
  },
  {
    "order": 2,
    "question": "Is the Gulmarg Gondola cable car ride included in this package?",
    "answer": "Gondola cable car tickets (Phase 1 & Phase 2) must be booked online directly by travelers via the official JK Cable Car portal due to strict individual government photo ID requirements and limited daily quotas. However, our chauffeur provides complete transfer assistance to the base station."
  },
  {
    "order": 3,
    "question": "Are hotel accommodations and the Dal Lake houseboat stay included?",
    "answer": "Yes, this package includes 3 nights in a verified 3-Star Deluxe Hotel in Srinagar (Hotel K28 Inn or equivalent) and 1 night in an authentic Super Deluxe Kashmiri Houseboat on Dal Lake, both on MAP meal plan (Breakfast & Dinner)."
  },
  {
    "order": 4,
    "question": "Is dedicated private transportation provided throughout the tour?",
    "answer": "Yes, a private sanitised sedan (Toyota Etios or Swift Dzire) with an experienced local Kashmiri driver is dedicated to your group for all airport transfers, city excursions, and highway travel between Srinagar, Gulmarg, Sonamarg, and Pahalgam."
  },
  {
    "order": 5,
    "question": "Can this Kashmir package be customized for families or honeymoon couples?",
    "answer": "Yes! Our holiday specialists can tailor the itinerary, upgrade vehicle type (e.g., Innova Crysta or Tempo Traveller), add candle-light dinner on the houseboat, flower bed decoration, or add additional nights in Pahalgam upon request."
  },
  {
    "order": 6,
    "question": "What warm clothing should we carry during winter in Kashmir?",
    "answer": "We recommend thermal innerwear, heavy woolen sweaters, a windproof/waterproof down jacket, woolen gloves, woolen caps, and insulated waterproof snow boots. Snow boots and jackets can also be rented locally in Tangmarg if needed."
  }
]'::jsonb
WHERE slug = '4-night-5-days-kashmir-paradise-tour';

-- Package 2: 5-night-6-days-jammu-to-jammu-kashmir-tour
UPDATE public.tours
SET faqs = '[
  {
    "order": 1,
    "question": "Is this tour suitable for families arriving by train at Jammu Tawi station?",
    "answer": "Yes! This package is specifically designed for guests arriving at Jammu Tawi Railway Station or Jammu Airport. Your private chauffeur will meet you right at Jammu and drive comfortably through Udhampur, Ramban, and the Banihal Qazigund tunnel corridor to Srinagar."
  },
  {
    "order": 2,
    "question": "How long is the drive from Jammu to Srinagar?",
    "answer": "The road journey takes approximately 6 to 7 hours depending on traffic and weather conditions. The highway has been substantially upgraded with new 4-lane tunnels that make the journey smooth, scenic, and comfortable."
  },
  {
    "order": 3,
    "question": "Does this package include an overnight stay in Pahalgam?",
    "answer": "Yes, this package includes 1 night stay amidst pine forests and Lidder River valleys in Pahalgam at Land Ends Resort (or equivalent), allowing you plenty of time to explore Betaab Valley and Aru Valley without rushing."
  },
  {
    "order": 4,
    "question": "What vehicle is provided for this Jammu-to-Jammu tour?",
    "answer": "A dedicated private Toyota Innova Crysta / Ertiga with an experienced hill driver is assigned for your complete round trip from Jammu to Jammu."
  },
  {
    "order": 5,
    "question": "Are Shikara rides included on Dal Lake?",
    "answer": "Yes, a complimentary 1-hour private Shikara ride across Dal Lake covering the floating vegetable market, Nehru Park, and Char Chinar is included."
  }
]'::jsonb
WHERE slug = '5-night-6-days-jammu-to-jammu-kashmir-tour';

-- Package 3: 6-night-7-days-grand-kashmir-winter-discovery
UPDATE public.tours
SET faqs = '[
  {
    "order": 1,
    "question": "What makes this 7-day Grand Kashmir package different from shorter itineraries?",
    "answer": "This comprehensive itinerary offers an immersive Kashmir holiday with 2 nights in Srinagar, 2 nights in Gulmarg for dedicated winter snow skiing, 1 night in Pahalgam, and 1 night on a luxury Dal Lake houseboat, ensuring an unhurried, luxurious travel experience."
  },
  {
    "order": 2,
    "question": "Can beginners try skiing and snow activities in Gulmarg?",
    "answer": "Absolutely! Gulmarg has gentle nursery slopes at Phase 1 where beginners can learn basic skiing with qualified local ski instructors. Equipment rental and instructors are readily available on spot."
  },
  {
    "order": 3,
    "question": "Are meals included during the entire 7 days?",
    "answer": "Yes, daily wholesome breakfast and gourmet dinner (MAP meal plan) are included at all hotels, resorts, and the Dal Lake houseboat."
  },
  {
    "order": 4,
    "question": "What is the cancellation and refund policy?",
    "answer": "Cancellations made 21 days prior to departure receive a 100% refund (minus nominal payment gateway fees). Cancellations between 14-20 days incur a 50% cancellation fee, and under 14 days are non-refundable."
  }
]'::jsonb
WHERE slug = '6-night-7-days-grand-kashmir-winter-discovery';

-- Package 4: enchanting-himachal-manali-shimla
UPDATE public.tours
SET faqs = '[
  {
    "order": 1,
    "question": "Is Atal Tunnel and Solang Valley included in the Manali sightseeing?",
    "answer": "Yes, full-day excursion to Solang Valley and Atal Tunnel up to Sissu (subject to weather and road clearance) is included in the itinerary."
  },
  {
    "order": 2,
    "question": "Are heating facilities available in Himachal hotels during winter?",
    "answer": "Yes, all our partnered deluxe hotels provide room heating (oil heaters or blowers) either complimentary or at nominal direct charges."
  },
  {
    "order": 3,
    "question": "Which places are covered in Shimla?",
    "answer": "The tour covers Kufri snow viewpoint, Mall Road, The Ridge, Christ Church, and Lakkar Bazaar."
  }
]'::jsonb
WHERE slug = 'enchanting-himachal-manali-shimla';

-- Package 5: kerala-backwaters-and-munnar
UPDATE public.tours
SET faqs = '[
  {
    "order": 1,
    "question": "Is the Alleppey houseboat private or shared?",
    "answer": "Your Alleppey backwater houseboat cruise and stay is 100% private and exclusively reserved for your family or group, complete with personal chef, captain, and crew."
  },
  {
    "order": 2,
    "question": "What meals are served on the Alleppey houseboat?",
    "answer": "All meals on board the houseboat (Traditional Kerala lunch with Karimeen fish fry or vegetarian options, evening tea and banana fritters, dinner, and next day breakfast) are freshly prepared and included."
  },
  {
    "order": 3,
    "question": "What sightseeing is included in Munnar?",
    "answer": "You will visit Mattupetty Dam, Echo Point, Kundala Lake, Eravikulam National Park (home to Nilgiri Tahr), and lush tea plantations."
  }
]'::jsonb
WHERE slug = 'kerala-backwaters-and-munnar';

-- Package 6: meghalaya-living-roots-waterfalls
UPDATE public.tours
SET faqs = '[
  {
    "order": 1,
    "question": "How physically demanding is the Double Decker Living Root Bridge trek?",
    "answer": "The trek to the Double Decker Root Bridge in Nongriat involves approximately 3,500 stone steps down and up. It requires moderate fitness. For guests preferring a gentle experience, Single Root Bridges in Mawlynnong and Riwai are accessible with short 10-minute walks."
  },
  {
    "order": 2,
    "question": "What is the best time to see the crystal-clear waters of Umngot River in Dawki?",
    "answer": "November through April is the ideal season when the water of Dawki Umngot River is glassy and crystal clear, making boats look like they are floating on thin air."
  },
  {
    "order": 3,
    "question": "Is Cherrapunji (Sohra) covered in this package?",
    "answer": "Yes, 2 nights are dedicated to Cherrapunji covering Nohkalikai Falls, Mawsmai Caves, Seven Sisters Falls, and Wei Sawdong."
  }
]'::jsonb
WHERE slug = 'meghalaya-living-roots-waterfalls';
