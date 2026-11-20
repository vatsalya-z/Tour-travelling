import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function Logo({ variant = "light", className = "" }: LogoProps) {
  const isDarkBg = variant === "dark";

  return (
    <Link href="/" className={`inline-flex items-center group ${className}`}>
      {isDarkBg ? (
        <div className="bg-white/95 rounded-xl px-3 py-1.5 shadow-sm hover:bg-white transition-colors duration-200">
          <Image
            src="/images/logo/brand-logo.webp"
            alt="TourTripHolidays - Explore India. Discover Happiness."
            width={200}
            height={60}
            className="h-9 sm:h-10 w-auto object-contain group-hover:scale-102 transition-transform duration-200"
          />
          
        </div>
      ) : (
        <Image
          src="/images/logo/logo-transparent.png"
          alt="TourTripHolidays - Explore India. Discover Happiness."
          width={215}
          height={65} 
          priority
          className="h-10 sm:h-12 w-auto object-contain group-hover:scale-102 transition-transform duration-200"
        />
      )}
    </Link>
  );
}
