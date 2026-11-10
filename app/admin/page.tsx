"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle,
  FileText,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Users,
  IndianRupee,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tour } from "@/types/tour";
import { Booking, BookingStatus } from "@/types/booking";

interface DashboardStats {
  totalTours: number;
  publishedTours: number;
  draftTours: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTours: 0,
    publishedTours: 0,
    draftTours: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  const [recentTours, setRecentTours] = useState<Tour[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [monthlyDistribution, setMonthlyDistribution] = useState<
    { month: string; count: number; revenue: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Fetch Tours Stats
      const { data: allTours } = await supabase
        .from("tours")
        .select("id, name, slug, price, status, days, nights, category, cover_image, created_at, state")
        .order("created_at", { ascending: false });

      const toursList = (allTours || []) as unknown as Tour[];
      const totalTours = toursList.length;
      const publishedTours = toursList.filter((t) => t.status === "published").length;
      const draftTours = toursList.filter((t) => t.status === "draft").length;
      setRecentTours(toursList.slice(0, 5));

      // Fetch Bookings Stats
      const { data: allBookings } = await supabase
        .from("bookings")
        .select(`
          id,
          tour_id,
          customer_name,
          customer_email,
          customer_phone,
          travellers_count,
          travel_date,
          total_price,
          status,
          created_at,
          tours (
            name,
            price
          )
        `)
        .order("created_at", { ascending: false });

      const bookingsList = (allBookings || []) as unknown as Booking[];
      const totalBookings = bookingsList.length;
      const pendingBookings = bookingsList.filter((b) => b.status === "pending").length;
      const confirmedBookings = bookingsList.filter((b) => b.status === "confirmed").length;
      const cancelledBookings = bookingsList.filter((b) => b.status === "cancelled").length;
      const completedBookings = bookingsList.filter((b) => b.status === "completed").length;
      const totalRevenue = bookingsList
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + Number(b.total_price || 0), 0);
      setRecentBookings(bookingsList.slice(0, 5));

      // Generate Monthly Trends from real bookings or initialize months
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentYear = new Date().getFullYear();
      const monthMap: Record<number, { count: number; revenue: number }> = {};
      for (let i = 0; i < 12; i++) {
        monthMap[i] = { count: 0, revenue: 0 };
      }

      bookingsList.forEach((b) => {
        if (b.created_at) {
          const d = new Date(b.created_at);
          if (d.getFullYear() === currentYear) {
            const m = d.getMonth();
            if (monthMap[m]) {
              monthMap[m].count += 1;
              if (b.status === "confirmed" || b.status === "completed") {
                monthMap[m].revenue += Number(b.total_price || 0);
              }
            }
          }
        }
      });

      const trendData = months.map((month, idx) => ({
        month,
        count: monthMap[idx].count,
        revenue: monthMap[idx].revenue,
      }));
      setMonthlyDistribution(trendData);

      // Fetch Users Stats
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      setStats({
        totalTours,
        publishedTours,
        draftTours,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalUsers: usersCount || 0,
        totalRevenue,
      });
    } catch (err) {
      console.warn("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Formatted date string for welcome banner
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF7F0] text-[#16A36A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF6E9] text-[#E99A24]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E99A24]" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEECEC] text-[#DC4444]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC4444]" />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF6FC] text-[#082B50]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#082B50]" />
            Completed
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] tracking-tight font-display">
            Welcome back, Admin!
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Here&apos;s what&apos;s happening with your travel business today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-[#172B4D] text-xs font-medium transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/tours/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F04B16] hover:bg-[#d94012] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Tour</span>
          </Link>
        </div>
      </div>

      {/* Supabase Notice if not configured */}
      {!isConfigured && (
        <div className="bg-[#FEF6E9] border border-[#FCD9A5] rounded-xl p-4 flex items-start gap-3 text-[#B36B00]">
          <AlertCircle className="w-4 h-4 text-[#E99A24] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-[#172B4D]">Supabase Live Connection</p>
            <p className="text-[#64748B] mt-0.5">
              To persist live database records, configure your credentials in <code className="bg-white/80 px-1 py-0.5 rounded font-mono border border-[#E5EAF1]">.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {/* 2. Responsive Statistics Cards (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Tours"
          value={stats.totalTours}
          subtitle={`${stats.publishedTours} published · ${stats.draftTours} draft`}
          icon={Compass}
          variant="navy"
        />

        <StatCard
          title="Published Tours"
          value={stats.publishedTours}
          subtitle="Live on website"
          icon={CheckCircle}
          variant="success"
        />

        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All received inquiries"
          icon={CalendarCheck}
          variant="default"
        />

        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          subtitle="Requires attention"
          icon={Clock}
          variant="warning"
        />

        <StatCard
          title="Total Customers"
          value={stats.totalUsers}
          subtitle="Registered profiles"
          icon={Users}
          variant="default"
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Confirmed bookings"
          icon={IndianRupee}
          variant="orange"
        />
      </div>

      {/* 3. Analytics Section: Monthly Booking Trends & Booking Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Booking Trends (Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#E5EAF1] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#F04B16]" />
                <span>Monthly Booking Trends</span>
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Inquiry volume across {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-[#64748B]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#082B50]" />
                <span>Bookings</span>
              </span>
            </div>
          </div>

          {/* Minimalist Grid & SVG Bars */}
          <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-1 border-b border-[#E5EAF1]">
            {(monthlyDistribution.length > 0
              ? monthlyDistribution
              : [
                  { month: "Jan", count: 0 },
                  { month: "Feb", count: 0 },
                  { month: "Mar", count: 0 },
                  { month: "Apr", count: 0 },
                  { month: "May", count: 0 },
                  { month: "Jun", count: 0 },
                  { month: "Jul", count: 0 },
                  { month: "Aug", count: 0 },
                  { month: "Sep", count: 0 },
                  { month: "Oct", count: 0 },
                  { month: "Nov", count: 0 },
                  { month: "Dec", count: 0 },
                ]
            ).map((item) => {
              // Normalized height based on max count
              const maxVal = Math.max(...monthlyDistribution.map((m) => m.count), 5);
              const heightPct = Math.max((item.count / maxVal) * 100, 6);

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
                >
                  <div
                    className="w-full bg-[#EAF6FC] group-hover:bg-[#082B50] rounded-t transition-all duration-200 relative flex items-center justify-center"
                    style={{ height: `${heightPct}%` }}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#082B50] text-white text-[10px] font-medium py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xs z-10">
                      {item.count} bookings
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[#64748B] group-hover:text-[#082B50]">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 text-xs text-[#64748B]">
            <span>Total Annual Inquiries: <strong className="text-[#172B4D]">{stats.totalBookings}</strong></span>
            <span>Real-time Supabase analytics</span>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-xl p-5 border border-[#E5EAF1] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#082B50] font-display flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-[#082B50]" />
              <span>Booking Status Distribution</span>
            </h2>
            <p className="text-[11px] text-[#64748B] mb-4">
              Breakdown of customer inquiry statuses
            </p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#172B4D] font-medium">Confirmed</span>
                  <span className="font-semibold text-[#16A36A]">{stats.confirmedBookings}</span>
                </div>
                <div className="w-full bg-[#F5F8FC] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#16A36A] h-2 rounded-full transition-all"
                    style={{
                      width: stats.totalBookings > 0
                        ? `${(stats.confirmedBookings / stats.totalBookings) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#172B4D] font-medium">Pending Follow-up</span>
                  <span className="font-semibold text-[#E99A24]">{stats.pendingBookings}</span>
                </div>
                <div className="w-full bg-[#F5F8FC] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#E99A24] h-2 rounded-full transition-all"
                    style={{
                      width: stats.totalBookings > 0
                        ? `${(stats.pendingBookings / stats.totalBookings) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#172B4D] font-medium">Completed</span>
                  <span className="font-semibold text-[#082B50]">{stats.completedBookings}</span>
                </div>
                <div className="w-full bg-[#F5F8FC] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#082B50] h-2 rounded-full transition-all"
                    style={{
                      width: stats.totalBookings > 0
                        ? `${(stats.completedBookings / stats.totalBookings) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#172B4D] font-medium">Cancelled</span>
                  <span className="font-semibold text-[#DC4444]">{stats.cancelledBookings}</span>
                </div>
                <div className="w-full bg-[#F5F8FC] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#DC4444] h-2 rounded-full transition-all"
                    style={{
                      width: stats.totalBookings > 0
                        ? `${(stats.cancelledBookings / stats.totalBookings) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E5EAF1] flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Tours Inventory:</span>
            <span className="font-semibold text-[#082B50]">{stats.totalTours} Registered</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Bookings Table & Popular Tours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E5EAF1] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#082B50] font-display">
                Recent Bookings
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Latest customer inquiries received
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-[#F04B16] hover:text-[#d94012] flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#64748B]">
              <RefreshCw className="w-5 h-5 text-[#64748B] animate-spin mx-auto mb-2" />
              Loading bookings...
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarCheck className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#172B4D]">No bookings yet</p>
              <p className="text-[11px] text-[#64748B] mt-1 max-w-xs mx-auto">
                Customer bookings submitted via the website enquiry forms will be cataloged here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-medium">
                    <th className="py-2.5 px-4">Booking ID</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Tour Name</th>
                    <th className="py-2.5 px-4">Travel Date</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF1]">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#64748B]">
                        #{b.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#172B4D]">{b.customer_name}</p>
                        <p className="text-[11px] text-[#64748B]">{b.customer_phone}</p>
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate text-[#172B4D]">
                        {(b as any).tours?.name || "Custom Tour"}
                      </td>
                      <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                        {formatDate(b.travel_date)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#172B4D] whitespace-nowrap">
                        {formatCurrency(b.total_price)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href="/admin/bookings"
                          className="text-[11px] font-medium text-[#082B50] hover:text-[#F04B16] hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recently Added Tours (1 Column) */}
        <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#E5EAF1] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#082B50] font-display">
                  Recent Tours
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Latest packages in catalog
                </p>
              </div>
              <Link
                href="/admin/tours"
                className="text-xs font-semibold text-[#F04B16] hover:text-[#d94012] flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-[#64748B]">
                <RefreshCw className="w-5 h-5 text-[#64748B] animate-spin mx-auto mb-2" />
                Loading tours...
              </div>
            ) : recentTours.length === 0 ? (
              <div className="p-8 text-center">
                <Compass className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#172B4D]">No tours yet</p>
                <p className="text-[11px] text-[#64748B] mt-1 mb-3">
                  Get started by publishing your first domestic tour.
                </p>
                <Link
                  href="/admin/tours/create"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F04B16] text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tour</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E5EAF1]">
                {recentTours.map((tour) => (
                  <div key={tour.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#F5F8FC] border border-[#E5EAF1] flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#172B4D] truncate">
                          {tour.name}
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          {tour.days}D/{tour.nights}N · <span className="font-medium text-[#172B4D]">{formatCurrency(tour.price)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          tour.status === "published"
                            ? "bg-[#EBF7F0] text-[#16A36A]"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {tour.status === "published" ? "Published" : "Draft"}
                      </span>
                      <Link
                        href={`/admin/tours/${tour.id}/edit`}
                        className="p-1 rounded text-[#64748B] hover:text-[#082B50] hover:bg-slate-100 transition-colors"
                        title="Edit Tour"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-[#F8FAFC] border-t border-[#E5EAF1] text-center">
            <Link
              href="/admin/tours/create"
              className="text-xs font-semibold text-[#082B50] hover:text-[#F04B16] inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Tour Package</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
