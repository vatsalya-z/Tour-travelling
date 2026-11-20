"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Blog, BlogStatus } from "@/types/blog";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBlogs(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch admin blogs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleToggleStatus = async (blog: Blog) => {
    const nextStatus: BlogStatus = blog.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    setActionLoadingId(blog.id);

    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: nextStatus } : b))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unique categories for filter
  const uniqueCategories = Array.from(
    new Set(blogs.map((b) => b.category).filter(Boolean))
  ) as string[];

  // Filtered blogs
  const filtered = blogs.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      (b.author_name || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || b.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalBlogs = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === "PUBLISHED").length;
  const draftCount = blogs.filter((b) => b.status === "DRAFT").length;
  const unpublishedCount = blogs.filter((b) => b.status === "UNPUBLISHED").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
            Blog Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Create, publish, and manage travel articles, guides, and destination insights.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-xs font-semibold text-[#172B4D] shadow-xs cursor-pointer transition-colors"
            title="Refresh Blogs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/blogs/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F04B16] hover:bg-[#d94012] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Blog</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF6FC] flex items-center justify-center text-[#082B50] flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Total Articles</p>
            <h3 className="text-xl font-bold text-[#082B50] mt-0.5">{totalBlogs}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#16A36A] flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Live Published</p>
            <h3 className="text-xl font-bold text-[#16A36A] mt-0.5">{publishedCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF4EE] flex items-center justify-center text-[#E99A24] flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Drafts Pending</p>
            <h3 className="text-xl font-bold text-[#E99A24] mt-0.5">{draftCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F5F8FC] flex items-center justify-center text-[#64748B] flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Categories</p>
            <h3 className="text-xl font-bold text-[#082B50] mt-0.5">{uniqueCategories.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by article title, slug, or author..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses ({blogs.length})</option>
              <option value="PUBLISHED">Published Only ({publishedCount})</option>
              <option value="DRAFT">Drafts ({draftCount})</option>
              <option value="UNPUBLISHED">Unpublished ({unpublishedCount})</option>
            </select>
          </div>

          {uniqueCategories.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#64748B]">
            <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
            Loading blog articles...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#172B4D]">No Articles Found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              {blogs.length === 0
                ? "Start building your travel authority by publishing your first article."
                : "No articles match the current filter and search query."}
            </p>
            {blogs.length === 0 && (
              <Link
                href="/admin/blogs/create"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F04B16] text-white text-xs font-bold shadow-xs hover:bg-[#d94012] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Blog</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-medium">
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {filtered.map((blog) => {
                  const isPublished = blog.status === "PUBLISHED";
                  const isDraft = blog.status === "DRAFT";

                  return (
                    <tr key={blog.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Article Title & Cover */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {blog.featured_image ? (
                            <div className="relative w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                              <Image
                                src={blog.featured_image}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-[#EAF6FC] flex items-center justify-center text-[#082B50] flex-shrink-0 border border-[#DCEAF3]">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}

                          <div className="min-w-0 max-w-sm sm:max-w-md">
                            <h4 className="font-bold text-[#172B4D] truncate hover:text-[#F04B16] transition-colors">
                              <Link href={`/admin/blogs/${blog.id}/edit`}>
                                {blog.title}
                              </Link>
                            </h4>
                            <p className="text-[11px] text-[#64748B] font-mono truncate mt-0.5">
                              /blog/{blog.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F8FC] border border-[#E5EAF1] text-[#082B50]">
                          {blog.category || "General"}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B]">
                        {blog.author_name || "TourTripHolidays"}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B]">
                        {blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#16A36A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
                            <span>Published</span>
                          </span>
                        ) : isDraft ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF4EE] text-[#E99A24]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E99A24]" />
                            <span>Draft</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span>Unpublished</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* View on Website */}
                          <Link
                            href="/blog"
                            target="_blank"
                            title="View on Website"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#082B50] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Quick Publish / Unpublish Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(blog)}
                            disabled={actionLoadingId === blog.id}
                            title={isPublished ? "Unpublish Article" : "Publish Article"}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B] hover:text-[#16A36A] transition-colors cursor-pointer"
                          >
                            {isPublished ? (
                              <ToggleRight className="w-4 h-4 text-[#16A36A]" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          {/* Edit Article */}
                          <Link
                            href={`/admin/blogs/${blog.id}/edit`}
                            title="Edit Blog"
                            className="p-1.5 rounded-lg hover:bg-[#EAF6FC] text-[#082B50] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Article */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(blog.id)}
                            title="Delete Blog"
                            className="p-1.5 rounded-lg hover:bg-[#FEECEC] text-[#DC4444] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 bg-[#082B50]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#E5EAF1]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#FEECEC] text-[#DC4444] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-[#172B4D]">
              Delete Blog Article?
            </h3>
            <p className="text-xs text-center text-[#64748B] mt-1 mb-5">
              Are you sure you want to permanently delete this article? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 px-3 rounded-lg border border-[#E5EAF1] hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBlog(deleteConfirmId)}
                disabled={actionLoadingId === deleteConfirmId}
                className="flex-1 py-2 px-3 rounded-lg bg-[#DC4444] hover:bg-[#b91c1c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === deleteConfirmId ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

