"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="py-8 sm:py-10 bg-white border-y border-[#DCEAF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Email Icon & Heading & Subtitle */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F15A24] flex-shrink-0 shadow-xs">
              <Mail className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#082B50] leading-tight">
                Subscribe to Our Travel Updates
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Get the latest tour packages, travel deals and destination guides.
              </p>
            </div>
          </div>

          {/* Right: Email Input & Subscribe Button */}
          <div className="w-full lg:w-auto flex-shrink-0">
            {submitted ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-lg text-sm font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Thank you for subscribing! Check your inbox for exclusive travel deals.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2.5 sm:py-3 text-sm text-[#082B50] placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F15A24]/30 focus:border-[#F15A24] transition-all"
                  />
                  {error && (
                    <span className="absolute left-0 -bottom-5 text-xs text-rose-500 font-medium">
                      {error}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#F15A24] hover:bg-[#d94815] text-white font-bold text-sm px-6 py-2.5 sm:py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

