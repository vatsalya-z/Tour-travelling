"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Search,
  Globe,
  Tag,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import BlogEditor from "./BlogEditor";
import { slugify } from "@/lib/utils";
import { Blog, BlogStatus } from "@/types/blog";

interface BlogFormProps {
  initialData?: Blog;
  isEditing?: boolean;
}

const CATEGORIES = [
  "Travel Guide",
  "Himalayan Escapes",
  "Heritage & Culture",
  "Beach & Coastal",
  "Wildlife & Nature",
  "Spiritual Journeys",
  "Adventure & Trekking",
  "Food & Festivals",
  "Travel Tips & Itineraries",
];

export default function BlogForm({ initialData, isEditing = false }: BlogFormProps) {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugModified, setSlugModified] = useState(Boolean(initialData?.slug));
  const [category, setCategory] = useState(initialData?.category || "Travel Guide");
  const [authorName, setAuthorName] = useState(
    initialData?.author_name || "TourTripHolidays Editorial"
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || "");
  const [imageAlt, setImageAlt] = useState(initialData?.image_alt || "");

  // Content
  const [content, setContent] = useState(initialData?.content || "");

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || "");
  const [focusKeyword, setFocusKeyword] = useState(initialData?.focus_keyword || "");

  // Status & Submit States
  const [status, setStatus] = useState<BlogStatus>(initialData?.status || "DRAFT");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-generate slug from title if user hasn't explicitly edited it
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugModified && !isEditing) {
      setSlug(slugify(newTitle));
    }
    if (!seoTitle) {
      setSeoTitle(newTitle);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 10MB limit.");
      return;
    }

    setUploadingImage(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blogs");
      formData.append("bucket", "blog-images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        setFeaturedImage(json.url);
        if (!imageAlt) {
          setImageAlt(title || file.name);
        }
      } else {
        throw new Error(json.error || "Failed to upload image");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (targetStatus: BlogStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("Blog title is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title.trim()),
        category: category.trim(),
        author_name: authorName.trim(),
        excerpt: excerpt.trim() || null,
        featured_image: featuredImage.trim() || null,
        image_alt: imageAlt.trim() || title.trim(),
        content: content.trim() || title.trim(),
        seo_title: seoTitle.trim() || title.trim(),
        seo_description: seoDescription.trim() || excerpt.trim() || null,
        focus_keyword: focusKeyword.trim() || null,
        status: targetStatus,
      };

      const url = isEditing ? `/api/admin/blogs/${initialData?.id}` : "/api/admin/blogs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to save blog");
      }

      setSuccessMsg(
        targetStatus === "PUBLISHED"
          ? "Article published successfully! Redirecting to Blog Management..."
          : "Draft saved successfully! Redirecting..."
      );

      setTimeout(() => {
        router.push("/admin/blogs");
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAF1] pb-4">
        <div>
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#082B50] font-medium transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Blog Management</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
            {isEditing ? `Edit Article: ${initialData?.title}` : "Create New Blog Article"}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Craft beautiful, SEO-optimized travel guides, destination highlights, and domestic itineraries.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-xs font-bold text-[#172B4D] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#F04B16] hover:bg-[#d94012] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isEditing && initialData?.status === "PUBLISHED" ? "Update & Keep Published" : "Publish Article"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-[#FEECEC] border border-[#F8B4B4] rounded-xl flex items-start gap-2.5 text-xs text-[#DC4444]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#E8F8F0] border border-[#C6F0DC] rounded-xl flex items-start gap-2.5 text-xs text-[#16A36A]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF1] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-[#F04B16]" />
              <span>Article Details</span>
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Article Title <span className="text-[#DC4444]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 10 Best Hidden Places to Visit in Kashmir This Autumn"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-[#F04B16]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                URL Slug <span className="text-slate-400 font-normal">(/blog/[slug])</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  tourtripholidays.com/blog/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugModified(true);
                  }}
                  placeholder="best-hidden-places-kashmir"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden focus:border-[#F04B16]"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Short Excerpt / Summary
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A compelling 1-2 sentence preview of the article to capture readers on the public blog listing..."
                rows={3}
                className="w-full px-3.5 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-[#F04B16]"
              />
            </div>
          </div>

          {/* Card 2: Rich Article Content */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF1] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F04B16]" />
                <span>Article Body</span>
              </h2>
              <span className="text-[11px] text-slate-400">Optional — add headings, content or leave as photo guide</span>
            </div>

            <BlogEditor
              value={content}
              onChange={setContent}
              placeholder="Start drafting your article... Use the toolbar above for formatting headings, bullet lists, blockquotes, and images."
            />
          </div>

          {/* Card 3: SEO Configuration */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF1] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#082B50] flex items-center gap-2 border-b border-slate-100 pb-2">
              <Globe className="w-4 h-4 text-[#16A36A]" />
              <span>Search Engine Optimization (SEO)</span>
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#172B4D]">SEO Meta Title</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {seoTitle.length}/60 characters recommended
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Title as it appears on Google search results..."
                className="w-full px-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#172B4D]">SEO Meta Description</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {seoDescription.length}/160 characters recommended
                </span>
              </div>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description summary shown in search engine snippets..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. Kashmir tour packages"
                  className="w-full px-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Featured Image Alt Text
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Dal Lake shikara ride at sunrise in Kashmir"
                  className="w-full px-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Meta & Publishing Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Publishing Status */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#082B50] uppercase tracking-wider border-b border-slate-100 pb-2">
              Publishing Options
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1.5">Article Status</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#F5F8FC] p-1 rounded-xl border border-[#E5EAF1] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    status === "DRAFT" ? "bg-white text-[#E99A24] shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("PUBLISHED")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    status === "PUBLISHED" ? "bg-[#16A36A] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("UNPUBLISHED")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    status === "UNPUBLISHED" ? "bg-slate-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Hidden
                </button>
              </div>
            </div>

            {isEditing && initialData?.published_at && (
              <p className="text-[11px] text-slate-500">
                Originally published on:{" "}
                <span className="font-semibold text-slate-700">
                  {new Date(initialData.published_at).toLocaleDateString()}
                </span>
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F04B16] hover:bg-[#d94012] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{status === "PUBLISHED" ? "Save & Update Live Article" : "Publish to Public Website"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F5F8FC] hover:bg-[#EEF4FB] text-[#172B4D] text-xs font-semibold border border-[#E5EAF1] transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Save as Draft</span>
              </button>
            </div>
          </div>

          {/* Card: Featured Image */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#082B50] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#F04B16]" />
              <span>Featured Cover Image</span>
            </h3>

            {featuredImage ? (
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                <Image
                  src={featuredImage}
                  alt={imageAlt || "Cover Preview"}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFeaturedImage("")}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#DCEAF3] rounded-xl p-6 text-center bg-[#FAFCFF]">
                <ImageIcon className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#082B50]">Upload Cover Photo</p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG or WEBP (Max 10MB)</p>

                <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082B50] hover:bg-[#123F68] text-white text-xs font-semibold cursor-pointer transition-colors">
                  {uploadingImage ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingImage ? "Uploading..." : "Browse File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Custom URL Option */}
            <div>
              <label className="block text-[11px] text-[#64748B] mb-1">
                Or paste direct Image URL:
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Card: Taxonomy & Author */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#082B50] uppercase tracking-wider border-b border-slate-100 pb-2">
              Categorization
            </h3>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Blog Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Author Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="TourTripHolidays Editorial"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

