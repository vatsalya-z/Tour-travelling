import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Connecting to Supabase...");

  // 1. Ensure Destination exists
  let { data: dest, error: destErr } = await supabase
    .from("destinations")
    .select("id, slug")
    .eq("slug", "jammu-and-kashmir")
    .maybeSingle();

  if (destErr) {
    console.error("Error checking destination:", destErr);
  }

  let destId = dest?.id;

  if (!destId) {
    console.log("Creating destination 'Jammu & Kashmir'...");
    const { data: newDest, error: createDestErr } = await supabase
      .from("destinations")
      .insert({
        name: "Jammu & Kashmir",
        slug: "jammu-and-kashmir",
        state: "Jammu & Kashmir",
        description: "Paradise on Earth with scenic Dal Lake, Gulmarg snow meadows, Sonamarg glaciers and Pahalgam valleys.",
        cover_image: "/images/packages/kashmir-4n5d-cover.webp",
        status: "published",
      })
      .select("id")
      .single();

    if (createDestErr) {
      console.warn("Could not insert destination:", createDestErr);
    } else {
      destId = newDest.id;
      console.log("Created destination ID:", destId);
    }
  } else {
    console.log("Found existing destination ID:", destId);
  }

  // 2. Prepare 3 Kashmir Packages
  const kashmirPackages = [
    {
      name: "4 Nights / 5 Days Kashmir Paradise Tour (Srinagar, Gulmarg, Sonamarg & Pahalgam)",
      slug: "4-night-5-days-kashmir-paradise-tour",
      short_description: "Experience Dal Lake houseboat stay, Sonamarg snow glaciers, Gulmarg Gondola cable car, and scenic Pahalgam Lidder River.",
      description: "Discover the magical winter beauty of Kashmir on this handcrafted 4 Nights / 5 Days holiday. Stay in a luxury traditional Kashmiri Houseboat on tranquil Dal Lake, glide through floating gardens on a private Shikara ride, ascend to world-famous snow peaks on the Gulmarg Gondola, marvel at the Thajiwas Glacier in Sonamarg, and explore pine-lined river valleys in Pahalgam. Complete with dedicated private transport, MAP meal plan, and verified 3-star deluxe hotel stays.",
      destination_id: destId || null,
      state: "Jammu & Kashmir",
      category: "Himalayan Escapes",
      tour_type: "Private Tour",
      cover_image: "/images/packages/kashmir-4n5d-cover.webp",
      gallery_images: [
        "/images/packages/kashmir-dal-lake-winter.webp",
        "/images/packages/kashmir-gulmarg-gondola-snow.webp",
        "/images/packages/kashmir-sonamarg-glacier-winter.webp",
        "/images/packages/kashmir-pahalgam-valley-winter.webp",
        "/images/packages/kashmir-houseboat-winter.webp",
      ],
      price: 13500,
      discounted_price: 10500,
      days: 5,
      nights: 4,
      min_travellers: 1,
      max_travellers: 12,
      available_seats: 20,
      tour_availability: "Valid for Dec 2026 / On Request",
      pickup_location: "Srinagar Airport (SXR)",
      drop_location: "Srinagar Airport (SXR)",
      highlights: [
        "1-Hour Dal Lake Shikara ride across floating gardens and Char Chinar",
        "Full day excursion to Sonamarg Meadow of Gold & Thajiwas Glacier",
        "Gulmarg Gondola cable car ride over snowy pine forest to Apharwat",
        "Pahalgam Valley of Shepherds exploration along scenic Lidder River",
        "1 Night authentic Deluxe Kashmiri Houseboat stay with traditional hospitality",
        "3 Nights stay at 3-Star Deluxe Hotel K28 Inn in Srinagar",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrival in Srinagar & Dal Lake Houseboat Experience",
          description: "Upon arrival at Srinagar International Airport, meet our representative and transfer to your Super Deluxe Houseboat on peaceful Dal Lake. Enjoy warm traditional Kashmiri Kahwa on arrival. In the late afternoon, embark on an enchanting 1-Hour Shikara ride gliding past floating gardens, lotus swamps, and vibrant water markets against snow-draped Pir Panjal mountains. Enjoy a delicious dinner and a serene overnight stay in the houseboat.",
          meals: "Dinner",
          accommodation: "Super Deluxe Kashmiri Houseboat (Dal Lake)",
          activities: "Airport Pick Up, Houseboat Check-in, 1-Hour Shikara Ride, Floating Market Visit",
          image: "/images/packages/kashmir-dal-lake-winter.webp",
        },
        {
          day: 2,
          title: "Srinagar to Sonamarg Excursion (Meadow of Gold)",
          description: "After breakfast, proceed on a captivating drive to Sonamarg (2,690m), known as the \"Meadow of Gold\", winding along the rushing Sindh River flanked by sycamore and alpine birch trees. Admire dramatic snow-capped peaks and enjoy snow activities or a pony/sledge ride to the foot of Thajiwas Glacier. In the late afternoon, drive back to Srinagar and check in to Hotel K28 Inn. Savor a wholesome dinner.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel K28 Inn (3-Star Deluxe, Srinagar)",
          activities: "Scenic Drive to Sonamarg, Thajiwas Glacier Snow View, Sindh River Valley Sightseeing",
          image: "/images/packages/kashmir-sonamarg-glacier-winter.webp",
        },
        {
          day: 3,
          title: "Srinagar to Gulmarg Day Trip (Meadow of Flowers & Gondola)",
          description: "After breakfast, depart for Gulmarg (2,730m), India's premier ski resort and winter wonderland. Board the world-famous Gulmarg Gondola (Phase 1 to Kongdoori and Phase 2 to Apharwat Peak at 3,980m, weather permitting). Enjoy snow sports, skiing, snowmobiling, and breathtaking views of Nanga Parbat and the Himalayan horizon. Return to Srinagar hotel in the evening for dinner and overnight stay.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel K28 Inn (3-Star Deluxe, Srinagar)",
          activities: "Gulmarg Gondola Cable Car, Snowboarding / Skiing, Apharwat Snow Views, Pine Forest Stroll",
          image: "/images/packages/kashmir-gulmarg-gondola-snow.webp",
        },
        {
          day: 4,
          title: "Srinagar to Pahalgam Excursion (Valley of Shepherds)",
          description: "Following breakfast, drive toward Pahalgam (2,130m) along the famous national highway corridor. Stop en route to visit fragrant saffron fields at Pampore and historical Awantipora temple ruins. Drive along the gushing Lidder River through dense deodar forests into Pahalgam. Explore picturesque Betaab Valley, Aru Valley, and Chandanwari via local union transport. Return to Srinagar hotel in the evening.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel K28 Inn (3-Star Deluxe, Srinagar)",
          activities: "Pampore Saffron Fields, Awantipora Ruins, Lidder River, Betaab & Aru Valleys",
          image: "/images/packages/kashmir-pahalgam-valley-winter.webp",
        },
        {
          day: 5,
          title: "Srinagar Sightseeing & Airport Departure Transfer",
          description: "After breakfast, visit the historic Shankaracharya Hill Temple for panoramic views of Srinagar city, followed by the renowned Mughal Gardens (Nishat Bagh \"Garden of Bliss\" and Shalimar Bagh \"Abode of Love\"). Later, transfer smoothly to Srinagar International Airport for your departure flight, taking home unforgettable memories of Kashmir.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Shankaracharya Temple, Mughal Gardens Sightseeing, Airport Drop Off",
          image: "/images/packages/kashmir-4n5d-cover.webp",
        },
      ],
      inclusions: [
        "3 Nights Deluxe Hotel accommodation in Srinagar (Hotel K28 Inn or equivalent)",
        "1 Night Super Deluxe Houseboat stay on Dal Lake",
        "Daily Breakfast and Dinner (MAP Meal Plan)",
        "Dedicated private Sedan (Dzire / Etios) for all transfers and sightseeing",
        "1-Hour complimentary Shikara Ride on Dal Lake",
        "All toll taxes, parking fees, fuel, and chauffeur allowances",
        "24/7 dedicated on-trip customer support assistance",
      ],
      exclusions: [
        "Airfare or train tickets to and from Srinagar",
        "Gulmarg Gondola tickets (Phase 1 & Phase 2) — to be booked online by guest",
        "Local union taxi / pony rides in Sonamarg, Gulmarg, and Pahalgam (Betaab / Aru / Chandanwari)",
        "Snow-chain vehicle charges between Tangmarg and Gulmarg / Sonamarg during heavy snowfall (approx. Rs. 2,000–2,500 per vehicle per side)",
        "Entry tickets to Mughal Gardens, monuments, or shrines",
        "Personal expenses (laundry, room heaters, telephone, tips)",
        "Travel Insurance and 5% GST",
      ],
      important_notes:
        "All guests must carry valid Government-issued photo identification (Aadhaar / Passport / Voter ID). Outside commercial vehicles are strictly restricted by local transport unions in Gulmarg, Sonamarg, and Pahalgam; internal sightseeing requires local union vehicles or ponies payable directly. Gondola tickets are subject to weather and availability; advance online booking via the official JK Cable Car portal is highly recommended. In winter, snow chains are mandatory during heavy snow between Tangmarg and Gulmarg.",
      terms:
        "Standard check-in time is 12:00 PM / 1:00 PM; check-out is 11:00 AM. Prices are valid for Double Sharing occupancy. Child policy and extra bed options available on request.",
      cancellation_policy:
        "Free cancellation up to 21 days before departure. 50% cancellation fee between 14 to 20 days. Non-refundable within 14 days of travel date.",
      payment_terms: "25% advance to confirm booking, balance 7 days prior to departure.",
      featured: true,
      status: "published",
    },
    {
      name: "5 Nights / 6 Days Kashmir Complete Winter Tour (Jammu to Jammu)",
      slug: "5-night-6-days-jammu-to-jammu-kashmir-tour",
      short_description: "Scenic Jammu to Srinagar highway drive, Gulmarg Gondola, Sonamarg glaciers, Pahalgam stay, and Dal Lake Shikara ride.",
      description: "A complete 5 Nights / 6 Days winter wonderland tour starting and ending at Jammu. Travel comfortably in a dedicated private Toyota Innova Crysta through the Banihal tunnel corridor into the Kashmir Valley. Enjoy 4 nights stay in Srinagar at Hotel Velasta and 1 night stay in the scenic pine valleys of Pahalgam at Land Ends Resort. Covers Dal Lake Shikara ride, Gulmarg snow sports, Sonamarg glaciers, and the enchanting Lidder River.",
      destination_id: destId || null,
      state: "Jammu & Kashmir",
      category: "Himalayan Escapes",
      tour_type: "Private Tour",
      cover_image: "/images/packages/kashmir-5n6d-cover.webp",
      gallery_images: [
        "/images/packages/kashmir-gulmarg-gondola-snow.webp",
        "/images/packages/kashmir-pahalgam-valley-winter.webp",
        "/images/packages/kashmir-sonamarg-glacier-winter.webp",
        "/images/packages/kashmir-dal-lake-winter.webp",
      ],
      price: 21500,
      discounted_price: 17250,
      days: 6,
      nights: 5,
      min_travellers: 1,
      max_travellers: 12,
      available_seats: 20,
      tour_availability: "Valid for Dec 2026 / On Request",
      pickup_location: "Jammu Tawi Railway Station / Jammu Airport (IXJ)",
      drop_location: "Jammu Tawi Railway Station / Jammu Airport (IXJ)",
      highlights: [
        "Seamless pick-up & drop from Jammu via Banihal tunnel highway in Innova Crysta",
        "1 Night stay in scenic Pahalgam at Land Ends Resort surrounded by pine forest",
        "4 Nights stay in Srinagar at 3-Star Deluxe Hotel Velasta",
        "1-Hour complimentary private Shikara ride on Dal Lake (2 Shikaras)",
        "Excursion to Gulmarg snow bowl and Gondola cable car",
        "Excursion to Sonamarg Meadow of Gold and Thajiwas Glacier",
      ],
      itinerary: [
        {
          day: 1,
          title: "Jammu Arrival to Srinagar via Scenic Mountain Highway",
          description: "Pick up from Jammu Tawi Railway Station or Jammu Airport. Begin your journey toward Srinagar across Udhampur, Ramban, and through the modern Banihal-Qazigund double-tube tunnel into the Kashmir Valley. Reach Srinagar by evening, check in to Hotel Velasta, relax with hot Kashmiri Kahwa, and enjoy dinner.",
          meals: "Dinner",
          accommodation: "Hotel Velasta (3-Star Deluxe, Srinagar)",
          activities: "Jammu Pick-up, Banihal Tunnel Highway Drive, Srinagar Hotel Check-in",
          image: "/images/packages/kashmir-5n6d-cover.webp",
        },
        {
          day: 2,
          title: "Srinagar to Sonamarg Excursion & Evening Shikara Ride",
          description: "After breakfast, depart for full-day excursion to Sonamarg (\"Meadow of Gold\") winding alongside the crystal Sindh River. Enjoy snow sledging or pony trek to Thajiwas Glacier. Return to Srinagar in late afternoon for a peaceful 1-Hour Shikara ride on Dal Lake across floating gardens and Nehru Park. Dinner and overnight at Hotel Velasta.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel Velasta (3-Star Deluxe, Srinagar)",
          activities: "Sonamarg Day Trip, Thajiwas Glacier, 1-Hour Sunset Shikara Ride on Dal Lake",
          image: "/images/packages/kashmir-sonamarg-glacier-winter.webp",
        },
        {
          day: 3,
          title: "Srinagar to Gulmarg Winter Wonderland Excursion",
          description: "Drive through pine-lined snow roads to Gulmarg (\"Meadow of Flowers\"). Board the Gulmarg Gondola cable car to Kongdoori and Apharwat Peak. Experience snow skiing, snowmobiling, and stunning views of the Pir Panjal range. Visit the historic St. Mary's Church in the snow before returning to Srinagar for dinner and overnight stay.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel Velasta (3-Star Deluxe, Srinagar)",
          activities: "Gulmarg Gondola Ride, Skiing / Snow Activities, Apharwat Peak, St. Mary's Church",
          image: "/images/packages/kashmir-gulmarg-gondola-snow.webp",
        },
        {
          day: 4,
          title: "Srinagar to Pahalgam Valley Transfer & Overnight Stay",
          description: "Morning drive to Pahalgam (\"Valley of Shepherds\") passing saffron plantations at Pampore and historical Awantipora ruins. Arrive in Pahalgam and explore Betaab Valley, Aru Valley, and Chandanwari via local union taxi. Check in to Land Ends Resort Pahalgam. Enjoy peaceful evening surrounded by snowy pine slopes.",
          meals: "Breakfast & Dinner",
          accommodation: "Land Ends Resort (3-Star Deluxe, Pahalgam)",
          activities: "Pampore Saffron Fields, Awantipora Ruins, Betaab Valley, Aru Valley, Chandanwari",
          image: "/images/packages/kashmir-pahalgam-valley-winter.webp",
        },
        {
          day: 5,
          title: "Pahalgam Morning Leisure & Transfer back to Srinagar",
          description: "Enjoy a tranquil morning stroll along the roaring Lidder River with crisp mountain air. Optional pony ride to Baisaran (\"Mini Switzerland\"). In the afternoon, drive back to Srinagar and visit Shankaracharya Temple and Mughal Gardens (Nishat & Shalimar). Overnight at Hotel Velasta, Srinagar.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel Velasta (3-Star Deluxe, Srinagar)",
          activities: "Lidder River Walk, Baisaran Valley, Shankaracharya Temple, Mughal Gardens",
          image: "/images/packages/kashmir-dal-lake-winter.webp",
        },
        {
          day: 6,
          title: "Srinagar to Jammu Departure Transfer",
          description: "After an early breakfast, depart Srinagar for Jammu via the national highway corridor. Enjoy scenic mountain views along the journey. Drop off at Jammu Tawi Railway Station or Jammu Airport for your onward journey with wonderful winter memories.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Scenic Highway Drive, Jammu Railway Station / Airport Drop-off",
          image: "/images/packages/kashmir-5n6d-cover.webp",
        },
      ],
      inclusions: [
        "4 Nights Deluxe Hotel accommodation in Srinagar (Hotel Velasta or equivalent)",
        "1 Night Deluxe Resort accommodation in Pahalgam (Land Ends Resort or equivalent)",
        "Daily Breakfast and Dinner (MAP Meal Plan)",
        "Dedicated private Toyota Innova Crysta for all 6 days (Jammu to Jammu)",
        "1-Hour complimentary Shikara ride on Dal Lake (2 Shikaras)",
        "All toll taxes, state permits, parking fees, and chauffeur allowances",
        "24/7 dedicated on-tour customer support",
      ],
      exclusions: [
        "Train or flight tickets to and from Jammu",
        "Gulmarg Gondola ride tickets (Phase 1 & Phase 2)",
        "Local union taxi in Pahalgam (Aru, Betaab Valley, Chandanwari) & pony rides",
        "Snow chain vehicle from Tangmarg to Gulmarg if required during heavy snow (approx. Rs. 2,000–2,500 per cab)",
        "Entry tickets to monuments, Mughal gardens, or shrines",
        "Personal meals, beverages, heater charges, laundry, or tips",
        "5% GST",
      ],
      important_notes:
        "Valid photo ID (Aadhaar card / passport / voter ID) is mandatory for hotel check-in and checkpoints. Gondola tickets must be booked online in advance at the official portal. Jammu to Srinagar highway travel time may vary depending on weather and tunnel traffic; early departure on Day 1 and Day 6 is recommended. Union cab rules apply in Pahalgam and Sonamarg for internal sightseeing.",
      terms:
        "Valid for 4 Adults on Double Sharing occupancy. Vehicles are sanitized and well-maintained. Extra adult/child policy applicable as per hotel standards.",
      cancellation_policy:
        "Free cancellation up to 21 days before departure. 50% cancellation fee between 14 to 20 days. Non-refundable within 14 days of travel date.",
      payment_terms: "25% advance to confirm booking, balance 7 days prior to departure.",
      featured: true,
      status: "published",
    },
    {
      name: "6 Nights / 7 Days Grand Kashmir Winter Discovery (Gulmarg, Srinagar, Pahalgam & Doodhpathri)",
      slug: "6-night-7-days-grand-kashmir-winter-discovery",
      short_description: "Overnight in Gulmarg snow bowl, 2 nights in Pahalgam, offbeat Doodhpathri, Sonamarg glacier, and Dal Lake houseboat.",
      description: "The ultimate 6 Nights / 7 Days grand winter discovery of Jammu & Kashmir. Stay right in the snow-blanketed paradise of Gulmarg at Hotel Zahgeer Continental, unwind for 2 full nights in Pahalgam pine valley at Hotel Pahalgam Dayz, discover the untouched snow meadows of Doodhpathri (\"Valley of Milk\"), explore Sonamarg Thajiwas Glacier, and enjoy a traditional Kashmiri Houseboat stay on Dal Lake with an authentic Shikara ride. Ideal for families and groups travelling in comfort.",
      destination_id: destId || null,
      state: "Jammu & Kashmir",
      category: "Himalayan Escapes",
      tour_type: "Private Tour",
      cover_image: "/images/packages/kashmir-6n7d-cover.webp",
      gallery_images: [
        "/images/packages/kashmir-pahalgam-valley-winter.webp",
        "/images/packages/kashmir-gulmarg-gondola-snow.webp",
        "/images/packages/kashmir-doodhpathri-snow.webp",
        "/images/packages/kashmir-houseboat-winter.webp",
        "/images/packages/kashmir-sonamarg-glacier-winter.webp",
      ],
      price: 21000,
      discounted_price: 16500,
      days: 7,
      nights: 6,
      min_travellers: 1,
      max_travellers: 16,
      available_seats: 20,
      tour_availability: "Valid for Dec 2026 / On Request",
      pickup_location: "Srinagar Airport (SXR)",
      drop_location: "Srinagar Airport (SXR)",
      highlights: [
        "Overnight stay in Gulmarg snow bowl at Hotel Zahgeer Continental",
        "2 Nights peaceful stay in Pahalgam pine valley at Hotel Pahalgam Dayz",
        "Excursion to offbeat, untouched snow paradise of Doodhpathri (Valley of Milk)",
        "1 Night authentic Deluxe Kashmiri Houseboat stay on tranquil Dal Lake",
        "1-Hour complimentary Shikara ride across floating gardens and Nehru Park",
        "Full day excursion to Sonamarg Meadow of Gold & Thajiwas Glacier",
        "Spacious private AC Tempo Traveller / Innova Crysta for group comfort",
      ],
      itinerary: [
        {
          day: 1,
          title: "Srinagar Arrival & Direct Transfer to Gulmarg Snow Paradise",
          description: "Arrive at Srinagar International Airport, receive a warm welcome by our representative, and drive straight up to Gulmarg (2,730m). Check in to Hotel Zahgeer Continental. In the evening, take a leisurely stroll through snow-laden pine trails and enjoy the serene winter atmosphere. Dinner and overnight stay in Gulmarg.",
          meals: "Dinner",
          accommodation: "Hotel Zahgeer Continental (3-Star Deluxe, Gulmarg)",
          activities: "Airport Pick-up, Drive to Gulmarg, Hotel Check-in, Evening Snow Walk",
          image: "/images/packages/kashmir-gulmarg-gondola-snow.webp",
        },
        {
          day: 2,
          title: "Gulmarg Gondola Ride & Transfer to Srinagar Houseboat",
          description: "After breakfast, ride the world-renowned Gulmarg Gondola to Phase 1 (Kongdoori) and Phase 2 (Apharwat Peak at 3,980m). Indulge in skiing, snowmobiling, and panoramic views of Himalayan peaks. In the afternoon, drive down to Srinagar and check in to a Super Deluxe Houseboat on Dal Lake. Enjoy an evening 1-Hour Shikara ride through floating markets. Overnight in Srinagar Houseboat.",
          meals: "Breakfast & Dinner",
          accommodation: "Super Deluxe Kashmiri Houseboat (Dal Lake, Srinagar)",
          activities: "Gulmarg Gondola Phase 1 & 2, Skiing, Houseboat Check-in, 1-Hour Sunset Shikara Ride",
          image: "/images/packages/kashmir-houseboat-winter.webp",
        },
        {
          day: 3,
          title: "Srinagar to Sonamarg Excursion (Meadow of Gold)",
          description: "Full day trip to Sonamarg (2,690m) through the stunning Sindh River valley. Marvel at towering snow-capped peaks and visit Thajiwas Glacier by pony or snow sledge. Return to Srinagar in late afternoon and check in to Hotel Velasta. Savor delicious Kashmiri dinner.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel Velasta (3-Star Deluxe, Srinagar)",
          activities: "Sonamarg Day Trip, Sindh Valley Drive, Thajiwas Glacier Snow Trek",
          image: "/images/packages/kashmir-sonamarg-glacier-winter.webp",
        },
        {
          day: 4,
          title: "Srinagar to Offbeat Doodhpathri (Valley of Milk) Excursion",
          description: "Embark on a day excursion to Doodhpathri (\"Valley of Milk\"), a hidden alpine gem nestled among dense deodar forests and the cascading Shaliganga river. Walk on untouched snow meadows, breathe fresh pine air, and enjoy a memorable winter picnic. Return to Hotel Velasta Srinagar for dinner and overnight stay.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel Velasta (3-Star Deluxe, Srinagar)",
          activities: "Doodhpathri Meadows Exploration, Snow Walking, Shaliganga River, Pine Forest",
          image: "/images/packages/kashmir-doodhpathri-snow.webp",
        },
        {
          day: 5,
          title: "Srinagar to Pahalgam Valley Transfer (2 Nights Stay)",
          description: "Drive toward Pahalgam (\"Valley of Shepherds\") passing fragrant saffron fields of Pampore and historic Awantipora temple ruins. Drive along the roaring Lidder River. Check in to Hotel Pahalgam Dayz. Spend the afternoon exploring the scenic riverside and local walnut woodcraft markets. Overnight in Pahalgam.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel Pahalgam Dayz (3-Star Deluxe, Pahalgam)",
          activities: "Pampore Saffron Fields, Awantipora Ruins, Lidder River, Local Kashmiri Market",
          image: "/images/packages/kashmir-pahalgam-valley-winter.webp",
        },
        {
          day: 6,
          title: "Full Day Pahalgam Sightseeing (Betaab, Aru & Chandanwari)",
          description: "After breakfast, board local union vehicles to explore the scenic wonders of Pahalgam: Betaab Valley (named after the Bollywood hit), high-altitude Aru Valley, and Chandanwari. Optional pony trek to Baisaran (\"Mini Switzerland\"). Return to Hotel Pahalgam Dayz in the evening for dinner and bonfire.",
          meals: "Breakfast & Dinner",
          accommodation: "Hotel Pahalgam Dayz (3-Star Deluxe, Pahalgam)",
          activities: "Betaab Valley, Aru Valley, Chandanwari, Baisaran Valley, Evening Bonfire",
          image: "/images/packages/kashmir-6n7d-cover.webp",
        },
        {
          day: 7,
          title: "Pahalgam to Srinagar Sightseeing & Airport Drop",
          description: "After breakfast, drive from Pahalgam back to Srinagar. Visit Shankaracharya Hill Temple and Mughal Gardens (Nishat Bagh and Shalimar Bagh). Transfer to Srinagar International Airport for scheduled departure flight with unforgettable memories of Kashmir.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Shankaracharya Temple, Mughal Gardens, Srinagar Airport Departure Drop",
          image: "/images/packages/kashmir-dal-lake-winter.webp",
        },
      ],
      inclusions: [
        "1 Night Deluxe Hotel accommodation in Gulmarg (Hotel Zahgeer Continental)",
        "1 Night Super Deluxe Houseboat stay on Dal Lake",
        "2 Nights Deluxe Hotel accommodation in Srinagar (Hotel Velasta)",
        "2 Nights Deluxe Hotel accommodation in Pahalgam (Hotel Pahalgam Dayz)",
        "Daily Breakfast and Dinner (MAP Meal Plan)",
        "Dedicated private AC Tempo Traveller / Innova Crysta for all 7 days",
        "1-Hour complimentary Shikara ride on Dal Lake",
        "All toll taxes, state permits, parking fees, and chauffeur allowances",
        "24/7 dedicated on-trip customer support",
      ],
      exclusions: [
        "Airfare or train tickets to and from Srinagar",
        "Gulmarg Gondola tickets (Phase 1 & Phase 2) — to be booked online by guest",
        "Local union cabs in Pahalgam (Aru, Betaab, Chandanwari) & pony rides",
        "Snow chain vehicle between Tangmarg and Gulmarg / Sonamarg during heavy snowfall (approx. Rs. 2,000–2,500 per cab)",
        "Monument, garden, and temple entry tickets",
        "Personal expenses, tips, laundry, room heater charges",
        "5% GST",
      ],
      important_notes:
        "All guests must carry government-approved photo identification. Gondola cable car tickets must be pre-booked online directly by travelers well in advance. Doodhpathri and Sonamarg road accessibility is subject to active winter snowfall conditions and Border Roads Organisation clearance. Local union taxi regulations apply in Pahalgam and Sonamarg.",
      terms:
        "Valid for group travel on Double Sharing occupancy. Vehicle size assigned based on total group size. Extra bed available for children/adults.",
      cancellation_policy:
        "Free cancellation up to 21 days before departure. 50% cancellation fee between 14 to 20 days. Non-refundable within 14 days of travel date.",
      payment_terms: "25% advance to confirm booking, balance 7 days prior to departure.",
      featured: true,
      status: "published",
    },
  ];

  for (const pkg of kashmirPackages) {
    console.log(`Upserting package: ${pkg.name}...`);
    const { data, error } = await supabase
      .from("tours")
      .upsert(pkg, { onConflict: "slug" })
      .select("id, name, slug");

    if (error) {
      console.error(`Failed to upsert ${pkg.slug}:`, error);
    } else {
      console.log(`Successfully upserted: ${pkg.slug}`);
    }
  }

  // 3. Verify total tours in Supabase
  const { data: allTours } = await supabase.from("tours").select("id, name, slug, state");
  console.log("\nTotal tours now in Supabase database:");
  console.table(allTours);
}

seed();
