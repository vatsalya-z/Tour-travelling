import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TourTripHolidays.com - Domestic Tour Packages for All 28 States of India",
  description:
    "Explore India with TourTripHolidays. Customizable domestic tour packages, best price assured, safe & trusted travel partner for all 28 states of India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-[#10264A] font-sans antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
