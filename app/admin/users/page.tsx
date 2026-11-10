"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/utils";
import { Profile, UserRole } from "@/types/user";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        setUsers(data as Profile[]);
      }
    } catch (err) {
      console.warn("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (!isConfigured) return;
    setUpdatingId(userId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (!error) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.mobile_number || "").includes(searchQuery);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082B50] font-display">
            Customers & User Accounts
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage customer accounts, roles, and administrative access privileges.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#E5EAF1] hover:bg-[#F5F8FC] text-xs font-medium text-[#172B4D] cursor-pointer self-start sm:self-auto"
          title="Refresh Users"
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
            placeholder="Search by user name, email, or mobile..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-[#172B4D] placeholder-[#94A3B8] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] focus:bg-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="user">Users Only</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#64748B]">
            <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
            Loading accounts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#172B4D]">No Users Found</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              Registered customers and administrator profiles will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5EAF1] text-[#64748B] font-medium">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF1]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#082B50] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {u.full_name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-[#172B4D]">{u.full_name || "Unnamed User"}</p>
                          <p className="text-[11px] text-[#64748B]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-[#64748B]">
                      {u.mobile_number ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#94A3B8]" />
                          <span>{u.mobile_number}</span>
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF4EE] text-[#F04B16]">
                          <Shield className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F8FC] border border-[#E5EAF1] text-[#082B50]">
                          <User className="w-3 h-3" />
                          <span className="capitalize">{u.role}</span>
                        </span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#64748B]">
                      {formatDate(u.created_at)}
                    </td>

                    {/* Change Role */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 bg-[#F5F8FC] border border-[#E5EAF1] rounded-lg text-xs font-medium text-[#172B4D] cursor-pointer hover:bg-white"
                      >
                        <option value="user">User</option>
                        <option value="customer">Customer</option>
                        <option value="admin">Administrator</option>
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
