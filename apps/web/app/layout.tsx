import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#082B50",
};

export const metadata: Metadata = {
  title: "TourTripHolidays.com - Domestic Tour Packages for All 28 States of India",
  description:
    "Explore India with TourTripHolidays. Customizable domestic tour packages, best price assured, safe & trusted travel partner for all 28 states of India.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TourTripHolidays",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${poppins.variable} ${inter.variable}`}>
      <body className={`${poppins.className} min-h-screen bg-white text-[#10264A] font-sans antialiased flex flex-col overflow-x-hidden selection:bg-[#F15A24]/20 selection:text-[#F15A24]`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
