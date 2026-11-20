"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Calendar,
  MapPin,
  Compass,
  UserCheck,
  PhoneCall,
  Save,
  Check,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import StatCard from "@/components/admin/StatCard";
import { TourLead, LeadStatus } from "@/types/lead";
import { formatCurrency, formatDate } from "@/lib/utils";

interface StatsData {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  followUpLeads: number;
  convertedLeads: number;
}

interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role?: string;
}

const ALL_STATUSES: { id: LeadStatus | "all"; label: string }[] = [
  { id: "all", label: "All Statuses" },
  { id: "NEW", label: "New Lead" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "FOLLOW_UP", label: "Follow-up Required" },
  { id: "INTERESTED", label: "Interested" },
  { id: "CONVERTED", label: "Converted" },
  { id: "CLOSED", label: "Closed" },
  { id: "NOT_INTERESTED", label: "Not Interested" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<TourLead[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    followUpLeads: 0,
    convertedLeads: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const itemsPerPage = 20;

  // Selected Lead for Details Drawer
  const [selectedLead, setSelectedLead] = useState<TourLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editStatus, setEditStatus] = useState<LeadStatus>("NEW");
  const [editAssignedTo, setEditAssignedTo] = useState<string>("");
  const [adminUsers, setAdminUsers] = useState<AdminProfile[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Refresh stats helper
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.warn("Could not load leads stats:", err);
    }
  }, []);

  // Fetch initial stats and admin list
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const [statsRes, adminsRes] = await Promise.all([
          fetch("/api/admin/leads/stats"),
          fetch("/api/users?role=admin"),
        ]);
        const statsJson = await statsRes.json();
        const adminsJson = await adminsRes.json();
        if (active) {
          if (statsJson.success && statsJson.data) setStats(statsJson.data);
          if (adminsJson.success && Array.isArray(adminsJson.data)) setAdminUsers(adminsJson.data);
        }
      } catch (err) {
        console.warn("Init error:", err);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  // Manual refresh helper
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (destinationFilter && destinationFilter !== "all") params.set("destination", destinationFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("page", String(currentPage));
      params.set("limit", String(itemsPerPage));

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setLeads(json.data);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalCount(json.pagination.total || 0);
        }
      } else {
        throw new Error(json.error || "Failed to load tour leads.");
      }
    } catch (err: unknown) {
      console.error("Error loading leads:", err);
      setError(err instanceof Error ? err.message : "Failed to load tour leads.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, destinationFilter, startDate, endDate, currentPage]);

  // Synchronize leads with query filters
  useEffect(() => {
    let active = true;
    const runFetch = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
        if (destinationFilter && destinationFilter !== "all") params.set("destination", destinationFilter);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        params.set("page", String(currentPage));
        params.set("limit", String(itemsPerPage));

        const res = await fetch(`/api/admin/leads?${params.toString()}`);
        const json = await res.json();

        if (active) {
          if (json.success && Array.isArray(json.data)) {
            setLeads(json.data);
            if (json.pagination) {
              setTotalPages(json.pagination.totalPages || 1);
              setTotalCount(json.pagination.total || 0);
            }
          } else {
            setError(json.error || "Failed to load tour leads.");
          }
          setLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load tour leads.");
          setLoading(false);
        }
      }
    };

    runFetch();
    return () => {
      active = false;
    };
  }, [searchQuery, statusFilter, destinationFilter, startDate, endDate, currentPage]);

  // Open Details Drawer
  const handleOpenDetails = (lead: TourLead) => {
    setSelectedLead(lead);
    setEditStatus(lead.lead_status);
    setNoteText(lead.admin_notes || "");
    setEditAssignedTo(lead.assigned_to || "");
    setActionSuccessMessage(null);
    setDrawerOpen(true);
  };

  // Quick Status Update from Table Row
  const handleQuickStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, lead_status: newStatus } : l))
        );
        fetchStats();
      }
    } catch (err) {
      console.error("Quick status update failed:", err);
    }
  };

  // Save changes inside Lead Drawer (Status, Notes, Assignee)
  const handleSaveDrawerChanges = async () => {
    if (!selectedLead) return;
    setSavingLead(true);
    setActionSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_status: editStatus,
          admin_notes: noteText,
          assigned_to: editAssignedTo || null,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const updatedLead: TourLead = json.data;
        setSelectedLead(updatedLead);
        setLeads((prev) =>
          prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
        );
        setActionSuccessMessage("Lead updated successfully!");
        fetchStats();
        setTimeout(() => setActionSuccessMessage(null), 3000);
      } else {
        throw new Error(json.error || "Failed to update lead.");
      }
    } catch (err: unknown) {
      console.error("Error saving lead changes:", err);
      alert(err instanceof Error ? err.message : "Failed to update lead.");
    } finally {
      setSavingLead(false);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF6E9] text-[#E99A24] border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E99A24]" />
            New Lead
          </span>
        );
      case "CONTACTED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF6FC] text-[#082B50] border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#082B50]" />
            Contacted
          </span>
        );
      case "FOLLOW_UP":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF4EE] text-[#F04B16] border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F04B16]" />
            Follow-up
          </span>
        );
      case "INTERESTED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            Interested
          </span>
        );
      case "CONVERTED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF7F0] text-[#16A36A] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
            Converted
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Closed
          </span>
        );
      case "NOT_INTERESTED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEECEC] text-[#DC4444] border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC4444]" />
            Not Interested
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. Page Header & Actions                                      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
            Lead Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time multi-step customer tour enquiries, travel preferences, and lead status pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              fetchStats();
              fetchLeads();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-xs font-semibold text-[#172B4D] cursor-pointer shadow-xs transition-colors"
            title="Refresh Leads Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Summary Stat Cards                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          variant="navy"
          subtitle="All inquiries"
        />
        <StatCard
          title="New Leads"
          value={stats.newLeads}
          icon={Sparkles}
          variant="warning"
          subtitle="Awaiting first contact"
        />
        <StatCard
          title="Contacted"
          value={stats.contactedLeads}
          icon={PhoneCall}
          variant="orange"
          subtitle="In communication"
        />
        <StatCard
          title="Follow-up Required"
          value={stats.followUpLeads}
          icon={CalendarClock}
          variant="default"
          subtitle="Pending action"
        />
        <StatCard
          title="Converted"
          value={stats.convertedLeads}
          icon={CheckCircle2}
          variant="success"
          subtitle="Booked clients"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Search and Filters Bar                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-xl border border-[#E5EAF1] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Multi-field search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer, phone, email, package..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] font-medium focus:bg-white focus:outline-hidden cursor-pointer"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] font-medium focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] font-medium focus:bg-white focus:outline-hidden"
            />
            {(startDate || endDate || searchQuery || statusFilter !== "all" || destinationFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDestinationFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Leads Listing Table                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#64748B]">
            <RefreshCw className="w-6 h-6 text-[#F15A24] animate-spin mx-auto mb-2" />
            Loading leads from database...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-bold text-red-600">{error}</p>
            <button
              onClick={fetchLeads}
              className="mt-3 px-4 py-1.5 rounded-lg bg-[#082B50] text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#172B4D]">No Leads Found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No leads matched your filter criteria. Try clearing search or filters."
                : "Customer enquiries submitted via package forms will appear here in real-time."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Lead ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Package & Destination</th>
                  <th className="py-3.5 px-4">Travel Date</th>
                  <th className="py-3.5 px-4">Travellers</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* Lead ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                      #{lead.id.slice(0, 8)}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-[#172B4D]">{lead.customer_name}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                          {lead.customer_id ? "Registered User" : "Guest Lead"}
                        </span>
                      </div>
                    </td>

                    {/* Contact (Phone & Email) */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <a
                          href={`tel:${lead.country_code}${lead.customer_phone}`}
                          className="flex items-center gap-1.5 font-medium text-[#082B50] hover:text-[#F15A24] transition-colors"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>
                            {lead.country_code} {lead.customer_phone}
                          </span>
                        </a>
                        <a
                          href={`mailto:${lead.customer_email}`}
                          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-[#082B50] transition-colors"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{lead.customer_email}</span>
                        </a>
                      </div>
                    </td>

                    {/* Package & Destination */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-[#172B4D] line-clamp-1">
                          {lead.tour_name || lead.destination_name || "Custom Domestic Tour"}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#F15A24]" />
                          <span>{lead.destination_name || "India"}</span>
                        </p>
                      </div>
                    </td>

                    {/* Travel Date */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {lead.preferred_travel_date
                        ? formatDate(lead.preferred_travel_date)
                        : "Flexible"}
                    </td>

                    {/* Travellers */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#172B4D]">{lead.travellers_count}</span>
                      <span className="text-slate-400 text-[11px] ml-1">pax</span>
                    </td>

                    {/* Booking Timeline */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {lead.booking_timeline || "Not specified"}
                      </span>
                    </td>

                    {/* Lead Status with quick dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {renderStatusBadge(lead.lead_status)}
                        <select
                          value={lead.lead_status}
                          onChange={(e) =>
                            handleQuickStatusChange(lead.id, e.target.value as LeadStatus)
                          }
                          aria-label={`Change status for lead ${lead.id.slice(0, 8)}`}
                          className="opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity w-5 h-5 bg-transparent border-0 cursor-pointer"
                          title="Quick update status"
                        >
                          {ALL_STATUSES.filter((s) => s.id !== "all").map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action: View Details */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(lead)}
                        className="px-3 py-1.5 rounded-lg bg-[#082B50] hover:bg-[#F15A24] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Row */}
        {!loading && leads.length > 0 && (
          <div className="p-4 bg-[#F8FAFC] border-t border-[#E5EAF1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <div>
              Showing {leads.length} of {totalCount} total lead enquiries
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 text-xs font-bold text-[#082B50]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Lead Details Drawer / Modal                                */}
      {/* ------------------------------------------------------------- */}
      {drawerOpen && selectedLead && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Lead Details Drawer"
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E5EAF1] bg-[#082B50] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#F15A24] block">
                  Lead Details #{selectedLead.id.slice(0, 8)}
                </span>
                <h3 className="text-lg font-black text-white">{selectedLead.customer_name}</h3>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Success notification banner */}
            {actionSuccessMessage && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccessMessage}</span>
              </div>
            )}

            {/* Drawer Body - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-[#172B4D]">
              {/* SECTION A: Customer Details */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5EAF1] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="font-extrabold text-[#082B50] text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#F15A24]" />
                    <span>Customer Details</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {selectedLead.customer_id ? "Registered Account" : "Guest Enquiry"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                    <p className="font-bold text-slate-800 text-sm">{selectedLead.customer_name}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Phone (Call / WhatsApp)</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={`tel:${selectedLead.country_code}${selectedLead.customer_phone}`}
                        className="font-bold text-[#082B50] hover:text-[#F15A24] flex items-center gap-1 text-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {selectedLead.country_code} {selectedLead.customer_phone}
                        </span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedLead.country_code.replace("+", "")}${selectedLead.customer_phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedLead.customer_name)}%2C%20regarding%20your%20holiday%20enquiry%20with%20TourTripHolidays...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:scale-110 transition-transform"
                        title="Chat on WhatsApp"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                    <p className="mt-0.5">
                      <a
                        href={`mailto:${selectedLead.customer_email}?subject=TourTripHolidays%20Enquiry%20Follow-up`}
                        className="font-semibold text-[#082B50] hover:underline flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedLead.customer_email}</span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION B: Package Details */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5EAF1] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="font-extrabold text-[#082B50] text-sm flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#F15A24]" />
                    <span>Package Details</span>
                  </h4>
                  {selectedLead.package_url && (
                    <a
                      href={selectedLead.package_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#F15A24] hover:underline flex items-center gap-1"
                    >
                      <span>View Package</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Package Name</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.tour_name || selectedLead.destination_name || "Custom Domestic Tour"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Destination</span>
                    <p className="font-bold text-[#082B50]">
                      {selectedLead.destination_name || "India"}
                    </p>
                  </div>

                  {selectedLead.package_price ? (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Package Price</span>
                      <p className="font-black text-[#082B50] text-sm">
                        {formatCurrency(selectedLead.package_price)}
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Source Page / CTA</span>
                    <p className="font-medium text-slate-600">
                      {selectedLead.source_page || "Website"} ({selectedLead.source_cta || "Form"})
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION C: Travel Preferences (Collected via the Multi-step Form) */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5EAF1] space-y-3">
                <div className="border-b border-slate-200/80 pb-2">
                  <h4 className="font-extrabold text-[#082B50] text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#F15A24]" />
                    <span>Travel Preferences</span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred Date</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.preferred_travel_date
                        ? formatDate(selectedLead.preferred_travel_date)
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Travellers Count</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.travellers_count} Persons
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Travelling With</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.travelling_with || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Booking Urgency</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.booking_timeline || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date Flexibility</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.travel_date_flexibility || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Flight Assistance</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.flight_assistance || "Not specified"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred Contact Time</span>
                    <p className="font-bold text-slate-800">
                      {selectedLead.preferred_contact_time || "Anytime"}
                    </p>
                  </div>

                  {selectedLead.message && (
                    <div className="col-span-2 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Customer Message
                      </span>
                      <p className="text-slate-700 italic">{selectedLead.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION D: Lead Management & Internal Notes */}
              <div className="bg-white rounded-xl p-4 border-2 border-[#082B50]/20 space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-[#082B50] text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#F15A24]" />
                    <span>Lead Management & Pipeline</span>
                  </h4>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-[#082B50] mb-1">
                    Update Lead Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 text-xs font-bold text-[#172B4D] bg-[#F5F8FC] border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20"
                  >
                    {ALL_STATUSES.filter((s) => s.id !== "all").map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Admin Assignment */}
                <div>
                  <label className="block text-[11px] font-bold text-[#082B50] mb-1">
                    Assign to Destination Expert / Admin
                  </label>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold text-[#172B4D] bg-[#F5F8FC] border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20"
                  >
                    <option value="">-- Unassigned --</option>
                    {adminUsers.map((adm) => (
                      <option key={adm.id} value={adm.id}>
                        {adm.full_name || adm.email} ({adm.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-[#082B50] mb-1">
                    Internal Admin Notes (Private)
                  </label>
                  <textarea
                    rows={4}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter private notes regarding customer budget, customized itinerary requests, call discussion summary..."
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-[#F5F8FC] border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50]/20 placeholder-slate-400"
                  />
                </div>

                {/* Timestamps */}
                <div className="pt-2 text-[10px] text-slate-400 space-y-0.5">
                  <p>Submitted: {new Date(selectedLead.created_at).toLocaleString()}</p>
                  <p>Last Updated: {new Date(selectedLead.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E5EAF1] bg-[#F8FAFC] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                disabled={savingLead}
                onClick={handleSaveDrawerChanges}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E52D27] hover:bg-[#c9221c] text-white text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingLead ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
