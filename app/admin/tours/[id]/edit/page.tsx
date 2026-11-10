"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import TourForm from "@/components/admin/TourForm";
import { createClient, getAdminBearerToken } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Tour } from "@/types/tour";
import { Compass, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface EditTourPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTourPage({ params }: EditTourPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTour = async () => {
      if (!isSupabaseConfigured()) {
        setError("Supabase not configured in .env.local");
        setLoading(false);
        return;
      }

      try {
        const token = await getAdminBearerToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/tours/${resolvedParams.id}`, { headers });
        const json = await res.json();

        if (json.success && json.data) {
          setTour(json.data as unknown as Tour);
        } else {
          // Fallback to client query
          const supabase = createClient();
          const { data, error } = await supabase
            .from("tours")
            .select("*")
            .eq("id", resolvedParams.id)
            .single();

          if (error || !data) {
            setError(json.error || json.message || "Tour package not found in database.");
          } else {
            setTour(data as unknown as Tour);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tour");
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="py-24 text-center font-sans">
        <RefreshCw className="w-6 h-6 text-[#64748B] animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-[#172B4D]">Loading tour details...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="py-20 text-center max-w-md mx-auto font-sans">
        <Compass className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
        <h3 className="text-sm font-bold text-[#172B4D] mb-1 font-display">
          Tour Package Not Found
        </h3>
        <p className="text-xs text-[#64748B] mb-4">{error}</p>
        <Link
          href="/admin/tours"
          className="inline-flex items-center gap-1.5 bg-[#082B50] hover:bg-[#123F68] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tour Catalog</span>
        </Link>
      </div>
    );
  }

  return <TourForm initialData={tour} isEdit={true} />;
}
