"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import BlogForm from "@/components/admin/blogs/BlogForm";
import { Blog } from "@/types/blog";

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = use(params);
  const blogId = resolvedParams.id;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlog() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blogs/${blogId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setBlog(json.data);
        } else {
          throw new Error(json.error || "Blog post not found");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    }

    if (blogId) {
      loadBlog();
    }
  }, [blogId]);

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#E5EAF1] shadow-xs my-8 max-w-xl mx-auto">
        <RefreshCw className="w-8 h-8 text-[#082B50] animate-spin mx-auto mb-3" />
        <p className="font-semibold text-sm text-[#082B50]">Loading Article Data...</p>
        <p className="mt-1">Retrieving blog details and editor settings.</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-[#FEECEC] shadow-xs my-8 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-[#DC4444] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#DC4444]">Failed to Load Blog</h3>
        <p className="text-xs text-[#64748B] mt-1 mb-5">{error || "Article could not be retrieved."}</p>
        <Link
          href="/admin/blogs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#082B50] hover:bg-[#123F68] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Blog Management</span>
        </Link>
      </div>
    );
  }

  return <BlogForm initialData={blog} isEditing={true} />;
}

