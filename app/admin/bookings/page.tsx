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
  Eye,
  X,
  ExternalLink,
  Plane,
  Tag,
  Compass,
  Zap,
  User,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Booking, BookingStatus } from "@/types/booking";
import { FaWhatsapp } from "react-icons/fa6";

interface ParsedInquiryDetails {
  packageName?: string;
  groupType?: string;
  flightHelp?: string;
  dateFlexibility?: string;
  bookingTimeline?: string;
  contactTime?: string;
  source?: string;
  customerNote?: string;
}

function parseInquiryDetails(text: string | null): ParsedInquiryDetails {
  if (!text) return {};
  const res: ParsedInquiryDetails = {};

  const pkgMatch = text.match(/(?:Tour \/ Package|Tour \/ Destination|Package):\s*([^\n•]+)/i);
  if (pkgMatch) res.packageName = pkgMatch[1].trim();

  const groupMatch = text.match(/(?:Travelling With|Group Type|Group):\s*([^\n•]+)/i);
  if (groupMatch) res.groupType = groupMatch[1].trim();

  const flightMatch = text.match(/(?:Flight Assistance|Flight Help):\s*([^\n•]+)/i);
  if (flightMatch) res.flightHelp = flightMatch[1].trim();

  const flexMatch = text.match(/(?:Date Flexibility|Flexibility):\s*([^\n•]+)/i);
  if (flexMatch) res.dateFlexibility = flexMatch[1].trim();

  const timelineMatch = text.match(/(?:Booking Timeline|Timeline):\s*([^\n•]+)/i);
  if (timelineMatch) res.bookingTimeline = timelineMatch[1].trim();

  const contactMatch = text.match(/(?:Best Time to Contact|Contact Time|Best Contact):\s*([^\n•]+)/i);
  if (contactMatch) res.contactTime = contactMatch[1].trim();

  const sourceMatch = text.match(/(?:Source|Enquiry Source):\s*([^\n•]+)/i);
  if (sourceMatch) res.source = sourceMatch[1].trim();

  const noteMatch = text.match(/(?:Customer Note|Customer Message|Notes|Message):\s*([^\n•]+)/i);
  if (noteMatch) res.customerNote = noteMatch[1].trim();

  return res;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch via server-side API which uses the service role client and bypasses RLS
      const res = await fetch("/api/bookings?limit=100");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data as Booking[]);
      }
    } catch (err) {
      console.warn("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        alert(json.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update booking status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.customer_name.toLowerCase().includes(q) ||
      b.customer_email.toLowerCase().includes(q) ||
      b.customer_phone.includes(q) ||
      b.id.toLowerCase().includes(q) ||
      (b.user_id && b.user_id.toLowerCase().includes(q));

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

  const selectedDetails = selectedBooking ? parseInquiryDetails(selectedBooking.special_requests) : {};
  const cleanPhone = selectedBooking?.customer_phone?.replace(/[^\d+]/g, "") || "";
  const waPhone = cleanPhone.startsWith("+") ? cleanPhone.replace("+", "") : `91${cleanPhone.replace(/^0+/, "")}`;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header - Centered on Mobile View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display text-center sm:text-left">
            Bookings & Customer Inquiries
          </h1>
        </div>

        
      </div>

      {/* Filter and Search Bar - Mobile Optimized */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E5EAF1] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, phone, email..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg px-3 py-1.5 sm:py-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#082B50]/20 transition-all">
            <Filter className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-transparent border-0 text-xs font-semibold text-[#172B4D] focus:outline-hidden cursor-pointer py-1"
            >
              <option value="all">All Statuses ({bookings.length})</option>
              <option value="pending">Pending Follow-up</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search & Filter Count Badge */}
      {(searchQuery || statusFilter !== "all") && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{filtered.length}</strong> {filtered.length === 1 ? "inquiry" : "inquiries"}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-[11px] font-semibold text-[#F04B16] hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Bookings Container */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#64748B]">
            <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
            Loading customer bookings and inquiries...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarCheck className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#172B4D]">No Bookings Found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              Customer inquiries submitted via the multi-step enquiry forms will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: Touch-Friendly Inquiry Cards (< md) */}
            <div className="block md:hidden divide-y divide-[#E5EAF1]">
              {filtered.map((b) => {
                const details = parseInquiryDetails(b.special_requests);
                const displayTourName =
                  (b as any).tour?.name ||
                  (b as any).tours?.name ||
                  details.packageName ||
                  "Custom Travel Inquiry";
                const cleanPhone = b.customer_phone?.replace(/[^\d+]/g, "") || "";
                const waPhone = cleanPhone.startsWith("+")
                  ? cleanPhone.replace("+", "")
                  : `91${cleanPhone.replace(/^0+/, "")}`;

                return (
                  <div
                    key={b.id}
                    className="p-4 space-y-3 bg-white hover:bg-[#F8FAFC] transition-colors"
                  >
                    {/* Header: Ref & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#082B50]">
                        <span>Ref #{b.id.slice(0, 8)}</span>
                        {b.user_id && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF6FC] text-[#082B50] border border-sky-200"
                            title={`Customer Login UUID: ${b.user_id}`}
                          >
                            Cust: {b.user_id.slice(0, 8)}
                          </span>
                        )}
                      </div>
                      <div>{getStatusBadge(b.status)}</div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h4 className="text-sm font-bold text-[#172B4D]">
                        {b.customer_name}
                      </h4>
                      <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5 flex-wrap">
                        <Phone className="w-3 h-3 text-[#94A3B8]" />
                        <span className="font-medium text-[#082B50]">{b.customer_phone}</span>
                        <span className="mx-1">•</span>
                        <span>{b.customer_email}</span>
                      </p>
                    </div>

                    {/* Tour Info */}
                    <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="font-semibold text-[#172B4D] flex items-center gap-1.5 flex-wrap">
                        <span>{displayTourName}</span>
                        {details.groupType && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                            {details.groupType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                        <span>Date: <strong className="text-slate-800">{formatDate(b.travel_date)}</strong></span>
                        <span>Travellers: <strong className="text-slate-800">{b.travellers_count} pax</strong></span>
                      </div>
                    </div>

                    {/* Actions: View Details, WhatsApp, Call, Status Selector */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${waPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xs"
                          title="WhatsApp"
                        >
                          <FaWhatsapp className="w-3.5 h-3.5 text-white" />
                        </a>
                        <a
                          href={`tel:${b.customer_phone}`}
                          className="p-2 rounded-lg bg-[#082B50] hover:bg-[#123F68] text-white flex items-center justify-center shadow-2xs"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded-lg border border-[#E5EAF1] bg-white hover:bg-slate-50 text-xs font-semibold text-[#082B50] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#F04B16]" />
                          <span>Details</span>
                        </button>
                      </div>

                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) =>
                          handleUpdateStatus(b.id, e.target.value as BookingStatus)
                        }
                        className="px-2 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-semibold text-[#172B4D] cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden on mobile, visible on md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-medium">
                  <th className="py-3 px-4">Inquiry ID</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Customer Name & Contact</th>
                  <th className="py-3 px-4">Tour / Package</th>
                  <th className="py-3 px-4">Travel Date</th>
                  <th className="py-3 px-4">Pax</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {filtered.map((b) => {
                  const details = parseInquiryDetails(b.special_requests);
                  const displayTourName =
                    (b as any).tour?.name ||
                    (b as any).tours?.name ||
                    details.packageName ||
                    "Custom Travel Inquiry";

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                      onClick={() => setSelectedBooking(b)}
                    >
                      {/* Booking ID */}
                      <td className="py-3 px-4 font-mono font-medium text-[#64748B]">
                        <span className="group-hover:text-[#F04B16] transition-colors font-bold">
                          #{b.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* Customer Login ID */}
                      <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold bg-[#EAF6FC] text-[#082B50] border border-sky-200 text-[11px]"
                            title={`Customer Login UUID: ${b.user_id || "None"}`}
                          >
                            {b.user_id ? b.user_id.slice(0, 8) : "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info (Name & Contact) */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-[#172B4D]">{b.customer_name}</p>
                          <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[#94A3B8]" />
                            <span className="font-medium text-[#082B50]">{b.customer_phone}</span>
                          </p>
                          <p className="text-[11px] text-[#64748B] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#94A3B8]" />
                            <span>{b.customer_email}</span>
                          </p>
                        </div>
                      </td>

                      {/* Tour Name & Questionnaire Tag */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-[#172B4D]">{displayTourName}</p>
                          {details.groupType && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                              {details.groupType}
                            </span>
                          )}
                          {details.bookingTimeline && details.bookingTimeline.includes("48") && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" />
                              48h Urgent
                            </span>
                          )}
                        </div>
                        {details.customerNote ? (
                          <p className="text-[11px] text-[#64748B] italic line-clamp-1 mt-0.5">
                            &quot;{details.customerNote}&quot;
                          </p>
                        ) : b.special_requests ? (
                          <p className="text-[11px] text-[#64748B] italic line-clamp-1 mt-0.5">
                            {b.special_requests.replace(/•/g, " | ")}
                          </p>
                        ) : null}
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
                        {b.total_price > 0 ? formatCurrency(b.total_price) : "On Request"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(b.status)}
                      </td>

                      {/* Action Dropdown & View Button */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-lg border border-[#E5EAF1] bg-white hover:bg-[#F5F8FC] text-[#64748B] hover:text-[#082B50] transition-colors cursor-pointer"
                            title="View Full Inquiry Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <select
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) =>
                              handleUpdateStatus(b.id, e.target.value as BookingStatus)
                            }
                            className="px-2 py-1 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] cursor-pointer hover:bg-white focus:bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>

      {/* Inquiry Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#E5EAF1] p-5 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#082B50]">
                    Inquiry #{selectedBooking.id.slice(0, 8)}
                  </h3>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Received on {formatDate(selectedBooking.created_at || new Date().toISOString())}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Quick Action Contact Bar */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#082B50] text-white flex items-center justify-center font-bold text-sm">
                    {selectedBooking.customer_name ? selectedBooking.customer_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#172B4D]">{selectedBooking.customer_name}</h4>
                    <p className="text-xs text-[#64748B]">{selectedBooking.customer_phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${waPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba5a] transition-colors"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5 text-white" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${selectedBooking.customer_phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082B50] text-white text-xs font-semibold hover:bg-[#061d36] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${selectedBooking.customer_email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Customer & Travel Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Identity</h5>
                  <div className="text-xs space-y-2">
                    {/* <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-blue-600 block">Customer Login ID</span>
                      <span className="font-mono font-bold text-[#082B50] text-xs select-all">
                        {selectedBooking.user_id || "N/A"}
                      </span>
                    </div> */}
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-500">Name:</span>{" "}
                      <span className="font-bold text-slate-900">{selectedBooking.customer_name}</span>
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-500">Mobile:</span> {selectedBooking.customer_phone}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-500">Email:</span> {selectedBooking.customer_email}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Travel Overview</h5>
                  <div className="text-xs space-y-1.5">
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-500">Target Date:</span> {formatDate(selectedBooking.travel_date)}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-500">Travellers:</span> {selectedBooking.travellers_count} Persons
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-500">Quoted Amount:</span>{" "}
                      {selectedBooking.total_price > 0 ? formatCurrency(selectedBooking.total_price) : "On Request"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-Step Questionnaire Answers */}
              <div className="p-4 rounded-xl border border-slate-200 bg-[#FAFAFA] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#F04B16]" />
                  Enquiry Questionnaire & Customer Preferences
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium block">Tour / Package</span>
                    <span className="font-semibold text-slate-800">
                      {(selectedBooking as any).tour?.name || (selectedBooking as any).tours?.name || selectedDetails.packageName || "Domestic Custom Tour"}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium block">Travelling With</span>
                    <span className="font-semibold text-slate-800">
                      {selectedDetails.groupType || "Not specified"}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium block">Flight Assistance</span>
                    <span className="font-semibold text-slate-800">
                      {selectedDetails.flightHelp || "Not specified"}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium block">Date Flexibility</span>
                    <span className="font-semibold text-slate-800">
                      {selectedDetails.dateFlexibility || "Fixed date"}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium block">Booking Timeline</span>
                    <span className="font-semibold text-slate-800">
                      {selectedDetails.bookingTimeline || "Standard"}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium block">Best Time to Contact</span>
                    <span className="font-semibold text-slate-800">
                      {selectedDetails.contactTime || "Anytime"}
                    </span>
                  </div>
                </div>

                {selectedDetails.source && (
                  <div className="text-xs text-slate-500 pt-1">
                    <span className="font-medium">Origin:</span> {selectedDetails.source}
                  </div>
                )}

                {selectedDetails.customerNote && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                    <span className="text-[11px] text-slate-500 font-medium block">Customer Note / Message:</span>
                    <p className="text-xs text-slate-800 mt-0.5 italic">
                      &quot;{selectedDetails.customerNote}&quot;
                    </p>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
