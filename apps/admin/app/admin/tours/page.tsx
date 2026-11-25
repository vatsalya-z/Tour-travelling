"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  RefreshCw,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { createClient, getAdminBearerToken } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tour } from "@/types/tour";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status toggle state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Active action menu row id
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const fetchTours = useCallback(async () => {
    setLoading(true);
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const token = await getAdminBearerToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/tours?status=all&limit=100", { headers });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        // Exclude any mock/invalid UUID items from admin tour management
        const validItems = json.data.filter((t: any) => t.id && UUID_REGEX.test(t.id));
        const mapped = validItems.map((t: any) => ({
          ...t,
          state: t.destination?.state || t.state || "",
          destination: t.destination ? { name: t.destination.name } : undefined,
        }));
        setTours(mapped as Tour[]);
      } else {
        // Fallback to client query if API fails
        const supabase = createClient();
        const { data } = await supabase
          .from("tours")
          .select(`
            id,
            name,
            slug,
            category,
            tour_type,
            price,
            discounted_price,
            days,
            nights,
            cover_image,
            status,
            created_at,
            destination_id,
            state,
            destinations (
              name,
              state
            )
          `)
          .order("created_at", { ascending: false });

        if (data) {
          const validData = data.filter((t: any) => t.id && UUID_REGEX.test(t.id));
          const mapped = validData.map((t: any) => ({
            ...t,
            state: t.destinations?.state || t.state || "",
            destination: t.destinations ? { name: t.destinations.name } : undefined,
          }));
          setTours(mapped as Tour[]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch tours:", err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Handle Quick Status Toggle (Published <-> Draft)
  const handleToggleStatus = async (tour: Tour) => {
    const newStatus = tour.status === "published" ? "draft" : "published";

    if (!UUID_REGEX.test(tour.id)) {
      setTours((prev) =>
        prev.map((t) => (t.id === tour.id ? { ...t, status: newStatus } : t))
      );
      return;
    }

    if (!isConfigured) return;
    setIsUpdatingStatus(tour.id);

    try {
      const token = await getAdminBearerToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/tours/${tour.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setTours((prev) =>
          prev.map((t) => (t.id === tour.id ? { ...t, status: newStatus } : t))
        );
      } else {
        throw new Error(json.error || json.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to toggle tour status:", err);
    } finally {
      setIsUpdatingStatus(null);
      setActiveMenuId(null);
    }
  };

  // Handle Quick Featured Toggle (Featured <-> Normal)
  const handleToggleFeatured = async (tour: Tour) => {
    const newFeatured = !tour.featured;

    if (!UUID_REGEX.test(tour.id)) {
      setTours((prev) =>
        prev.map((t) => (t.id === tour.id ? { ...t, featured: newFeatured } : t))
      );
      return;
    }

    if (!isConfigured) return;

    try {
      const token = await getAdminBearerToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/tours/${tour.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ featured: newFeatured }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setTours((prev) =>
          prev.map((t) => (t.id === tour.id ? { ...t, featured: newFeatured } : t))
        );
      } else {
        throw new Error(json.error || json.message || "Failed to update featured status");
      }
    } catch (err) {
      console.error("Failed to toggle tour featured status:", err);
    }
  };

  // Open Delete Confirmation
  const openDeleteModal = (tour: Tour) => {
    setTourToDelete(tour);
    setDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  // Execute Tour Deletion
  const handleDeleteConfirm = async () => {
    if (!tourToDelete) return;

    // If ID is not a valid UUID (mock/legacy tour), remove immediately from UI
    if (!UUID_REGEX.test(tourToDelete.id)) {
      setTours((prev) => prev.filter((t) => t.id !== tourToDelete.id));
      setDeleteModalOpen(false);
      setTourToDelete(null);
      return;
    }

    if (!isConfigured) return;
    setIsDeleting(true);

    try {
      const token = await getAdminBearerToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/tours/${tourToDelete.id}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setTours((prev) => prev.filter((t) => t.id !== tourToDelete.id));
        setDeleteModalOpen(false);
        setTourToDelete(null);
      } else {
        alert(json.error || json.message || "Failed to delete tour");
      }
    } catch (err: any) {
      console.error("Failed to delete tour:", err);
      alert(err.message || "Failed to delete tour");
    } finally {
      setIsDeleting(false);
    }
  };

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tours.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tours]);

  // Filtering & Sorting
  const filteredTours = useMemo(() => {
    return tours
      .filter((tour) => {
        const matchesSearch =
          tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.destination?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || tour.status === statusFilter;

        const matchesCategory =
          categoryFilter === "all" || tour.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
        if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      });
  }, [tours, searchQuery, statusFilter, categoryFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage) || 1;
  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTours.slice(start, start + itemsPerPage);
  }, [filteredTours, currentPage]);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header - Centered on Mobile, Unchanged on Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display text-center sm:text-left">
            Tour Management
          </h1>
          <p className="text-xs text-[#64748B] mt-1 text-center sm:text-left max-w-lg mx-auto sm:mx-0">
            Manage your domestic tour catalog, inventory, pricing, and live status.
          </p>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
          

          <Link
            href="/admin/tours/create"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#F04B16] hover:bg-[#d94012] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span> Add New Tour</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar - Mobile Optimized, Desktop Preserved */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] p-3.5 sm:p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Search Field */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by tour name, state..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="grid grid-cols-2 gap-2.5 sm:contents">
            <div className="col-span-1 sm:col-span-1 lg:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 sm:py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] cursor-pointer"
              >
                <option value="all">All Statuses ({tours.length})</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 sm:py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B50]/20 focus:border-[#082B50] cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter & Result Count Pill */}
      {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong className="text-slate-800">{filteredTours.length}</strong> {filteredTours.length === 1 ? "tour package" : "tour packages"}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setCategoryFilter("all");
              setCurrentPage(1);
            }}
            className="text-[11px] font-semibold text-[#F04B16] hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#64748B]">
            <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
            Loading tour packages...
          </div>
        ) : paginatedTours.length === 0 ? (
          <div className="p-16 text-center">
            <Compass className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#172B4D]">No tour packages found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Your tour catalog is currently empty. Create your first tour package to get started."}
            </p>
            <div className="mt-4">
              <Link
                href="/admin/tours/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F04B16] text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tour Package</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: Touch-Friendly Tour Cards (< md) */}
            <div className="block md:hidden divide-y divide-[#E5EAF1]">
              {paginatedTours.map((tour) => (
                <div
                  key={tour.id}
                  className="p-4 space-y-3 bg-white hover:bg-[#F8FAFC] transition-colors"
                >
                  {/* Top row: Cover Thumbnail + Title + Destination */}
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-xl bg-[#F5F8FC] border border-[#E5EAF1] flex-shrink-0 overflow-hidden shadow-2xs">
                      {tour.cover_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={tour.cover_image}
                          alt={tour.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#94A3B8]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#F04B16] bg-[#FFF2ED] border border-[#FDDCD0] px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {tour.category || "Tour"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(tour)}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                              tour.featured
                                ? "bg-amber-50 text-amber-700 border-amber-300"
                                : "text-slate-400 border-slate-200 hover:text-amber-600"
                            }`}
                            title="Toggle Featured"
                          >
                            {tour.featured ? "★ Featured" : "☆"}
                          </button>
                        </div>
                        {/* Status Toggle Button on Mobile */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tour)}
                          disabled={isUpdatingStatus === tour.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            tour.status === "published"
                              ? "bg-[#EBF7F0] text-[#16A36A] hover:bg-[#d8f1e1]"
                              : "bg-[#F1F5F9] text-[#64748B] hover:bg-slate-200"
                          }`}
                          title="Tap to toggle published / draft"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tour.status === "published" ? "bg-[#16A36A]" : "bg-[#94A3B8]"
                            }`}
                          />
                          <span>
                            {isUpdatingStatus === tour.id
                              ? "..."
                              : tour.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </button>
                      </div>

                      <Link
                        href={`/admin/tours/${tour.id}/edit`}
                        className="font-bold text-sm text-[#172B4D] hover:text-[#F04B16] transition-colors line-clamp-1 mt-1 block"
                      >
                        {tour.name}
                      </Link>

                      <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
                        <MapPin className="w-3 h-3 text-[#94A3B8] flex-shrink-0" />
                        <span className="truncate">{tour.destination?.name || tour.state || "India"}</span>
                        <span>•</span>
                        <span className="whitespace-nowrap font-medium text-slate-700">{tour.days}D / {tour.nights}N</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle row: Price & Created Date */}
                  <div className="flex items-center justify-between bg-[#F8FAFC] p-2.5 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Package Price</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-[#082B50] text-sm">
                          {formatCurrency(tour.price)}
                        </span>
                        {tour.discounted_price && (
                          <span className="text-[10px] text-[#16A36A] font-semibold">
                            (Disc: {formatCurrency(tour.discounted_price)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Created</span>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {formatDate(tour.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row: Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    

                    <div className="flex items-center gap-2">
                      <a
                        href={`${siteUrl}/tours/${tour.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#082B50] text-xs font-semibold hover:bg-slate-50"
                        title="View Live Tour Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#F15A24]" />
                        <span>View</span>
                      </a>

                      <Link
                        href={`/admin/tours/${tour.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082B50] text-white text-xs font-semibold hover:bg-[#123F68] shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(tour)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FEECEC] text-[#DC4444] text-xs font-semibold hover:bg-[#fcd7d7] cursor-pointer"
                        title="Delete Tour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden on mobile, visible on md and up - 100% Preserved) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-medium">
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Tour Name</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {paginatedTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* Tour Image */}
                    <td className="py-3 px-4">
                      <div className="w-11 h-11 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {tour.cover_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={tour.cover_image}
                            alt={tour.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MapPin className="w-4 h-4 text-[#94A3B8]" />
                        )}
                      </div>
                    </td>

                    {/* Tour Name & Category */}
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <Link
                          href={`/admin/tours/${tour.id}/edit`}
                          className="font-semibold text-[#172B4D] hover:text-[#F04B16] transition-colors truncate block"
                          title={tour.name}
                        >
                          {tour.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-0.5">
                          <span className="inline-block px-1.5 py-0.2 rounded bg-[#F5F8FC] border border-[#E5EAF1] font-medium">
                            {tour.category || "Tour"}
                          </span>
                          {tour.tour_type && (
                            <span className="text-[#94A3B8] truncate">· {tour.tour_type}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(tour)}
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border transition-colors cursor-pointer ${
                              tour.featured
                                ? "bg-amber-50 text-amber-700 border-amber-300"
                                : "text-slate-400 border-transparent hover:border-slate-200 hover:text-amber-600"
                            }`}
                            title="Click to toggle featured"
                          >
                            {tour.featured ? "★ Featured" : "☆ Set Featured"}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#172B4D]">
                        {tour.destination?.name || tour.state || "India"}
                      </p>
                      {tour.state && (
                        <p className="text-[11px] text-[#64748B]">{tour.state}</p>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#172B4D]">
                      <span className="font-medium">{tour.days} Days / {tour.nights} Nights</span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-[#172B4D]">
                        {formatCurrency(tour.price)}
                      </p>
                      {tour.discounted_price && (
                        <p className="text-[11px] text-[#16A36A]">
                          Discount: {formatCurrency(tour.discounted_price)}
                        </p>
                      )}
                    </td>

                    {/* Status Badge & Quick Toggle */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(tour)}
                        disabled={isUpdatingStatus === tour.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          tour.status === "published"
                            ? "bg-[#EBF7F0] text-[#16A36A] hover:bg-[#d8f1e1]"
                            : "bg-[#F1F5F9] text-[#64748B] hover:bg-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tour.status === "published" ? "bg-[#16A36A]" : "bg-[#94A3B8]"
                          }`}
                        />
                        <span>
                          {isUpdatingStatus === tour.id
                            ? "Updating..."
                            : tour.status === "published"
                            ? "Published"
                            : "Draft"}
                        </span>
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#64748B]">
                      {formatDate(tour.created_at)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="relative inline-flex items-center justify-end gap-1">
                        <a
                          href={`${siteUrl}/tours/${tour.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-[#64748B] hover:text-[#F15A24] hover:bg-[#F5F8FC] transition-colors"
                          title="View Live Tour Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <Link
                          href={`/admin/tours/${tour.id}/edit`}
                          className="p-1.5 rounded-md text-[#64748B] hover:text-[#082B50] hover:bg-[#F5F8FC] transition-colors"
                          title="Edit Tour"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => openDeleteModal(tour)}
                          className="p-1.5 rounded-md text-[#DC4444] hover:bg-[#FEECEC] transition-colors cursor-pointer"
                          title="Delete Tour"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#E5EAF1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B] bg-[#FAFCFF] text-center sm:text-left">
        <div className="mx-auto sm:mx-0">
          Showing{" "}
          <strong className="text-[#172B4D]">
            {filteredTours.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-[#172B4D]">
            {Math.min(currentPage * itemsPerPage, filteredTours.length)}
          </strong>{" "}
          of <strong className="text-[#172B4D]">{filteredTours.length}</strong> tours
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#E5EAF1] bg-white text-[#64748B] hover:text-[#082B50] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-3 py-1 font-semibold text-[#172B4D]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E5EAF1] bg-white text-[#64748B] hover:text-[#082B50] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && tourToDelete && (
        <div className="fixed inset-0 z-50 bg-[#082B50]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5EAF1] animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-[#FEECEC] text-[#DC4444] flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-[#172B4D] font-display">
              Delete Tour Package
            </h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#172B4D]">&ldquo;{tourToDelete.name}&rdquo;</strong>?
              This action cannot be undone and will permanently remove the tour from the website and inventory.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-[#E5EAF1] text-xs font-semibold text-[#64748B] hover:bg-[#F5F8FC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-[#DC4444] hover:bg-[#b93232] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Delete Tour"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
