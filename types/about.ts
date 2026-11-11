export interface AboutHeroSection {
  small_label: string;
  heading: string;
  heading_highlight: string;
  description: string;
  cta_text: string;
  cta_link: string;
  desktop_image: string;
  mobile_image: string;
}

export interface AboutHighlight {
  title: string;
  desc: string;
}

export interface AboutWhoWeAreSection {
  label: string;
  heading: string;
  heading_highlight: string;
  paragraph_1: string;
  paragraph_2: string;
  image: string;
  highlights: AboutHighlight[];
}

export interface AboutMissionVisionSection {
  label: string;
  heading: string;
  mission_title: string;
  mission_desc: string;
  vision_title: string;
  vision_desc: string;
}

export interface AboutFeature {
  title: string;
  description: string;
  tag: string;
}

export interface AboutWhyChooseUsSection {
  label: string;
  heading: string;
  features: AboutFeature[];
}

export interface AboutExperienceItem {
  title: string;
  description: string;
  image: string;
}

export interface AboutExploreIndiaSection {
  label: string;
  heading: string;
  description: string;
  items: AboutExperienceItem[];
}

export interface AboutApproachStep {
  step_number: string;
  title: string;
  description: string;
}

export interface AboutTravelApproachSection {
  label: string;
  heading: string;
  steps: AboutApproachStep[];
}

export interface AboutFAQItem {
  question: string;
  answer: string;
}

export interface AboutFAQSection {
  label: string;
  heading: string;
  items: AboutFAQItem[];
}

export interface AboutCTASection {
  heading: string;
  description: string;
  button_text: string;
  button_link: string;
}

export interface AboutPageContent {
  hero: AboutHeroSection;
  who_we_are: AboutWhoWeAreSection;
  mission_vision: AboutMissionVisionSection;
  why_choose_us: AboutWhyChooseUsSection;
  explore_india: AboutExploreIndiaSection;
  travel_approach: AboutTravelApproachSection;
  faqs: AboutFAQSection;
  cta: AboutCTASection;
  updated_at: string;
}

