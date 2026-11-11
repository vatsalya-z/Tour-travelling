"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Filter,
  Eye,
  X,
  Copy,
  Check,
  CreditCard,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface EnrichedCustomer {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile_number: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
  total_bookings?: number;
  confirmed_bookings?: number;
  total_spent?: number;
}

interface CustomerBooking {
  id: string;
  tour_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  travellers_count: number;
  travel_date: string;
  total_price: number;
  status: string;
  special_requests: string | null;
  created_at: string;
  tour?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    cover_image: string | null;
  } | null;
}

interface CustomerDetailsModalData extends EnrichedCustomer {
  stats?: {
    total_bookings: number;
    confirmed: number;
    completed: number;
    pending: number;
    cancelled: number;
    total_spent: number;
  };
  bookings?: CustomerBooking[];
}

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "bookings">("newest");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Detail Modal States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetailsModalData | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.warn("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenDetails = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDetailsLoading(true);
    setCustomerDetails(null);
    try {
      const res = await fetch(`/api/users/${customerId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomerDetails(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCustomerId(null);
    setCustomerDetails(null);
    setCopiedId(false);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === userId ? { ...c, role: newRole } : c))
        );
        if (customerDetails && customerDetails.id === userId) {
          setCustomerDetails({ ...customerDetails, role: newRole });
        }
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter & Sort
  const filtered = customers
    .filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        (c.full_name || "").toLowerCase().includes(query) ||
        (c.email || "").toLowerCase().includes(query) ||
        (c.mobile_number || "").includes(query);

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "customer" && (c.role === "customer" || c.role === "user")) ||
        (roleFilter === "admin" && (c.role === "admin" || c.role === "super_admin"));

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "bookings") {
        return (b.total_bookings || 0) - (a.total_bookings || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Calculate high-level stats
  const totalCustomersCount = customers.length;
  const customersWithBookings = customers.filter((c) => (c.total_bookings || 0) > 0).length;
  const totalBookingsSum = customers.reduce((sum, c) => sum + (c.total_bookings || 0), 0);
  const totalSpentSum = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
            Customer Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            View registered customers, booking history, packages, and account privileges.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-xs font-semibold text-[#172B4D] shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
          title="Refresh Customer List"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Customers</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAF6FC] flex items-center justify-center text-[#082B50] flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Total Registered</p>
            <h3 className="text-xl font-bold text-[#082B50] mt-0.5">{totalCustomersCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF4EE] flex items-center justify-center text-[#F04B16] flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Active Bookers</p>
            <h3 className="text-xl font-bold text-[#082B50] mt-0.5">{customersWithBookings}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#16A36A] flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Total Bookings</p>
            <h3 className="text-xl font-bold text-[#082B50] mt-0.5">{totalBookingsSum}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FAF5FF] flex items-center justify-center text-[#9333EA] flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B]">Total Revenue</p>
            <h3 className="text-xl font-bold text-[#082B50] mt-0.5">{formatCurrency(totalSpentSum)}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, or mobile..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Roles ({customers.length})</option>
              <option value="customer">Customers Only</option>
              <option value="admin">Administrators Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest Registered</option>
              <option value="oldest">Oldest Registered</option>
              <option value="bookings">Most Bookings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#64748B]">
            <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
            Loading customer records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#172B4D]">No Customers Found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              No registered customers match your current search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-medium">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-center">Bookings</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {filtered.map((c) => {
                  const bookingCount = c.total_bookings || 0;
                  return (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Customer Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#082B50] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                            {c.full_name?.charAt(0).toUpperCase() || c.email?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#172B4D] truncate">{c.full_name || "Unnamed Customer"}</p>
                            <p className="text-[11px] text-[#64748B] truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                        {c.mobile_number ? (
                          <span className="flex items-center gap-1.5 font-medium text-[#172B4D]">
                            <Phone className="w-3 h-3 text-[#94A3B8]" />
                            <span>{c.mobile_number}</span>
                          </span>
                        ) : (
                          <span className="text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Customer ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                        <span title={c.id}>{c.id.substring(0, 8)}...</span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B]">
                        {formatDate(c.created_at)}
                      </td>

                      {/* Bookings Count */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {bookingCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#16A36A]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{bookingCount} {bookingCount === 1 ? "Trip" : "Trips"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">
                            0 Bookings
                          </span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.role === "admin" || c.role === "super_admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF4EE] text-[#F04B16]">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F8FC] border border-[#E5EAF1] text-[#082B50]">
                            <User className="w-3 h-3" />
                            <span>Customer</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAF6FC] hover:bg-[#d6ecf8] text-[#082B50] font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#F04B16]" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Slide-over Modal */}
      {selectedCustomerId && (
        <div
          className="fixed inset-0 z-50 bg-[#082B50]/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={handleCloseDetails}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5EAF1] overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#082B50] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#123F68] text-white border-2 border-white/20 flex items-center justify-center font-bold text-base shadow-sm">
                  {customerDetails?.full_name?.charAt(0).toUpperCase() ||
                    customerDetails?.email?.charAt(0).toUpperCase() ||
                    "C"}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {customerDetails?.full_name || "Customer Details"}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Registered on {customerDetails ? formatDate(customerDetails.created_at) : "..."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {detailsLoading ? (
              <div className="p-16 text-center text-xs text-[#64748B]">
                <RefreshCw className="w-6 h-6 text-[#082B50] animate-spin mx-auto mb-2" />
                Loading customer profile & booking history...
              </div>
            ) : customerDetails ? (
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Contact & ID Info Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E5EAF1] text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[11px] mb-0.5">Email Address</span>
                    <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#F04B16]" />
                      <span>{customerDetails.email || "No email"}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] block text-[11px] mb-0.5">Phone Number</span>
                    <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#16A36A]" />
                      <span>{customerDetails.mobile_number || "Not provided"}</span>
                    </span>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between border-t border-[#E5EAF1] pt-2.5 mt-1">
                    <div>
                      <span className="text-[#64748B] block text-[11px] mb-0.5">Customer UUID</span>
                      <span className="font-mono text-[11px] text-slate-700 select-all">
                        {customerDetails.id}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyId(customerDetails.id)}
                      className="px-2.5 py-1 rounded-md bg-white border border-[#E5EAF1] hover:bg-[#EAF6FC] text-[#082B50] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Booking Summary Metrics */}
                <div>
                  <h4 className="text-xs font-bold text-[#082B50] uppercase tracking-wider mb-3">
                    Booking Overview
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#EAF6FC] p-3 rounded-xl border border-[#DCEAF3]">
                      <span className="text-xs text-[#082B50] font-semibold block">Total Trips</span>
                      <span className="text-lg font-bold text-[#082B50] mt-0.5 block">
                        {customerDetails.stats?.total_bookings || 0}
                      </span>
                    </div>

                    <div className="bg-[#E8F8F0] p-3 rounded-xl border border-[#C6F0DC]">
                      <span className="text-xs text-[#16A36A] font-semibold block">Confirmed</span>
                      <span className="text-lg font-bold text-[#16A36A] mt-0.5 block">
                        {customerDetails.stats?.confirmed || 0}
                      </span>
                    </div>

                    <div className="bg-[#FFF4EE] p-3 rounded-xl border border-[#FCD9A5]">
                      <span className="text-xs text-[#E99A24] font-semibold block">Pending</span>
                      <span className="text-lg font-bold text-[#E99A24] mt-0.5 block">
                        {customerDetails.stats?.pending || 0}
                      </span>
                    </div>

                    <div className="bg-[#FAF5FF] p-3 rounded-xl border border-[#E9D5FF]">
                      <span className="text-xs text-[#9333EA] font-semibold block">Total Spent</span>
                      <span className="text-sm font-bold text-[#9333EA] mt-1 block truncate">
                        {formatCurrency(customerDetails.stats?.total_spent || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Booking History */}
                <div>
                  <h4 className="text-xs font-bold text-[#082B50] uppercase tracking-wider mb-3">
                    Booking History ({customerDetails.bookings?.length || 0})
                  </h4>

                  {(!customerDetails.bookings || customerDetails.bookings.length === 0) ? (
                    <div className="p-8 bg-[#F8FAFC] rounded-xl border border-[#E5EAF1] text-center text-xs text-[#64748B]">
                      <Calendar className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                      <p className="font-semibold text-[#172B4D]">No Bookings Placed Yet</p>
                      <p className="mt-0.5">This customer has not placed any holiday package reservations yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerDetails.bookings.map((booking) => {
                        const statusColors: Record<string, string> = {
                          confirmed: "bg-[#E8F8F0] text-[#16A36A] border-[#C6F0DC]",
                          completed: "bg-[#EAF6FC] text-[#082B50] border-[#DCEAF3]",
                          pending: "bg-[#FFF4EE] text-[#E99A24] border-[#FCD9A5]",
                          cancelled: "bg-[#FEECEC] text-[#DC4444] border-[#F8B4B4]",
                        };

                        const badgeClass =
                          statusColors[booking.status] || "bg-slate-100 text-slate-700 border-slate-200";

                        return (
                          <div
                            key={booking.id}
                            className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#F04B16]/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {booking.tour?.cover_image ? (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                  <Image
                                    src={booking.tour.cover_image}
                                    alt={booking.tour.name || "Tour"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-[#EAF6FC] flex items-center justify-center text-[#082B50] flex-shrink-0">
                                  <MapPin className="w-5 h-5" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-[#082B50] truncate">
                                  {booking.tour?.name || "Domestic Holiday Package"}
                                </h5>
                                <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#94A3B8]" />
                                    <span>Travel: {formatDate(booking.travel_date)}</span>
                                  </span>
                                  <span>•</span>
                                  <span>{booking.travellers_count} {booking.travellers_count === 1 ? "Traveller" : "Travellers"}</span>
                                </div>
                                {booking.special_requests && (
                                  <p className="text-[10px] text-slate-500 italic mt-1 truncate">
                                    Note: {booking.special_requests}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                              <span className="text-xs font-bold text-[#082B50]">
                                {formatCurrency(Number(booking.total_price) || 0)}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}
                              >
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Role Management */}
                <div className="pt-4 border-t border-[#E5EAF1] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#082B50] block">Account Access Role</span>
                    <span className="text-[#64748B] text-[11px]">Adjust user permissions between customer and administrator</span>
                  </div>
                  <select
                    value={customerDetails.role}
                    disabled={updatingId === customerDetails.id}
                    onChange={(e) => handleUpdateRole(customerDetails.id, e.target.value)}
                    className="px-3 py-1.5 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-semibold text-[#172B4D] cursor-pointer hover:bg-white focus:outline-hidden"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
