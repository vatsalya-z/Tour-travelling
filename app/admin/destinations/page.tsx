"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Upload,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { uploadTourImage } from "@/lib/supabase/storage";
import { slugify, formatDate } from "@/lib/utils";
import { Destination, DestinationStatus } from "@/types/destination";

export default function DestinationsAdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [attractions, setAttractions] = useState<string[]>([]);
  const [newAttraction, setNewAttraction] = useState("");
  const [status, setStatus] = useState<DestinationStatus>("published");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<Destination | null>(null);

  const isConfigured = isSupabaseConfigured();

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name", { ascending: true });

      if (data && !error) {
        setDestinations(data as Destination[]);
      }
    } catch (err) {
      console.warn("Failed to fetch destinations:", err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const openCreateModal = () => {
    setIsEdit(false);
    setEditingId(null);
    setName("");
    setSlug("");
    setState("");
    setDescription("");
    setCoverImage("");
    setBestTimeToVisit("October to March");
    setAttractions(["Scenic Lakes", "Historical Forts", "Local Markets"]);
    setStatus("published");
    setMetaTitle("");
    setMetaDescription("");
    setModalOpen(true);
  };

  const openEditModal = (dest: Destination) => {
    setIsEdit(true);
    setEditingId(dest.id);
    setName(dest.name);
    setSlug(dest.slug);
    setState(dest.state);
    setDescription(dest.description || "");
    setCoverImage(dest.cover_image || "");
    setBestTimeToVisit(dest.best_time_to_visit || "");
    setAttractions(dest.attractions || []);
    setStatus(dest.status);
    setMetaTitle(dest.meta_title || "");
    setMetaDescription(dest.meta_description || "");
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const { url, error } = await uploadTourImage(file, "destinations");
    if (url) {
      setCoverImage(url);
    } else if (error) {
      alert(`Image upload error: ${error}`);
    }
    setUploadingImage(false);
  };

  const addAttraction = () => {
    if (newAttraction.trim()) {
      setAttractions([...attractions, newAttraction.trim()]);
      setNewAttraction("");
    }
  };

  const removeAttraction = (idx: number) => {
    setAttractions(attractions.filter((_, i) => i !== idx));
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !state.trim()) {
      alert("Name and State are required.");
      return;
    }

    if (!isConfigured) {
      alert("Supabase is not configured yet in .env.local");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        state: state.trim(),
        description: description.trim() || null,
        cover_image: coverImage || "/images/destinations/kashmir.jpg",
        best_time_to_visit: bestTimeToVisit || null,
        attractions,
        status,
        meta_title: metaTitle || `${name} Tourism | TourTripHolidays`,
        meta_description: metaDescription || description,
      };

      if (isEdit && editingId) {
        const { error } = await supabase
          .from("destinations")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("destinations").insert(payload);
        if (error) throw error;
      }

      setModalOpen(false);
      fetchDestinations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save destination");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!destinationToDelete || !isConfigured) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("destinations")
        .delete()
        .eq("id", destinationToDelete.id);

      if (!error) {
        setDestinations((prev) =>
          prev.filter((d) => d.id !== destinationToDelete.id)
        );
        setDeleteModalOpen(false);
        setDestinationToDelete(null);
      } else {
        alert(`Delete error: ${error.message}`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting destination");
    }
  };

  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
            Destinations Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage Indian states, regions, attractions, and destination landing pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDestinations}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-xs font-medium text-[#172B4D] cursor-pointer"
            title="Refresh Destinations"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F04B16] hover:bg-[#d94012] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Destination</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E5EAF1] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search destinations by name or state..."
          className="w-full text-xs bg-transparent focus:outline-hidden text-[#172B4D] placeholder-[#94A3B8]"
        />
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-xl border border-[#E5EAF1] text-xs text-[#64748B]">
          <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
          Loading destinations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-xl border border-[#E5EAF1]">
          <MapPin className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#172B4D]">No Destinations Found</h3>
          <p className="text-xs text-[#64748B] mt-1 mb-4 max-w-sm mx-auto">
            Add destinations to assign them when publishing tour packages.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F04B16] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Destination</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden flex flex-col group hover:border-[#CBD5E1] transition-all"
            >
              <div className="h-36 bg-[#F5F8FC] relative overflow-hidden">
                {dest.cover_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={dest.cover_image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                    <MapPin className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-[#082B50] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                  {dest.state}
                </span>
                <span
                  className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs capitalize ${
                    dest.status === "published"
                      ? "bg-[#16A36A] text-white"
                      : "bg-[#64748B] text-white"
                  }`}
                >
                  {dest.status}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-[#172B4D] truncate">
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                    /{dest.slug}
                  </p>
                  <p className="text-xs text-[#64748B] mt-2 line-clamp-2">
                    {dest.description || "No description provided."}
                  </p>

                  {dest.attractions && dest.attractions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {dest.attractions.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#F5F8FC] border border-[#E5EAF1] text-[#082B50] font-medium px-2 py-0.5 rounded"
                        >
                          {a}
                        </span>
                      ))}
                      {dest.attractions.length > 3 && (
                        <span className="text-[10px] text-[#64748B]">
                          +{dest.attractions.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-[#E5EAF1] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#94A3B8]">
                    {formatDate(dest.updated_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dest)}
                      className="p-1 rounded text-[#64748B] hover:text-[#082B50] hover:bg-[#F5F8FC] transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDestinationToDelete(dest);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1 rounded text-[#DC4444] hover:bg-[#FEECEC] transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Destination Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082B50]/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-[#E5EAF1] max-h-[90vh] flex flex-col">
            <div className="bg-white px-6 py-4 border-b border-[#E5EAF1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F04B16]" />
                <h3 className="font-bold text-base text-[#082B50] font-display">
                  {isEdit ? "Edit Destination" : "Add New Destination"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#64748B] hover:text-[#172B4D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#172B4D] mb-1">
                    Destination Name <span className="text-[#DC4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Kashmir Valley"
                    className="w-full h-10 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#172B4D] mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="kashmir-valley"
                    className="w-full h-10 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#172B4D] mb-1">
                    State / Union Territory <span className="text-[#DC4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Jammu & Kashmir"
                    className="w-full h-10 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#172B4D] mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DestinationStatus)}
                    className="w-full h-10 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#172B4D] mb-1">
                    Cover Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="/images/destinations/kashmir.jpg"
                      className="flex-1 h-10 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                    />
                    <label className="h-10 px-3 bg-[#082B50] hover:bg-[#123F68] text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#172B4D] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Captivating description of the destination..."
                    className="w-full p-2.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#172B4D] mb-1">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    value={bestTimeToVisit}
                    onChange={(e) => setBestTimeToVisit(e.target.value)}
                    placeholder="e.g. March to August (Summer & Spring)"
                    className="w-full h-10 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#172B4D] mb-1">
                    Popular Attractions
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {attractions.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-[#F5F8FC] border border-[#E5EAF1] text-[#082B50] font-medium px-2.5 py-1 rounded"
                      >
                        <span>{a}</span>
                        <button
                          type="button"
                          onClick={() => removeAttraction(i)}
                          className="text-[#64748B] hover:text-[#DC4444]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAttraction}
                      onChange={(e) => setNewAttraction(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAttraction();
                        }
                      }}
                      placeholder="Add an attraction (e.g. Gulmarg Gondola)..."
                      className="flex-1 h-10 px-3 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D]"
                    />
                    <button
                      type="button"
                      onClick={addAttraction}
                      className="px-3 h-10 bg-[#082B50] text-white font-medium rounded-lg hover:bg-[#123F68]"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5EAF1] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E5EAF1] rounded-lg text-[#64748B] font-medium hover:bg-[#F5F8FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#F04B16] hover:bg-[#d94012] text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {saving ? "Saving..." : isEdit ? "Update Destination" : "Save Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && destinationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082B50]/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl border border-[#E5EAF1] text-center">
            <div className="w-10 h-10 rounded-full bg-[#FEECEC] text-[#DC4444] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D] mb-1 font-display">
              Delete Destination?
            </h3>
            <p className="text-xs text-[#64748B] mb-5">
              Are you sure you want to remove &ldquo;{destinationToDelete.name}&rdquo;?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold border border-[#E5EAF1] rounded-lg text-[#64748B] hover:bg-[#F5F8FC]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-semibold bg-[#DC4444] hover:bg-[#b93232] text-white rounded-lg shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
