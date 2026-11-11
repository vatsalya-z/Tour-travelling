"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Save,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  HeartHandshake,
  Target,
  ShieldCheck,
  Map,
  HelpCircle,
  Megaphone,
  Plus,
  Trash2,
  Upload,
  Eye,
} from "lucide-react";
import { AboutPageContent } from "@/types/about";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/about-default-data";

const TABS = [
  { id: "hero", name: "Hero Section", icon: Sparkles },
  { id: "who_we_are", name: "Who We Are", icon: HeartHandshake },
  { id: "mission_vision", name: "Mission & Vision", icon: Target },
  { id: "why_choose_us", name: "Why Choose Us", icon: ShieldCheck },
  { id: "explore_india", name: "Explore India", icon: Map },
  { id: "travel_approach", name: "Travel Approach", icon: Layers },
  { id: "faqs", name: "FAQs", icon: HelpCircle },
  { id: "cta", name: "Call To Action", icon: Megaphone },
];

export default function AdminAboutPage() {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/about");
        const json = await res.json();
        if (json.success && json.data) {
          setContent(json.data);
        }
      } catch (err) {
        console.warn("Failed to load about data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg("About page sections updated successfully!");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        throw new Error(json.error || "Failed to save changes");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (fields: Partial<AboutPageContent["hero"]>) => {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, ...fields } }));
  };

  const updateWhoWeAre = (fields: Partial<AboutPageContent["who_we_are"]>) => {
    setContent((prev) => ({ ...prev, who_we_are: { ...prev.who_we_are, ...fields } }));
  };

  const updateMissionVision = (fields: Partial<AboutPageContent["mission_vision"]>) => {
    setContent((prev) => ({ ...prev, mission_vision: { ...prev.mission_vision, ...fields } }));
  };

  const updateWhyChooseUs = (fields: Partial<AboutPageContent["why_choose_us"]>) => {
    setContent((prev) => ({ ...prev, why_choose_us: { ...prev.why_choose_us, ...fields } }));
  };

  const updateExploreIndia = (fields: Partial<AboutPageContent["explore_india"]>) => {
    setContent((prev) => ({ ...prev, explore_india: { ...prev.explore_india, ...fields } }));
  };

  const updateTravelApproach = (fields: Partial<AboutPageContent["travel_approach"]>) => {
    setContent((prev) => ({ ...prev, travel_approach: { ...prev.travel_approach, ...fields } }));
  };

  const updateFaqs = (fields: Partial<AboutPageContent["faqs"]>) => {
    setContent((prev) => ({ ...prev, faqs: { ...prev.faqs, ...fields } }));
  };

  const updateCta = (fields: Partial<AboutPageContent["cta"]>) => {
    setContent((prev) => ({ ...prev, cta: { ...prev.cta, ...fields } }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F15A24] mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Content Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
            About Page CMS
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Customize headings, descriptions, cards, and images across all 8 About page sections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#082B50] bg-[#F5F8FC] hover:bg-[#EAF6FC] border border-[#E5EAF1] rounded-xl transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#F15A24]" />
            <span>View Live Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#F15A24] hover:bg-[#d94815] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Layout: Tabs on left/top, Editor on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-[#E5EAF1] p-3 shadow-xs space-y-1 sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
              About Sections
            </div>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    active
                      ? "bg-[#082B50] text-white shadow-xs"
                      : "text-[#172B4D] hover:bg-[#F5F8FC] hover:text-[#082B50]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#F15A24]" : "text-slate-400"}`} />
                  <span className="flex-1">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-[#E5EAF1] text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin text-[#082B50] mx-auto mb-2" />
              Loading section content...
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. HERO SECTION */}
              {activeTab === "hero" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#F15A24]" />
                        <span>Hero Section Settings</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">Top centered heading, description & background visuals</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Small Pill Label</label>
                      <input
                        type="text"
                        value={content.hero.small_label}
                        onChange={(e) => updateHero({ small_label: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Main Heading</label>
                      <input
                        type="text"
                        value={content.hero.heading}
                        onChange={(e) => updateHero({ heading: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Heading Orange Highlight Word</label>
                      <input
                        type="text"
                        value={content.hero.heading_highlight}
                        onChange={(e) => updateHero({ heading_highlight: e.target.value })}
                        placeholder="e.g. One Unforgettable Journey"
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Hero Description</label>
                      <textarea
                        rows={3}
                        value={content.hero.description}
                        onChange={(e) => updateHero({ description: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={content.hero.cta_text}
                          onChange={(e) => updateHero({ cta_text: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">CTA Button Link</label>
                        <input
                          type="text"
                          value={content.hero.cta_link}
                          onChange={(e) => updateHero({ cta_link: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Desktop Image Path</label>
                        <input
                          type="text"
                          value={content.hero.desktop_image}
                          onChange={(e) => updateHero({ desktop_image: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden font-mono"
                        />
                        {content.hero.desktop_image && (
                          <div className="relative aspect-video mt-2 rounded-lg overflow-hidden border border-slate-200">
                            <Image src={content.hero.desktop_image} alt="Desktop Hero" fill className="object-cover" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Mobile Image Path</label>
                        <input
                          type="text"
                          value={content.hero.mobile_image}
                          onChange={(e) => updateHero({ mobile_image: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden font-mono"
                        />
                        {content.hero.mobile_image && (
                          <div className="relative aspect-video mt-2 rounded-lg overflow-hidden border border-slate-200">
                            <Image src={content.hero.mobile_image} alt="Mobile Hero" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. WHO WE ARE */}
              {activeTab === "who_we_are" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#F15A24]" />
                      <span>Who We Are Section</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Two-column story with company introduction and image</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Label</label>
                        <input
                          type="text"
                          value={content.who_we_are.label}
                          onChange={(e) => updateWhoWeAre({ label: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Highlight Word</label>
                        <input
                          type="text"
                          value={content.who_we_are.heading_highlight}
                          onChange={(e) => updateWhoWeAre({ heading_highlight: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Main Heading</label>
                      <input
                        type="text"
                        value={content.who_we_are.heading}
                        onChange={(e) => updateWhoWeAre({ heading: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Paragraph 1</label>
                      <textarea
                        rows={3}
                        value={content.who_we_are.paragraph_1}
                        onChange={(e) => updateWhoWeAre({ paragraph_1: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Paragraph 2</label>
                      <textarea
                        rows={3}
                        value={content.who_we_are.paragraph_2}
                        onChange={(e) => updateWhoWeAre({ paragraph_2: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Image Path</label>
                      <input
                        type="text"
                        value={content.who_we_are.image}
                        onChange={(e) => updateWhoWeAre({ image: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg font-mono"
                      />
                      {content.who_we_are.image && (
                        <div className="relative aspect-video max-w-sm mt-2 rounded-lg overflow-hidden border border-slate-200">
                          <Image src={content.who_we_are.image} alt="Who We Are" fill className="object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-bold text-[#172B4D] mb-2">Key Highlights (3 items)</label>
                      <div className="space-y-3">
                        {content.who_we_are.highlights.map((h, i) => (
                          <div key={i} className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-2">
                            <input
                              type="text"
                              value={h.title}
                              onChange={(e) => {
                                const newH = [...content.who_we_are.highlights];
                                newH[i] = { ...newH[i], title: e.target.value };
                                updateWhoWeAre({ highlights: newH });
                              }}
                              placeholder="Title"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg font-bold"
                            />
                            <input
                              type="text"
                              value={h.desc}
                              onChange={(e) => {
                                const newH = [...content.who_we_are.highlights];
                                newH[i] = { ...newH[i], desc: e.target.value };
                                updateWhoWeAre({ highlights: newH });
                              }}
                              placeholder="Description"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg text-slate-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MISSION & VISION */}
              {activeTab === "mission_vision" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#F15A24]" />
                      <span>Mission & Vision</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Two clean purpose cards</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Label</label>
                        <input
                          type="text"
                          value={content.mission_vision.label}
                          onChange={(e) => updateMissionVision({ label: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={content.mission_vision.heading}
                          onChange={(e) => updateMissionVision({ heading: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-3">
                      <span className="text-[11px] font-bold text-[#F15A24] uppercase tracking-wider">Mission Card</span>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Mission Title</label>
                        <input
                          type="text"
                          value={content.mission_vision.mission_title}
                          onChange={(e) => updateMissionVision({ mission_title: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Mission Description</label>
                        <textarea
                          rows={3}
                          value={content.mission_vision.mission_desc}
                          onChange={(e) => updateMissionVision({ mission_desc: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-3">
                      <span className="text-[11px] font-bold text-[#082B50] uppercase tracking-wider">Vision Card</span>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Vision Title</label>
                        <input
                          type="text"
                          value={content.mission_vision.vision_title}
                          onChange={(e) => updateMissionVision({ vision_title: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Vision Description</label>
                        <textarea
                          rows={3}
                          value={content.mission_vision.vision_desc}
                          onChange={(e) => updateMissionVision({ vision_desc: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. WHY CHOOSE US */}
              {activeTab === "why_choose_us" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#F15A24]" />
                      <span>Why Choose Us (4 Cards)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Edit the 4 primary value proposition feature cards</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Label</label>
                        <input
                          type="text"
                          value={content.why_choose_us.label}
                          onChange={(e) => updateWhyChooseUs({ label: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={content.why_choose_us.heading}
                          onChange={(e) => updateWhyChooseUs({ heading: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {content.why_choose_us.features.map((feat, i) => (
                        <div key={i} className="p-4 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-2">
                          <span className="text-[10px] font-bold text-[#F15A24] uppercase">Card {i + 1}</span>
                          <input
                            type="text"
                            value={feat.title}
                            onChange={(e) => {
                              const newF = [...content.why_choose_us.features];
                              newF[i] = { ...newF[i], title: e.target.value };
                              updateWhyChooseUs({ features: newF });
                            }}
                            placeholder="Title"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg font-bold"
                          />
                          <input
                            type="text"
                            value={feat.tag}
                            onChange={(e) => {
                              const newF = [...content.why_choose_us.features];
                              newF[i] = { ...newF[i], tag: e.target.value };
                              updateWhyChooseUs({ features: newF });
                            }}
                            placeholder="Tag (e.g. Tailored For You)"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                          />
                          <textarea
                            rows={3}
                            value={feat.description}
                            onChange={(e) => {
                              const newF = [...content.why_choose_us.features];
                              newF[i] = { ...newF[i], description: e.target.value };
                              updateWhyChooseUs({ features: newF });
                            }}
                            placeholder="Description"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. EXPLORE INDIA */}
              {activeTab === "explore_india" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                      <Map className="w-4 h-4 text-[#F15A24]" />
                      <span>Explore India (6 Experience Cards)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Control images, titles and summaries of diverse Indian travel types</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Label</label>
                        <input
                          type="text"
                          value={content.explore_india.label}
                          onChange={(e) => updateExploreIndia({ label: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={content.explore_india.heading}
                          onChange={(e) => updateExploreIndia({ heading: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Description</label>
                      <input
                        type="text"
                        value={content.explore_india.description}
                        onChange={(e) => updateExploreIndia({ description: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {content.explore_india.items.map((item, i) => (
                        <div key={i} className="p-4 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-2">
                          <span className="text-[10px] font-bold text-[#F15A24] uppercase">Experience {i + 1}</span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...content.explore_india.items];
                              newItems[i] = { ...newItems[i], title: e.target.value };
                              updateExploreIndia({ items: newItems });
                            }}
                            placeholder="Title"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg font-bold"
                          />
                          <input
                            type="text"
                            value={item.image}
                            onChange={(e) => {
                              const newItems = [...content.explore_india.items];
                              newItems[i] = { ...newItems[i], image: e.target.value };
                              updateExploreIndia({ items: newItems });
                            }}
                            placeholder="Image Path (e.g. /images/about/...)"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg font-mono text-[11px]"
                          />
                          {item.image && (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                              <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>
                          )}
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...content.explore_india.items];
                              newItems[i] = { ...newItems[i], description: e.target.value };
                              updateExploreIndia({ items: newItems });
                            }}
                            placeholder="Description"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. TRAVEL APPROACH */}
              {activeTab === "travel_approach" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#F15A24]" />
                      <span>Travel Approach (3 Process Steps)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Vertical & zig-zag step by step flow</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Label</label>
                        <input
                          type="text"
                          value={content.travel_approach.label}
                          onChange={(e) => updateTravelApproach({ label: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={content.travel_approach.heading}
                          onChange={(e) => updateTravelApproach({ heading: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {content.travel_approach.steps.map((st, i) => (
                        <div key={i} className="p-4 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#F15A24]">Step {st.step_number}</span>
                          </div>
                          <input
                            type="text"
                            value={st.title}
                            onChange={(e) => {
                              const newS = [...content.travel_approach.steps];
                              newS[i] = { ...newS[i], title: e.target.value };
                              updateTravelApproach({ steps: newS });
                            }}
                            placeholder="Step Title"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg font-bold"
                          />
                          <textarea
                            rows={2}
                            value={st.description}
                            onChange={(e) => {
                              const newS = [...content.travel_approach.steps];
                              newS[i] = { ...newS[i], description: e.target.value };
                              updateTravelApproach({ steps: newS });
                            }}
                            placeholder="Step Description"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. FAQS */}
              {activeTab === "faqs" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#F15A24]" />
                        <span>Frequently Asked Questions</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">Manage customer FAQs displayed on the About page</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = [
                          ...content.faqs.items,
                          { question: "New Question?", answer: "Answer here..." },
                        ];
                        updateFaqs({ items: newItems });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#082B50] hover:bg-[#123F68] rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Label</label>
                        <input
                          type="text"
                          value={content.faqs.label}
                          onChange={(e) => updateFaqs({ label: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={content.faqs.heading}
                          onChange={(e) => updateFaqs({ heading: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {content.faqs.items.map((faq, i) => (
                        <div key={i} className="p-4 bg-[#F5F8FC] rounded-xl border border-[#E5EAF1] space-y-2 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#082B50]">FAQ #{i + 1}</span>
                            {content.faqs.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = content.faqs.items.filter((_, idx) => idx !== i);
                                  updateFaqs({ items: newItems });
                                }}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                title="Delete FAQ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const newItems = [...content.faqs.items];
                              newItems[i] = { ...newItems[i], question: e.target.value };
                              updateFaqs({ items: newItems });
                            }}
                            placeholder="Question"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg font-bold"
                          />
                          <textarea
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => {
                              const newItems = [...content.faqs.items];
                              newItems[i] = { ...newItems[i], answer: e.target.value };
                              updateFaqs({ items: newItems });
                            }}
                            placeholder="Answer"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5EAF1] rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. CALL TO ACTION */}
              {activeTab === "cta" && (
                <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#F15A24]" />
                      <span>Bottom Call to Action Banner</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Bottom conversion section</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Banner Heading</label>
                      <input
                        type="text"
                        value={content.cta.heading}
                        onChange={(e) => updateCta({ heading: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={content.cta.description}
                        onChange={(e) => updateCta({ description: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Button Text</label>
                        <input
                          type="text"
                          value={content.cta.button_text}
                          onChange={(e) => updateCta({ button_text: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#172B4D] mb-1">Button Link</label>
                        <input
                          type="text"
                          value={content.cta.button_link}
                          onChange={(e) => updateCta({ button_link: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

