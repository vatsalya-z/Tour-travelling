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

  // 1. Look up Admin Profile ID
  let adminId = null;
  const { data: adminProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  if (profileErr) {
    console.warn("Could not query profiles for admin:", profileErr.message);
  } else if (adminProfile) {
    adminId = adminProfile.id;
    console.log(`Found Admin Profile: ${adminProfile.full_name} (${adminProfile.email}) -> ID: ${adminId}`);
  }

  // 2. Ensure Odisha Destination exists
  let { data: dest, error: destErr } = await supabase
    .from("destinations")
    .select("id, slug, name, state")
    .eq("slug", "odisha")
    .maybeSingle();

  if (destErr) {
    console.error("Error checking destination by slug:", destErr.message);
  }

  if (!dest) {
    const { data: destByName } = await supabase
      .from("destinations")
      .select("id, slug, name, state")
      .ilike("name", "odisha")
      .maybeSingle();
    dest = destByName;
  }

  let destId = dest?.id;

  if (!destId) {
    console.log("Creating destination 'Odisha'...");
    const { data: newDest, error: createDestErr } = await supabase
      .from("destinations")
      .insert({
        name: "Odisha",
        slug: "odisha",
        state: "Odisha",
        description: "Discover the Soul of Odisha – Explore Ancient Temples, Artisan Villages, Traditional Handlooms, Tribal Culture and Natural Wonders.",
        cover_image: "/images/destinations/odisha.jpg",
        gallery_images: [
          "/images/packages/odisha-golden-triangle-cover.webp",
          "/images/packages/odisha-mangalajodi-wetland.webp",
          "/images/packages/odisha-pattachitra-art.webp",
        ],
        status: "published",
      })
      .select("id")
      .single();

    if (createDestErr) {
      console.error("Could not insert destination Odisha:", createDestErr);
    } else {
      destId = newDest.id;
      console.log("Created destination Odisha ID:", destId);
    }
  } else {
    console.log("Found existing destination Odisha ID:", destId);
  }

  // 3. Check if 'faqs' column exists in public.tours table
  const { error: faqColErr } = await supabase.from("tours").select("faqs").limit(1);
  const hasFaqsColumn = !faqColErr;
  console.log(`Table public.tours faqs column exists: ${hasFaqsColumn}`);

  // 4. Common values for all 6 tours
  const commonValues = {
    state: "Odisha",
    tour_type: "Customized Tour",
    min_travellers: 1,
    max_travellers: 15,
    available_seats: 20,
    tour_availability: "All Year Round (wildlife and boat operations are seasonal – confirm before booking)",
    pickup_location: "Bhubaneswar",
    drop_location: "Bhubaneswar",
    inclusions: [
      "English-speaking local guide",
      "Private air-conditioned transport",
      "Suitable accommodation",
      "Artisan workshop / specialist visits as per itinerary",
    ],
    exclusions: [
      "International and domestic flights",
      "Personal expenses and shopping",
      "Travel insurance",
      "Anything not mentioned in inclusions",
    ],
    cancellation_policy: "",
    payment_terms: "",
    terms: "",
    important_notes:
      "Non-Hindu visitors generally cannot enter the Jagannath Temple in Puri; an alternative heritage experience is offered. Obtain consent before photographing people and follow village-visit protocols. Wildlife sightings, boat operations, safari permissions and tribal market days are subject to season and local conditions. All itineraries, timings and supplier availability are confirmed before booking.",
    faqs: [
      {
        order: 1,
        question: "Can I enter the Jagannath Temple in Puri?",
        answer: "Non-Hindu visitors generally cannot enter the Jagannath Temple. We offer an alternative heritage experience in Puri.",
      },
      {
        order: 2,
        question: "Is a guide included?",
        answer: "Yes, an English-speaking local guide is arranged.",
      },
      {
        order: 3,
        question: "Can the tour be customised?",
        answer: "Yes. All tours can be customised for your group size, dates and interests.",
      },
    ],
    destination_id: destId || null,
    status: "published",
    price: 0,
    discounted_price: null,
    featured: false,
    cover_image: null,
    gallery_images: [],
    created_by: adminId,
  };

  // 5. 6 Odisha Tour Packages
  const odishaPackages = [
    // Tour 1
    {
      ...commonValues,
      cover_image: "/images/packages/odisha-golden-triangle-cover.webp",
      gallery_images: [
        "/images/packages/odisha-golden-triangle-cover.webp",
        "/images/packages/odisha-konark-wheel.webp",
        "/images/packages/odisha-temples-heritage.webp",
        "/images/packages/odisha-pipili-applique.webp",
        "/images/packages/odisha-pattachitra-art.webp",
      ],
      name: "Odisha Golden Triangle & Heritage Experience",
      slug: "odisha-golden-triangle-tour",
      short_description: "Temples, Pattachitra, appliqué and the Puri–Konark coast in 5 days.",
      description:
        "A first-time-friendly journey through Odisha's heritage: ancient temple architecture, Konark, Pattachitra painting demonstrations, Pipili appliqué handicrafts, Odissi dance, traditional cuisine and Puri beach with local cultural experiences. Route: Bhubaneswar → Dhauli → Pipili → Raghurajpur → Puri → Konark.",
      category: "Cultural",
      days: 5,
      nights: 4,
      highlights: [
        "Ancient temple architecture and Konark heritage",
        "Pattachitra painting demonstrations",
        "Pipili appliqué handicrafts",
        "Odissi dance and traditional cuisine",
        "Puri beach and local cultural experiences",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrive Bhubaneswar – Temple Heritage",
          description: "Arrival in Bhubaneswar and exploration of ancient temple architecture.",
          meals: "",
          accommodation: "Suitable accommodation in Bhubaneswar",
          activities: "Arrival, airport pickup, ancient temple architecture exploration",
        },
        {
          day: 2,
          title: "Dhauli & Pipili",
          description: "Visit Dhauli, then Pipili for colourful appliqué craft.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Bhubaneswar / Puri",
          activities: "Dhauli Shanti Stupa visit, Pipili artisan appliqué craft village",
        },
        {
          day: 3,
          title: "Raghurajpur & Puri",
          description: "Pattachitra painting demonstrations at Raghurajpur, then Puri with local cultural experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Raghurajpur master artisan visits, Pattachitra demonstration, Puri beach & heritage walk",
        },
        {
          day: 4,
          title: "Konark",
          description: "Konark heritage and temple architecture; Odissi dance and traditional cuisine.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri / Bhubaneswar",
          activities: "UNESCO Sun Temple Konark, Odissi classical dance performance, traditional Odia cuisine",
        },
        {
          day: 5,
          title: "Departure",
          description: "Return to Bhubaneswar and departure.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Transfer to Bhubaneswar airport/railway station and onward departure",
        },
      ],
      meta_title: "Odisha Golden Triangle Tour | Puri Konark Heritage Tour – Tour Trip Holidays",
      meta_description:
        "5-day Odisha Golden Triangle & Heritage tour covering Bhubaneswar, Pipili, Raghurajpur, Puri and Konark with culture and craft experiences.",
      meta_keywords: "Odisha Golden Triangle Tour, Odisha Heritage Tour, Odisha Cultural Tour Package, Puri Konark Tour",
      featured: false,
    },

    // Tour 2 (Featured USP)
    {
      ...commonValues,
      cover_image: "/images/packages/odisha-art-craft-cover.webp",
      gallery_images: [
        "/images/packages/odisha-art-craft-cover.webp",
        "/images/packages/odisha-pattachitra-art.webp",
        "/images/packages/odisha-pipili-applique.webp",
        "/images/packages/odisha-dhokra-craft.webp",
        "/images/packages/odisha-temples-heritage.webp",
      ],
      name: "Odisha Art, Craft & Artisan Village Tour",
      slug: "odisha-art-craft-tour",
      short_description: "Meet artisans, join hands-on craft workshops and shop directly from craft communities.",
      description:
        "Designed for art lovers, photographers, designers, collectors and creative travellers. Join a Pattachitra painting workshop and palm-leaf engraving, see Pipili appliqué, Cuttack silver filigree (Tarakasi) and Dokra metal craft, and meet artisans. Route: Bhubaneswar → Pipili → Raghurajpur → Puri → Cuttack → Dhenkanal.",
      category: "Art & Craft",
      days: 6,
      nights: 5,
      highlights: [
        "Pattachitra painting workshop and palm-leaf engraving",
        "Pipili appliqué work",
        "Cuttack silver filigree (Tarakasi)",
        "Dokra metal craft demonstration",
        "Meet artisans and shop directly from craft communities",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrive Bhubaneswar",
          description: "Arrival and orientation.",
          meals: "",
          accommodation: "Suitable accommodation in Bhubaneswar",
          activities: "Airport pickup, hotel check-in, orientation briefing",
        },
        {
          day: 2,
          title: "Pipili",
          description: "Appliqué work and artisan workshops.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Bhubaneswar",
          activities: "Pipili village craft workshops, artisan interactive session",
        },
        {
          day: 3,
          title: "Raghurajpur",
          description: "Pattachitra painting workshop and palm-leaf engraving.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Hands-on Pattachitra painting workshop and palm-leaf Tala Pattachitra engraving",
        },
        {
          day: 4,
          title: "Puri",
          description: "Local cultural experiences in Puri.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Puri coastal heritage, local cultural immersion, craft markets",
        },
        {
          day: 5,
          title: "Cuttack",
          description: "Tarakasi silver filigree and historic city experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Cuttack / Bhubaneswar",
          activities: "Centuries-old Tarakasi silver filigree workshops and historic city tour",
        },
        {
          day: 6,
          title: "Dhenkanal & Departure",
          description: "Dokra metal craft demonstration and artisan community visit, then departure.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Lost-wax Dokra metal craft demonstration, direct artisan purchase, Bhubaneswar airport drop",
        },
      ],
      meta_title: "Odisha Art and Craft Tour | Pattachitra & Artisan Villages – Tour Trip Holidays",
      meta_description:
        "6-day Odisha art, craft & artisan village tour: Pattachitra workshop, appliqué, Tarakasi and Dokra craft with direct artisan meetings.",
      meta_keywords: "Odisha Art and Craft Tour, Pattachitra Tour India, Odisha Handicraft Village Tour, Indian Artisan Experience",
      featured: true, // USP package
    },

    // Tour 3
    {
      ...commonValues,
      cover_image: "/images/packages/odisha-textile-cover.webp",
      gallery_images: [
        "/images/packages/odisha-textile-cover.webp",
        "/images/packages/odisha-sambalpuri-ikat.webp",
        "/images/packages/odisha-sambalpuri-pallu.webp",
        "/images/packages/odisha-pattachitra-art.webp",
      ],
      name: "Odisha Handloom, Textile & Weaving Heritage Tour",
      slug: "odisha-textile-tour",
      short_description: "Ikat, Sambalpuri and silk weaving with master weavers.",
      description:
        "For fashion designers, textile students, researchers and international shoppers. Explore Ikat tie-and-dye weaving, Sambalpuri textile traditions and silk and cotton weaving, meet master weavers, learn textile motifs and shop authentic handwoven textiles. Route: Bhubaneswar → Raghurajpur → Puri → Cuttack → Nuapatna → Maniabandha → Sambalpur → Bargarh.",
      category: "Textile & Handloom",
      days: 8,
      nights: 7,
      highlights: [
        "Ikat tie-and-dye weaving",
        "Sambalpuri textile traditions",
        "Traditional silk and cotton weaving",
        "Meet master weavers and learn textile motifs",
        "Shop for authentic handwoven textiles",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrive Bhubaneswar",
          description: "Arrival and orientation.",
          meals: "",
          accommodation: "Suitable accommodation in Bhubaneswar",
          activities: "Arrival transfer, introduction to Odisha textile heritage",
        },
        {
          day: 2,
          title: "Raghurajpur",
          description: "Traditional village arts.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Heritage crafts, natural pigment making demonstration",
        },
        {
          day: 3,
          title: "Puri",
          description: "Local cultural experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Puri coastal culture, traditional temple textile connections",
        },
        {
          day: 4,
          title: "Cuttack",
          description: "Historic city and craft experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Cuttack",
          activities: "Historic silver filigree and trade center visit",
        },
        {
          day: 5,
          title: "Nuapatna",
          description: "Ikat weaving and handloom traditions.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Dhenkanal / Nuapatna",
          activities: "Nuapatna Khandua silk pit-loom weaving, Sanskrit shloka calligraphy in fabric",
        },
        {
          day: 6,
          title: "Maniabandha",
          description: "Ikat tie-and-dye weaving; meet master weavers.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation en route / Sambalpur",
          activities: "Buddhist weaver community visit, master weaver Ikat dye preparation",
        },
        {
          day: 7,
          title: "Sambalpur",
          description: "Sambalpuri textile traditions.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Sambalpur",
          activities: "Sambalpuri bandha tie-and-dye master workshops, motif documentation",
        },
        {
          day: 8,
          title: "Bargarh & Departure",
          description: "Regional weaving heritage, then departure.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Bargarh weaving cooperative visits, authentic handloom shopping, transfer and departure",
        },
      ],
      meta_title: "Odisha Textile Tour | Sambalpuri Ikat Weaving Tour – Tour Trip Holidays",
      meta_description:
        "8-day Odisha handloom & textile tour: Ikat, Sambalpuri weaving, master weaver meetings and authentic textile shopping.",
      meta_keywords: "Odisha Textile Tour, Sambalpuri Weaving Tour, Indian Handloom Tour, Ikat Weaving Experience",
      featured: false,
    },

    // Tour 4
    {
      ...commonValues,
      cover_image: "/images/packages/odisha-tribal-cover.webp",
      gallery_images: [
        "/images/packages/odisha-tribal-cover.webp",
        "/images/packages/odisha-deomali-hills.webp",
        "/images/packages/odisha-tribal-motifs.webp",
        "/images/packages/odisha-dhokra-craft.webp",
      ],
      name: "Odisha Tribal Culture, Village & Nature Tour",
      slug: "odisha-tribal-tour",
      short_description: "Tribal art, markets and Eastern Ghats landscapes – responsible cultural travel.",
      description:
        "A specialist responsible-tourism journey for anthropologists, photographers, researchers and cultural travellers: tribal art and handicrafts, weekly tribal markets (where operating days permit), Kotpad textile traditions, traditional food, village experiences, Eastern Ghats landscapes and respectful cultural interactions. Route: Bhubaneswar → Rayagada → Chatikona → Koraput → Deomali → Jeypore.",
      category: "Tribal & Nature",
      days: 9,
      nights: 8,
      highlights: [
        "Tribal art and traditional handicrafts",
        "Weekly tribal markets, where operating days permit",
        "Kotpad textile traditions",
        "Traditional food and village experiences",
        "Eastern Ghats landscapes and respectful cultural interactions",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrive Bhubaneswar",
          description: "Arrival and briefing on village-visit etiquette.",
          meals: "",
          accommodation: "Suitable accommodation in Bhubaneswar",
          activities: "Arrival pickup, briefing on respectful tribal protocols and photography consent",
        },
        {
          day: 2,
          title: "Travel to Rayagada",
          description: "Journey toward the Eastern Ghats.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Rayagada",
          activities: "Scenic hill drive through deciduous forests into southern Odisha",
        },
        {
          day: 3,
          title: "Rayagada",
          description: "Tribal culture and local handicrafts.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Rayagada",
          activities: "Exploration of regional crafts and mountain settlements",
        },
        {
          day: 4,
          title: "Chatikona",
          description: "Weekly tribal market (subject to operating day) and village experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Koraput / Rayagada",
          activities: "Chatikona weekly haat (subject to operating day), forest produce trade, Dongria Kondh culture",
        },
        {
          day: 5,
          title: "Koraput",
          description: "Tribal art and Eastern Ghats landscapes.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Koraput",
          activities: "Koraput tribal museum, agricultural valleys, coffee plantations",
        },
        {
          day: 6,
          title: "Koraput",
          description: "Village experiences and traditional food.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Koraput",
          activities: "Rural village community visit, traditional millets and organic tribal cuisine tasting",
        },
        {
          day: 7,
          title: "Deomali",
          description: "Eastern Ghats scenery and cultural interactions.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Jeypore",
          activities: "Excursion to Deomali peak (highest point in Odisha), panoramic valley views",
        },
        {
          day: 8,
          title: "Jeypore",
          description: "Kotpad textile traditions and local markets.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Jeypore",
          activities: "Mirgan community organic vegetable dye Kotpad weaving, local market walk",
        },
        {
          day: 9,
          title: "Departure",
          description: "Return and departure.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Return transfer to Bhubaneswar and onward departure",
        },
      ],
      meta_title: "Odisha Tribal Tour | Koraput Tribal Culture & Village Tour – Tour Trip Holidays",
      meta_description:
        "9-day Odisha tribal culture, village & nature tour through Rayagada, Koraput and Jeypore with Kotpad textiles and tribal markets.",
      meta_keywords: "Odisha Tribal Tour, Koraput Tribal Tour, Odisha Village Tourism, Tribal Culture Tour India",
      featured: false,
    },

    // Tour 5
    {
      ...commonValues,
      cover_image: "/images/packages/odisha-wildlife-cover.webp",
      gallery_images: [
        "/images/packages/odisha-wildlife-cover.webp",
        "/images/packages/odisha-mangalajodi-wetland.webp",
        "/images/packages/odisha-chilika-boats.webp",
        "/images/packages/odisha-bhitarkanika-mangroves.webp",
      ],
      name: "Odisha Wildlife, Wetland & Coastal Nature Tour",
      slug: "odisha-wildlife-tour",
      short_description: "Birds at Mangalajodi, Chilika dolphins and Bhitarkanika mangroves.",
      description:
        "For wildlife enthusiasts, birdwatchers, nature photographers and eco-tourists: birdwatching at Mangalajodi, Chilika Lake boat excursion, dolphin watching at Satapada (subject to sightings), mangrove boat safari at Bhitarkanika, nature photography and coastal village experiences. Route: Bhubaneswar → Mangalajodi → Chilika → Konark → Bhitarkanika.",
      category: "Wildlife & Nature",
      days: 6,
      nights: 5,
      highlights: [
        "Birdwatching at Mangalajodi",
        "Chilika Lake boat excursion",
        "Dolphin watching at Satapada, subject to sightings",
        "Mangrove boat safari at Bhitarkanika",
        "Nature photography and coastal village experiences",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrive Bhubaneswar",
          description: "Arrival and transfer.",
          meals: "",
          accommodation: "Suitable accommodation in Bhubaneswar",
          activities: "Airport welcome and check-in, orientation to wetland ecosystems",
        },
        {
          day: 2,
          title: "Mangalajodi",
          description: "Birdwatching at Mangalajodi wetlands.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Barkul / Mangalajodi",
          activities: "Silent wooden country boat excursion among migratory waterfowl in Mangalajodi wetlands",
        },
        {
          day: 3,
          title: "Chilika",
          description: "Chilika Lake boat excursion and dolphin watching at Satapada (subject to sightings).",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri / Satapada",
          activities: "Asia's largest brackish lagoon boat cruise, Irrawaddy dolphin search at Satapada mouth",
        },
        {
          day: 4,
          title: "Konark",
          description: "Konark visit and coastal village experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Konark / Bhubaneswar",
          activities: "Konark Sun Temple exploration, Chandrabhaga pristine coastal walk",
        },
        {
          day: 5,
          title: "Bhitarkanika",
          description: "Mangrove boat safari (subject to permissions and season).",
          meals: "Breakfast",
          accommodation: "Suitable eco-resort in Bhitarkanika",
          activities: "Tidal river mangrove cruise, saltwater crocodile spotting, kingfisher birding",
        },
        {
          day: 6,
          title: "Departure",
          description: "Return and departure.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Scenic return drive to Bhubaneswar airport/station and onward journey",
        },
      ],
      meta_title: "Odisha Wildlife Tour | Chilika Bird Watching & Bhitarkanika Eco Tour – Tour Trip Holidays",
      meta_description:
        "6-day Odisha wildlife & wetland tour: Mangalajodi birdwatching, Chilika boat trip, Satapada dolphins and Bhitarkanika mangrove safari.",
      meta_keywords: "Odisha Wildlife Tour, Chilika Bird Watching Tour, Bhitarkanika Eco Tour, Odisha Nature Holiday",
      featured: false,
    },

    // Tour 6
    {
      ...commonValues,
      cover_image: "/images/packages/odisha-grand-heritage-cover.webp",
      gallery_images: [
        "/images/packages/odisha-grand-heritage-cover.webp",
        "/images/packages/odisha-konark-wheel.webp",
        "/images/packages/odisha-temples-heritage.webp",
        "/images/packages/odisha-pattachitra-art.webp",
        "/images/packages/odisha-sambalpuri-ikat.webp",
        "/images/packages/odisha-mangalajodi-wetland.webp",
      ],
      name: "Grand Odisha – Complete Culture, Art, Heritage & Nature Tour",
      slug: "complete-odisha-tour",
      short_description: "14-day premium journey across Odisha's temples, crafts, handlooms and wild coast.",
      description:
        "A premium long-stay journey for European travellers, cultural groups, art enthusiasts and private travellers: ancient temples, Pattachitra, appliqué, silver filigree and Dokra craft, Ikat and handloom experiences, artisan workshops, cultural performances, Chilika and Bhitarkanika nature, traditional Odia cuisine and village hospitality. Route: Bhubaneswar → Dhauli → Pipili → Raghurajpur → Puri → Konark → Cuttack → Nuapatna → Dhenkanal → Chilika → Bhitarkanika.",
      category: "Premium Cultural",
      days: 14,
      nights: 13,
      highlights: [
        "Ancient temples and architecture",
        "Pattachitra, appliqué art, silver filigree and Dokra craft",
        "Ikat and traditional handloom experiences",
        "Artisan workshops and cultural performances",
        "Chilika and Bhitarkanika nature experiences",
        "Traditional Odia cuisine and village hospitality",
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrive Bhubaneswar",
          description: "Arrival and orientation.",
          meals: "",
          accommodation: "Suitable luxury/heritage accommodation in Bhubaneswar",
          activities: "Airport pickup, welcome drink, tour overview",
        },
        {
          day: 2,
          title: "Bhubaneswar",
          description: "Ancient temples and architecture.",
          meals: "Breakfast",
          accommodation: "Suitable luxury/heritage accommodation in Bhubaneswar",
          activities: "Mukteshwar, Rajarani, Lingaraj perimeter, and Khandagiri-Udayagiri rock-cut caves",
        },
        {
          day: 3,
          title: "Dhauli",
          description: "Dhauli heritage.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Bhubaneswar",
          activities: "Dhauli Peace Pagoda, Emperor Ashoka rock edicts dating back to 261 BC",
        },
        {
          day: 4,
          title: "Pipili",
          description: "Appliqué art and artisan workshops.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Pipili artisan workshops, colourful canopy and umbrella embroidery demonstrations",
        },
        {
          day: 5,
          title: "Raghurajpur",
          description: "Pattachitra and village arts.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Master artisan homes, palm leaf etching, Gotipua dance heritage",
        },
        {
          day: 6,
          title: "Puri",
          description: "Puri heritage and local cultural experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Puri",
          activities: "Puri heritage corridor, Grand Road walk, traditional sweet-making and coastal sunset",
        },
        {
          day: 7,
          title: "Konark",
          description: "Konark temple architecture and cultural performance.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Konark / Puri",
          activities: "UNESCO 13th-century chariot Sun Temple, Chandrabhaga beach, classical dance session",
        },
        {
          day: 8,
          title: "Cuttack",
          description: "Silver filigree (Tarakasi) and historic city.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Cuttack",
          activities: "Tarakasi silver filigree craftsmen at work, Mahanadi riverfront, Barabati fort ruins",
        },
        {
          day: 9,
          title: "Nuapatna",
          description: "Ikat and handloom experiences.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation in Dhenkanal / Nuapatna",
          activities: "Khandua silk weaving, natural dye extraction, interactive master weaver discussions",
        },
        {
          day: 10,
          title: "Dhenkanal",
          description: "Dokra craft and artisan communities.",
          meals: "Breakfast",
          accommodation: "Suitable palace/heritage homestay in Dhenkanal",
          activities: "Sadeibareni Dokra metal casting village, bell metal craft demonstrations",
        },
        {
          day: 11,
          title: "Chilika",
          description: "Nature experiences at Chilika.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation at Chilika",
          activities: "Scenic transfer to Chilika, wetland sunset cruise, fresh local seafood cuisine",
        },
        {
          day: 12,
          title: "Chilika",
          description: "Boat excursion and village hospitality.",
          meals: "Breakfast",
          accommodation: "Suitable accommodation at Chilika",
          activities: "Mangalajodi birding sanctuary boat excursion, island village hospitality",
        },
        {
          day: 13,
          title: "Bhitarkanika",
          description: "Mangrove nature experience.",
          meals: "Breakfast",
          accommodation: "Suitable eco-resort in Bhitarkanika",
          activities: "Ramsar wetland mangrove safari, giant estuarine crocodiles, spotted deer, kingfishers",
        },
        {
          day: 14,
          title: "Departure",
          description: "Return and departure.",
          meals: "Breakfast",
          accommodation: "None",
          activities: "Transfer back to Bhubaneswar International Airport (BBI) and flight departure",
        },
      ],
      meta_title: "Complete Odisha Tour Package | 14-Day Culture, Art, Heritage & Nature – Tour Trip Holidays",
      meta_description:
        "14-day Grand Odisha tour: temples, Pattachitra, appliqué, Dokra, Ikat handloom, Chilika and Bhitarkanika.",
      meta_keywords:
        "Complete Odisha Tour Package, Odisha Cultural and Heritage Tour, Odisha Art and Craft Holiday, India Cultural Experience Tour",
      featured: false,
    },
  ];

  console.log(`\nUpserting ${odishaPackages.length} Odisha tour packages into public.tours...`);

  for (const pkg of odishaPackages) {
    const payload = { ...pkg };
    if (!hasFaqsColumn) {
      delete payload.faqs;
    }

    console.log(`Upserting: ${payload.name} (${payload.slug})...`);
    const { data, error } = await supabase
      .from("tours")
      .upsert(payload, { onConflict: "slug" })
      .select("id, name, slug, state, status, price, featured");

    if (error) {
      console.error(`Failed to upsert ${payload.slug}:`, error);
    } else {
      console.log(`Successfully upserted: ${payload.slug} (ID: ${data?.[0]?.id}, Status: ${data?.[0]?.status})`);
    }
  }

  // 6. Verify total tours in Supabase
  const { data: allOdisha } = await supabase
    .from("tours")
    .select("id, name, slug, state, status, price, featured")
    .ilike("state", "odisha");

  console.log("\nOdisha tours currently in Supabase:");
  console.table(allOdisha);
}

seed();
