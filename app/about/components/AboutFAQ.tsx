"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function AboutFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const faqs = [
    {
      question: "What services does TourTripHolidays provide?",
      answer:
        "TourTripHolidays specializes in curated domestic tour packages across all 28 states of India. We handle verified hotel accommodations, comfortable private cab transfers, detailed sightseeing itineraries, and round-the-clock holiday support.",
    },
    {
      question: "Can I customize my tour package according to my preferences?",
      answer:
        "Yes, absolutely! Every package can be tailored to match your specific schedule, budget, preferred hotel category (standard, deluxe, or luxury), travel pace, and favorite sightseeing spots.",
    },
    {
      question: "Are there any hidden costs in the package pricing?",
      answer:
        "No. We maintain 100% pricing transparency. Your package quote clearly lists all inclusions—such as stays, meals, transport, and applicable taxes. There are no surprise fees or hidden charges during your holiday.",
    },
    {
      question: "Do you offer travel packages across all 28 states of India?",
      answer:
        "Yes! From snow-capped Himalayan valleys in Kashmir and Himachal to the backwaters of Kerala, the royal palaces of Rajasthan, the sunny beaches of Goa, and the scenic North East, we cover destinations across all 28 Indian states.",
    },
    {
      question: "What kind of assistance do you provide during the trip?",
      answer:
        "We provide dedicated on-trip customer assistance. Our team is available 24/7 via phone and WhatsApp to ensure smooth hotel check-ins, reliable driver coordination, and immediate resolution of any questions while you travel.",
    },
    {
      question: "How do I plan or book a vacation with TourTripHolidays?",
      answer:
        "You can explore our tour packages directly on our website, click 'Explore Our Tour Packages' to choose an itinerary, or contact our travel experts directly via WhatsApp or call to receive a personalized travel plan within hours.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white border-t border-[#DCEAF3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6FC] text-[#082B50] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DCEAF3]">
            <HelpCircle className="w-3.5 h-3.5 text-[#F15A24]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B50] tracking-tight">
            Got Questions? <span className="text-[#F15A24]">We Have Answers</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            Everything you need to know about planning and booking your domestic holidays with us.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-[#F5F8FC] border-[#F15A24]/40 shadow-xs"
                    : "bg-white border-[#DCEAF3] hover:border-slate-300 shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-extrabold text-[#082B50] pr-2">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#F15A24] text-white rotate-180"
                        : "bg-[#EAF6FC] text-[#082B50]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#DCEAF3]/60">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

