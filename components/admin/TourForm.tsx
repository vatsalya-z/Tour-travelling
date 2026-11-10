"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Trash2,
  X,
  Check,
  Eye,
  Save,
  Send,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowLeft,
  ChevronDown,
  Layers,
  Tag,
  FileText,
  DollarSign,
  ShieldAlert,
  Search,
} from "lucide-react";
import Link from "next/link";
import { createClient, getAdminBearerToken } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { uploadTourImage } from "@/lib/supabase/storage";
import { slugify, formatCurrency } from "@/lib/utils";
import { Tour, TourItineraryDay, TourStatus } from "@/types/tour";
import { Destination } from "@/types/destination";

interface TourFormProps {
  initialData?: Tour | null;
  isEdit?: boolean;
}

export default function TourForm({ initialData, isEdit = false }: TourFormProps) {
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();

  // Destination Options from DB
  const [destinations, setDestinations] = useState<Destination[]>([]);

  // 1. Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugAuto, setSlugAuto] = useState(!initialData?.slug);
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // 2. Tour Images
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.gallery_images || []);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // 3. Destination & Category
  const [destinationId, setDestinationId] = useState(initialData?.destination_id || "");
  const [state, setState] = useState(initialData?.state || "");
  const [category, setCategory] = useState(initialData?.category || "Family");
  const [tourType, setTourType] = useState(initialData?.tour_type || "Customized Tour");

  // 4. Pricing & Duration
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [discountedPrice, setDiscountedPrice] = useState(initialData?.discounted_price?.toString() || "");
  const [days, setDays] = useState(initialData?.days?.toString() || "5");
  const [nights, setNights] = useState(initialData?.nights?.toString() || "4");
  const [maxTravellers, setMaxTravellers] = useState(initialData?.max_travellers?.toString() || "15");
  const [minTravellers, setMinTravellers] = useState(initialData?.min_travellers?.toString() || "1");
  const [availableSeats, setAvailableSeats] = useState(initialData?.available_seats?.toString() || "20");
  const [tourAvailability, setTourAvailability] = useState(initialData?.tour_availability || "All Year Round");

  // 5. Tour Highlights
  const [highlights, setHighlights] = useState<string[]>(
    initialData?.highlights?.length
      ? initialData.highlights
      : [
          "Scenic mountain view rooms",
          "Private cab transfers throughout the tour",
          "Daily breakfast & dinner included",
        ]
  );
  const [newHighlight, setNewHighlight] = useState("");

  // 6. Day-wise Itinerary
  const [itinerary, setItinerary] = useState<TourItineraryDay[]>(
    initialData?.itinerary?.length
      ? initialData.itinerary
      : [
          {
            day: 1,
            title: "Arrival and Welcome",
            description: "Pick up from airport/railway station and transfer to hotel. Evening at leisure.",
            activities: "Airport transfer, check-in, leisure walk",
            meals: "Dinner",
            accommodation: "4-Star Hotel / Resort",
          },
          {
            day: 2,
            title: "Local Sightseeing Tour",
            description: "Full day excursion exploring famous viewpoints, historical landmarks and scenic valleys.",
            activities: "Guided sightseeing, photography",
            meals: "Breakfast & Dinner",
            accommodation: "4-Star Hotel / Resort",
          },
        ]
  );

  // 7. Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>(
    initialData?.inclusions?.length
      ? initialData.inclusions
      : [
          "Accommodation in verified 3/4-star hotels",
          "Daily morning breakfast and hearty dinners",
          "Private sanitised AC vehicle for all transfers",
          "All toll tax, parking fees, driver allowance",
          "Assistance at airport/railway station",
        ]
  );
  const [newInclusion, setNewInclusion] = useState("");

  const [exclusions, setExclusions] = useState<string[]>(
    initialData?.exclusions?.length
      ? initialData.exclusions
      : [
          "Airfare / Train tickets unless explicitly booked",
          "Personal expenses like laundry, telephone calls, drinks",
          "Monument entry tickets and guide fees",
          "Any optional adventure sports or activities",
          "5% GST additional on total package cost",
        ]
  );
  const [newExclusion, setNewExclusion] = useState("");

  // 8. Additional Information
  const [cancellationPolicy, setCancellationPolicy] = useState(
    initialData?.cancellation_policy ||
      "Free cancellation up to 15 days before departure. 50% refund between 7-14 days. Non-refundable within 7 days of trip date."
  );
  const [terms, setTerms] = useState(
    initialData?.terms ||
      "Prices are subject to seasonal availability. Valid government photo ID is required for all travellers at check-in."
  );

  // 9. SEO Settings
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
  const [metaKeywords, setMetaKeywords] = useState(initialData?.meta_keywords || "");

  // 10. Publishing Settings
  const [status, setStatus] = useState<TourStatus>(initialData?.status || "published");
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (slugAuto) {
      setSlug(slugify(val));
    }
  };

  // Fetch destinations list for dropdown
  useEffect(() => {
    async function loadDestinations() {
      if (!isConfigured) return;
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("destinations")
          .select("id, name, state")
          .order("name", { ascending: true });
        if (data) setDestinations(data as Destination[]);
      } catch (err) {
        console.warn("Failed to load destinations:", err);
      }
    }
    loadDestinations();
  }, [isConfigured]);

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setErrorMsg("");
    try {
      const res = await uploadTourImage(file, "covers");
      if (res.url) {
        setCoverImage(res.url);
      } else {
        setErrorMsg(res.error || "Failed to upload cover image");
      }
    } catch {
      setErrorMsg("Failed to upload image. Verify Supabase storage settings.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Gallery Images Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setErrorMsg("");
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadTourImage(files[i], "gallery");
        if (res.url) uploadedUrls.push(res.url);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    } catch {
      setErrorMsg("Error uploading gallery images");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Highlight actions
  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };
  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  // Itinerary actions
  const addItineraryDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      {
        day: nextDay,
        title: `Day ${nextDay} Itinerary`,
        description: "",
        activities: "",
        meals: "Breakfast",
        accommodation: "Hotel / Resort",
      },
    ]);
  };
  const updateItineraryDay = (index: number, field: keyof TourItineraryDay, val: any) => {
    const copy = [...itinerary];
    copy[index] = { ...copy[index], [field]: val };
    setItinerary(copy);
  };
  const removeItineraryDay = (index: number) => {
    const copy = itinerary.filter((_, i) => i !== index);
    const renumbered = copy.map((item, idx) => ({ ...item, day: idx + 1 }));
    setItinerary(renumbered);
  };

  // Inclusions / Exclusions
  const addInclusion = () => {
    if (newInclusion.trim()) {
      setInclusions([...inclusions, newInclusion.trim()]);
      setNewInclusion("");
    }
  };
  const removeInclusion = (idx: number) => {
    setInclusions(inclusions.filter((_, i) => i !== idx));
  };
  const addExclusion = () => {
    if (newExclusion.trim()) {
      setExclusions([...exclusions, newExclusion.trim()]);
      setNewExclusion("");
    }
  };
  const removeExclusion = (idx: number) => {
    setExclusions(exclusions.filter((_, i) => i !== idx));
  };

  // Form submission handler
  const handleSubmit = async (targetStatus?: TourStatus) => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter a Tour Name");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!price || isNaN(Number(price))) {
      setErrorMsg("Please enter a valid numeric regular Price");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const finalStatus = targetStatus || status;
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      short_description: shortDescription.trim(),
      description: description.trim(),
      destination_id: destinationId || null,
      state: state.trim(),
      category,
      tour_type: tourType,
      cover_image: coverImage.trim(),
      gallery_images: galleryImages,
      price: Number(price),
      discounted_price: discountedPrice ? Number(discountedPrice) : null,
      days: Number(days) || 1,
      nights: Number(nights) || 0,
      max_travellers: Number(maxTravellers) || 15,
      min_travellers: Number(minTravellers) || 1,
      available_seats: Number(availableSeats) || 20,
      tour_availability: tourAvailability,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      cancellation_policy: cancellationPolicy,
      terms,
      meta_title: metaTitle || name,
      meta_description: metaDescription || shortDescription,
      meta_keywords: metaKeywords,
      status: finalStatus,
      featured,
      updated_at: new Date().toISOString(),
    };

    if (!isConfigured) {
      setSuccessMsg("Tour updated successfully in local session!");
      setTimeout(() => router.push("/admin/tours"), 1000);
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const adminToken = await getAdminBearerToken();
      const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (adminToken) {
        authHeaders["Authorization"] = `Bearer ${adminToken}`;
      }

      if (isEdit && initialData?.id) {
        const res = await fetch(`/api/tours/${initialData.id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          // Fallback to client update
          const { error } = await supabase
            .from("tours")
            .update(payload)
            .eq("id", initialData.id);
          if (error) throw new Error(json.error || error.message);
        }
        setSuccessMsg("Tour package successfully updated!");
      } else {
        const res = await fetch("/api/tours", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          // Fallback to client insert
          const { error } = await supabase.from("tours").insert([payload]);
          if (error) throw new Error(json.error || error.message);
        }
        setSuccessMsg("New tour package successfully created!");
      }
      setTimeout(() => router.push("/admin/tours"), 1000);
    } catch (err: any) {
      console.error("Save tour error:", err);
      setErrorMsg(err.message || "Failed to save tour package to database");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto pb-24">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tours"
            className="p-2 rounded-lg border border-[#E5EAF1] bg-white text-[#64748B] hover:text-[#082B50] hover:bg-[#F5F8FC] transition-colors"
            title="Back to Tours"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
              {isEdit ? "Edit Tour Package" : "Create Tour Package"}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Fill out the 10 multi-section inventory details below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5EAF1] bg-white text-[#172B4D] hover:bg-[#F5F8FC] transition-all cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F04B16] hover:bg-[#d94012] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {submitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isEdit ? "Update & Publish" : "Publish Tour"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-[#FEECEC] border border-[#F8B4B4] text-[#DC4444] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[#EBF7F0] border border-[#A7E2BE] text-[#16A36A] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">1</span>
            <span>Basic Information</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Title, URL slug, and tour overviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Tour Package Name <span className="text-[#DC4444]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Majestic Kashmir 5N/6D Paradise Holiday"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#172B4D]">
                URL Slug <span className="text-[#DC4444]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setSlugAuto(!slugAuto)}
                className="text-[11px] text-[#082B50] hover:underline"
              >
                {slugAuto ? "Manual Slug" : "Auto Slug"}
              </button>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 h-11 rounded-l-lg border border-r-0 border-[#E5EAF1] bg-[#F5F8FC] text-xs text-[#64748B]">
                /tour-packages/
              </span>
              <input
                type="text"
                value={slug}
                disabled={slugAuto}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="flex-1 h-11 px-3 text-xs bg-[#F5F8FC] disabled:bg-[#F8FAFC] border border-[#E5EAF1] rounded-r-lg text-[#172B4D] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50]"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Short Description / Excerpt
            </label>
            <input
              type="text"
              placeholder="A brief 1-2 line summary for search cards and listings"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Full Package Description
            </label>
            <textarea
              rows={4}
              placeholder="Detailed description of the journey, experiences, atmosphere..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50]"
            />
          </div>
        </div>
      </div>

      {/* 2. Tour Images */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">2</span>
            <span>Tour Images</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">High-quality cover image and gallery previews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Cover Image
            </label>
            <div className="flex items-start gap-3">
              <div className="w-28 h-24 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1] flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                {coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#94A3B8]" />
                )}
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-[#DC4444] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Or enter image URL directly"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EAF1] bg-[#F5F8FC] hover:bg-[#EEF4FB] text-xs font-medium text-[#082B50] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCover ? "Uploading..." : "Upload Cover File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Gallery Images Upload */}
          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Gallery Images ({galleryImages.length})
            </label>
            <div className="space-y-2">
              <label className="w-full h-20 rounded-lg border-2 border-dashed border-[#E5EAF1] hover:border-[#082B50] flex flex-col items-center justify-center text-xs text-[#64748B] hover:bg-[#F5F8FC] transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[#64748B] mb-1" />
                <span>{uploadingGallery ? "Uploading..." : "Click or drag images to add to gallery"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                  className="hidden"
                />
              </label>

              {galleryImages.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg border border-[#E5EAF1] overflow-hidden flex-shrink-0 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Destination & Category */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">3</span>
            <span>Destination & Category</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Location tags and travel theme categorization</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Destination Location
            </label>
            <select
              value={destinationId}
              onChange={(e) => {
                setDestinationId(e.target.value);
                const selected = destinations.find((d) => d.id === e.target.value);
                if (selected?.state) setState(selected.state);
              }}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            >
              <option value="">Select Destination...</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.state ? `(${d.state})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              State / Region
            </label>
            <input
              type="text"
              placeholder="e.g. Jammu & Kashmir"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            >
              <option value="Family">Family Tour</option>
              <option value="Honeymoon">Honeymoon Special</option>
              <option value="Adventure">Adventure & Trekking</option>
              <option value="Spiritual">Spiritual / Pilgrimage</option>
              <option value="Cultural">Heritage & Cultural</option>
              <option value="Hill Station">Hill Station</option>
              <option value="Luxury">Luxury Holiday</option>
              <option value="Wildlife">Wildlife Safari</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Tour Type
            </label>
            <select
              value={tourType}
              onChange={(e) => setTourType(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            >
              <option value="Customized Tour">Customized Tour</option>
              <option value="Group Tour">Group Tour</option>
              <option value="Fixed Departure">Fixed Departure</option>
              <option value="Weekend Getaway">Weekend Getaway</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Pricing & Duration */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">4</span>
            <span>Pricing & Duration</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Package rate, duration, and seat availability</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Regular Price (₹) <span className="text-[#DC4444]">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 24999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Discounted Price (₹)
            </label>
            <input
              type="number"
              placeholder="Optional offer price"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Duration (Days)
            </label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Duration (Nights)
            </label>
            <input
              type="number"
              min={0}
              value={nights}
              onChange={(e) => setNights(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Min Travellers
            </label>
            <input
              type="number"
              min={1}
              value={minTravellers}
              onChange={(e) => setMinTravellers(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Max Travellers
            </label>
            <input
              type="number"
              min={1}
              value={maxTravellers}
              onChange={(e) => setMaxTravellers(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Available Seats
            </label>
            <input
              type="number"
              min={0}
              value={availableSeats}
              onChange={(e) => setAvailableSeats(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Tour Availability
            </label>
            <select
              value={tourAvailability}
              onChange={(e) => setTourAvailability(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
            >
              <option value="All Year Round">All Year Round</option>
              <option value="Summer Season">Summer Season (Apr - Jun)</option>
              <option value="Monsoon Special">Monsoon Special (Jul - Sep)</option>
              <option value="Winter Season">Winter Season (Oct - Mar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Tour Highlights */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">5</span>
            <span>Tour Highlights</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Key features and experiences that make this tour stand out</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Shikara ride on Dal Lake at sunset"
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHighlight();
              }
            }}
            className="flex-1 h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
          />
          <button
            type="button"
            onClick={addHighlight}
            className="px-4 h-11 bg-[#082B50] text-white text-xs font-semibold rounded-lg hover:bg-[#123F68] transition-colors cursor-pointer"
          >
            Add Highlight
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {highlights.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1] text-xs font-medium text-[#172B4D]"
            >
              <Sparkles className="w-3 h-3 text-[#F04B16]" />
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                className="text-[#64748B] hover:text-[#DC4444] cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 6. Day-wise Itinerary */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">6</span>
              <span>Day-wise Itinerary ({itinerary.length} Days)</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">Detailed daily travel schedule</p>
          </div>
          <button
            type="button"
            onClick={addItineraryDay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082B50] text-white text-xs font-semibold hover:bg-[#123F68] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day {itinerary.length + 1}</span>
          </button>
        </div>

        <div className="space-y-3">
          {itinerary.map((dayItem, index) => (
            <div key={index} className="p-4 rounded-xl border border-[#E5EAF1] bg-[#FAFCFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#082B50] px-2.5 py-1 rounded bg-[#EAF6FC]">
                  Day {dayItem.day}
                </span>
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="text-xs text-[#DC4444] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Day</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-[#172B4D] mb-1">
                    Day Title
                  </label>
                  <input
                    type="text"
                    value={dayItem.title}
                    onChange={(e) => updateItineraryDay(index, "title", e.target.value)}
                    placeholder="e.g. Arrival in Srinagar & Shikara Ride"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-[#172B4D] mb-1">
                    Day Activities & Description
                  </label>
                  <textarea
                    rows={2}
                    value={dayItem.description}
                    onChange={(e) => updateItineraryDay(index, "description", e.target.value)}
                    placeholder="Details about what travellers will experience on this day"
                    className="w-full p-2.5 text-xs bg-white border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#172B4D] mb-1">
                    Meals Provided
                  </label>
                  <input
                    type="text"
                    value={dayItem.meals || ""}
                    onChange={(e) => updateItineraryDay(index, "meals", e.target.value)}
                    placeholder="e.g. Breakfast & Dinner"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#172B4D] mb-1">
                    Accommodation
                  </label>
                  <input
                    type="text"
                    value={dayItem.accommodation || ""}
                    onChange={(e) => updateItineraryDay(index, "accommodation", e.target.value)}
                    placeholder="e.g. Deluxe Houseboat / Resort"
                    className="w-full h-10 px-3 text-xs bg-white border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Inclusions & Exclusions */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">7</span>
            <span>Inclusions & Exclusions</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">What is covered and what is not in the package price</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inclusions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#16A36A] flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Package Inclusions</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add inclusion..."
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInclusion();
                  }
                }}
                className="flex-1 h-9 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
              />
              <button
                type="button"
                onClick={addInclusion}
                className="px-3 h-9 bg-[#16A36A] text-white text-xs font-semibold rounded-lg hover:bg-[#128354] transition-colors"
              >
                Add
              </button>
            </div>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {inclusions.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#F5F8FC] text-xs text-[#172B4D]"
                >
                  <span className="truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeInclusion(idx)}
                    className="text-[#64748B] hover:text-[#DC4444]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#DC4444] flex items-center gap-1.5">
              <X className="w-4 h-4" />
              <span>Package Exclusions</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add exclusion..."
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExclusion();
                  }
                }}
                className="flex-1 h-9 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
              />
              <button
                type="button"
                onClick={addExclusion}
                className="px-3 h-9 bg-[#DC4444] text-white text-xs font-semibold rounded-lg hover:bg-[#b93232] transition-colors"
              >
                Add
              </button>
            </div>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {exclusions.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#F5F8FC] text-xs text-[#172B4D]"
                >
                  <span className="truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeExclusion(idx)}
                    className="text-[#64748B] hover:text-[#DC4444]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 8. Additional Information */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">8</span>
            <span>Additional Information</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Cancellation policy and booking terms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Cancellation Policy
            </label>
            <textarea
              rows={3}
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Terms & Conditions
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
            />
          </div>
        </div>
      </div>

      {/* 9. SEO Settings */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">9</span>
            <span>SEO Settings</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Search engine metadata and indexing options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[#172B4D]">Meta Title</label>
              <span className="text-[10px] text-[#64748B]">{metaTitle.length}/60</span>
            </div>
            <input
              type="text"
              placeholder="Meta Title for search engines"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#172B4D] mb-1">
              Meta Keywords (comma-separated)
            </label>
            <input
              type="text"
              placeholder="kashmir tour, srinagar package, gulmarg holiday"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[#172B4D]">Meta Description</label>
              <span className="text-[10px] text-[#64748B]">{metaDescription.length}/160</span>
            </div>
            <textarea
              rows={2}
              placeholder="Brief description that appears in Google search snippets..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
            />
          </div>
        </div>
      </div>

      {/* 10. Publishing Settings */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E5EAF1] pb-3">
          <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#082B50] text-white text-[10px] font-bold flex items-center justify-center">10</span>
            <span>Publishing Settings</span>
          </h2>
          <p className="text-[11px] text-[#64748B] mt-0.5">Control package visibility on public website</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5EAF1] bg-[#F5F8FC]">
            <div>
              <p className="text-xs font-semibold text-[#172B4D]">Tour Status</p>
              <p className="text-[11px] text-[#64748B]">Publish live to public website or save as draft</p>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TourStatus)}
              className="h-9 px-3 text-xs bg-white border border-[#E5EAF1] rounded-lg text-[#172B4D] font-semibold"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5EAF1] bg-[#F5F8FC]">
            <div>
              <p className="text-xs font-semibold text-[#172B4D]">Featured Tour</p>
              <p className="text-[11px] text-[#64748B]">Highlight on Homepage Popular Packages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F04B16]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EAF1] p-3.5 flex items-center justify-between max-w-5xl mx-auto rounded-t-xl shadow-lg">
        <Link
          href="/admin/tours"
          className="px-4 py-2 text-xs font-semibold rounded-lg text-[#64748B] hover:bg-[#F5F8FC]"
        >
          Cancel
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E5EAF1] bg-white text-[#172B4D] hover:bg-[#F5F8FC] transition-all cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#F04B16] hover:bg-[#d94012] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {submitting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isEdit ? "Update Tour" : "Publish Tour"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
