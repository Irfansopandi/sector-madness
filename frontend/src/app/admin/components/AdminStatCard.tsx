"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon | React.ReactNode;
  accentColor?: string;
  isDarkMode?: boolean;
}

export default function AdminStatCard({
  label,
  value,
  subtext,
  icon: Icon,
  accentColor = "#0A0A0A",
  isDarkMode = true,
}: AdminStatCardProps) {
  const renderIcon = () => {
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (Icon) {
      const Component = Icon as React.ComponentType<{ className?: string }>;
      return <Component className="w-6 h-6 stroke-[1.75]" />;
    }
    return null;
  };

  const getValueFontSize = () => {
    const str = String(value);
    if (str.length > 15) return "text-base sm:text-lg";
    if (str.length > 11) return "text-lg sm:text-xl";
    return "text-xl sm:text-2xl";
  };

  return (
    <div
      style={{ padding: "24px 20px" }}
      className={`border rounded-[6px] hover:border-[#B6A47E] transition-all duration-200 group shadow-sm flex items-center gap-4 w-full ${
        isDarkMode
          ? "bg-[#18181C] border-white/10"
          : "bg-white border-[#D1D5DB]"
      }`}
    >
      <div
        style={{ width: "48px", height: "48px" }}
        className="flex items-center justify-center bg-[#B6A47E]/10 border border-[#B6A47E]/25 text-[#B6A47E] rounded-[4px] shrink-0 group-hover:bg-[#B6A47E] group-hover:text-[#0A0A0A] transition-all duration-200"
      >
        {renderIcon()}
      </div>

      <div className="flex flex-col justify-center text-left min-w-0 flex-1 my-auto">
        <span
          style={{ fontSize: "10px", letterSpacing: "0.2em", marginBottom: "4px", lineHeight: "1.2" }}
          className={`font-mono uppercase font-semibold block ${
            isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"
          }`}
        >
          {label}
        </span>
        <div
          style={{
            color: isDarkMode
              ? accentColor === "#0A0A0A"
                ? "#F5F5F5"
                : accentColor
              : accentColor === "#0A0A0A"
              ? "#0A0A0A"
              : accentColor,
            marginBottom: "4px",
            lineHeight: "1.2",
          }}
          className={`font-bold font-mono tracking-tight whitespace-nowrap overflow-visible ${getValueFontSize()} ${
            isDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
          }`}
        >
          {value}
        </div>
        {subtext && (
          <p
            style={{ fontSize: "11px", lineHeight: "1.2" }}
            className={`font-medium tracking-wide truncate ${
              isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
            }`}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

