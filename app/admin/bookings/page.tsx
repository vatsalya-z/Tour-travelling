"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  RefreshCw,
  Users,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Booking, BookingStatus } from "@/types/booking";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          tours (
            name,
            price
          )
        `)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setBookings(data as unknown as Booking[]);
      }
    } catch (err) {
      console.warn("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    if (!isConfigured) return;
    setUpdatingId(bookingId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (!error) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error("Failed to update booking status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF7F0] text-[#16A36A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF6E9] text-[#E99A24]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E99A24]" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEECEC] text-[#DC4444]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC4444]" />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF6FC] text-[#082B50]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#082B50]" />
            Completed
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F8FC] text-[#64748B]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
            Bookings & Customer Inquiries
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time customer travel reservations submitted from website enquiry forms.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-xs font-medium text-[#172B4D] cursor-pointer self-start sm:self-auto"
          title="Refresh Bookings"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email or mobile..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] focus:bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses ({bookings.length})</option>
            <option value="pending">Pending Follow-up</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#64748B]">
            <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
            Loading customer bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarCheck className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#172B4D]">No Bookings Found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              Customer inquiries submitted via the public enquiry forms will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-medium">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Tour Package</th>
                  <th className="py-3 px-4">Travel Date</th>
                  <th className="py-3 px-4">Travellers</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Booking ID */}
                    <td className="py-3 px-4 font-mono font-medium text-[#64748B]">
                      #{b.id.slice(0, 8)}
                    </td>

                    {/* Customer Info */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-[#172B4D]">{b.customer_name}</p>
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#94A3B8]" />
                          <span>{b.customer_email}</span>
                        </p>
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#94A3B8]" />
                          <span>{b.customer_phone}</span>
                        </p>
                      </div>
                    </td>

                    {/* Tour Name */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#172B4D]">
                        {(b as any).tours?.name || "Custom Domestic Package"}
                      </p>
                      {b.special_requests && (
                        <p className="text-[11px] text-[#64748B] italic line-clamp-1 mt-0.5">
                          &quot;{b.special_requests}&quot;
                        </p>
                      )}
                    </td>

                    {/* Travel Date */}
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                      {formatDate(b.travel_date)}
                    </td>

                    {/* Travellers */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-[#F5F8FC] border border-[#E5EAF1] text-[#082B50] px-2 py-0.5 rounded text-[11px] font-medium">
                        <Users className="w-3 h-3 text-[#F04B16]" />
                        <span>{b.travellers_count} pax</span>
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-bold text-[#172B4D] whitespace-nowrap">
                      {formatCurrency(b.total_price)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(b.status)}
                    </td>

                    {/* Action Dropdown */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) =>
                          handleUpdateStatus(b.id, e.target.value as BookingStatus)
                        }
                        className="px-2.5 py-1 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] cursor-pointer hover:bg-white focus:bg-white"
                      >
                        <option value="pending">Mark Pending</option>
                        <option value="confirmed">Mark Confirmed</option>
                        <option value="completed">Mark Completed</option>
                        <option value="cancelled">Mark Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
