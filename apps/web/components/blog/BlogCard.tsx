"use client";

import React from "react";
import Image from "next/image";
import { FileText, MapPin } from "lucide-react";
import { Blog } from "@/types/blog";

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#DCEAF3] shadow-xs hover:border-[#F15A24]/50 hover:shadow-md transition-all duration-300 flex flex-col group h-full select-none">
      {/* Featured Image with Natural 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden block">
        {blog.featured_image ? (
          <Image
            src={blog.featured_image}
            alt={blog.image_alt || blog.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#EAF6FC] text-[#082B50]">
            <FileText className="w-6 h-6 sm:w-10 sm:h-10 text-[#F15A24] mb-1 opacity-70" />
            <span className="text-[10px] sm:text-xs font-bold">TourTripHolidays</span>
          </div>
        )}

        {/* Subtle Category Badge */}
        {blog.category && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#082B50] text-[10px] sm:text-xs font-bold border border-slate-200/80 shadow-xs flex items-center gap-1 sm:gap-1.5 max-w-[85%]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F15A24] shrink-0" />
            <span className="truncate">{blog.category}</span>
          </div>
        )}
      </div>

      {/* Card Content: ONLY HEADING */}
      <div className="p-3 sm:p-5 md:p-6 flex-1 flex flex-col justify-center">
        <h3 className="text-xs sm:text-base md:text-lg font-bold sm:font-extrabold text-[#082B50] group-hover:text-[#F15A24] transition-colors leading-snug line-clamp-3">
          {blog.title}
        </h3>
      </div>
    </article>
  );
}
