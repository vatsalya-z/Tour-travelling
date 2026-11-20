import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "navy" | "orange" | "success" | "warning" | "default";
  comparison?: {
    label: string;
    positive?: boolean;
  };
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  comparison,
}: StatCardProps) {
  const variantStyles = {
    navy: {
      iconBg: "bg-[#082B50]/10 text-[#082B50]",
    },
    orange: {
      iconBg: "bg-[#FFF4EE] text-[#F04B16]",
    },
    success: {
      iconBg: "bg-[#EBF7F0] text-[#16A36A]",
    },
    warning: {
      iconBg: "bg-[#FEF6E9] text-[#E99A24]",
    },
    default: {
      iconBg: "bg-[#F5F8FC] text-[#64748B]",
    },
  }[variant];

  return (
    <div className="bg-white rounded-xl p-5 border border-[#E5EAF1] shadow-xs hover:border-[#CBD5E1] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[#64748B] tracking-normal">
          {title}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${variantStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-bold text-[#172B4D] tracking-tight font-sans">
          {value}
        </h3>
        {comparison && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              comparison.positive
                ? "bg-[#EBF7F0] text-[#16A36A]"
                : "bg-[#FEECEC] text-[#DC4444]"
            }`}
          >
            {comparison.label}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[#64748B] mt-1.5 font-normal">{subtitle}</p>
      )}
    </div>
  );
}
