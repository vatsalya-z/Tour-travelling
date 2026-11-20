"use client";

import React, { useState, useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Eye,
  Edit3,
} from "lucide-react";

interface BlogEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function BlogEditor({
  value,
  onChange,
  placeholder = "Write your comprehensive travel article here...",
}: BlogEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const updated = value.substring(0, start) + replacement + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  // Convert simple markdown to safe HTML for preview
  const renderPreview = (text: string) => {
    if (!text.trim()) {
      return '<p class="text-slate-400 italic">No content written yet...</p>';
    }

    const lines = text.split("\n");
    let html = "";
    let inList = false;
    let listType = "";

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("### ")) {
        if (inList) { html += listType === "ul" ? "</ul>" : "</ol>"; inList = false; }
        html += `<h3 class="text-lg font-bold text-[#082B50] mt-5 mb-2">${trimmed.substring(4)}</h3>`;
      } else if (trimmed.startsWith("## ")) {
        if (inList) { html += listType === "ul" ? "</ul>" : "</ol>"; inList = false; }
        html += `<h2 class="text-xl font-bold text-[#082B50] mt-6 mb-2 border-b border-slate-100 pb-1">${trimmed.substring(3)}</h2>`;
      } else if (trimmed.startsWith("# ")) {
        if (inList) { html += listType === "ul" ? "</ul>" : "</ol>"; inList = false; }
        html += `<h1 class="text-2xl font-extrabold text-[#082B50] mt-7 mb-3">${trimmed.substring(2)}</h1>`;
      } else if (trimmed.startsWith("> ")) {
        if (inList) { html += listType === "ul" ? "</ul>" : "</ol>"; inList = false; }
        html += `<blockquote class="border-l-4 border-[#F04B16] pl-4 py-1 my-3 bg-[#FFF8F5] text-slate-700 italic rounded-r-lg">${trimmed.substring(2)}</blockquote>`;
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList || listType !== "ul") {
          if (inList) html += listType === "ul" ? "</ul>" : "</ol>";
          html += '<ul class="list-disc pl-5 space-y-1 my-3 text-slate-700">';
          inList = true;
          listType = "ul";
        }
        html += `<li>${formatInline(trimmed.substring(2))}</li>`;
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (!inList || listType !== "ol") {
          if (inList) html += listType === "ul" ? "</ul>" : "</ol>";
          html += '<ol class="list-decimal pl-5 space-y-1 my-3 text-slate-700">';
          inList = true;
          listType = "ol";
        }
        html += `<li>${formatInline(trimmed.replace(/^\d+\.\s/, ""))}</li>`;
      } else if (trimmed.startsWith("![")) {
        if (inList) { html += listType === "ul" ? "</ul>" : "</ol>"; inList = false; }
        const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          html += `<div class="my-4 rounded-xl overflow-hidden border border-slate-200"><img src="${match[2]}" alt="${match[1]}" class="w-full h-auto max-h-96 object-cover" /><p class="text-center text-xs text-slate-400 py-1 bg-slate-50">${match[1]}</p></div>`;
        }
      } else if (trimmed === "") {
        if (inList) { html += listType === "ul" ? "</ul>" : "</ol>"; inList = false; }
      } else {
        if (inList) { html += listType === "ul" ? "</ul>" : "</ol>"; inList = false; }
        html += `<p class="my-3 text-slate-700 leading-relaxed text-sm">${formatInline(trimmed)}</p>`;
      }
    });

    if (inList) html += listType === "ul" ? "</ul>" : "</ol>";

    return html;
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#082B50]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#F04B16] underline font-semibold hover:text-[#d94012]">$1</a>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
  };

  return (
    <div className="border border-[#E5EAF1] rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Editor Header Toolbar */}
      <div className="bg-[#F8FAFC] border-b border-[#E5EAF1] p-2 flex items-center justify-between gap-2 flex-wrap">
        {/* Formatting Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => insertSnippet("# ", "", "Main Heading")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] text-xs font-bold transition-all cursor-pointer"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("## ", "", "Subheading")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] text-xs font-bold transition-all cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("### ", "", "Section Heading")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] text-xs font-bold transition-all cursor-pointer"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertSnippet("**", "**", "bold text")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] transition-all cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("*", "*", "italic text")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] transition-all cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertSnippet("- ", "", "Bullet list item")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] transition-all cursor-pointer"
            title="Bulleted List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("1. ", "", "Numbered item")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] transition-all cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("> ", "", "Important traveler tip or quote")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] transition-all cursor-pointer"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertSnippet("[", "](https://example.com)", "Link text")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] transition-all cursor-pointer"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("![", "](https://images.unsplash.com/photo-...)", "Scenic View of Destination")}
            className="p-1.5 rounded hover:bg-white hover:shadow-xs text-slate-700 hover:text-[#082B50] transition-all cursor-pointer"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E5EAF1]">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "write"
                ? "bg-[#082B50] text-white shadow-xs"
                : "text-slate-600 hover:text-[#082B50]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#082B50] text-white shadow-xs"
                : "text-slate-600 hover:text-[#082B50]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={16}
          className="w-full p-4 text-sm text-[#172B4D] placeholder-slate-400 focus:outline-hidden resize-y font-mono leading-relaxed bg-white"
        />
      ) : (
        <div
          className="p-6 min-h-[384px] bg-[#FAFCFF] overflow-y-auto max-h-[600px] prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
        />
      )}

      {/* Footer Helper */}
      <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#E5EAF1] flex items-center justify-between text-[11px] text-slate-500">
        <span>Supports Markdown: # Heading, **bold**, *italic*, - list, &gt; quote</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}

