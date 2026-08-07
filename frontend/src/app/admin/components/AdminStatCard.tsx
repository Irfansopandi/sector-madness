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
    if (str.length > 15) return "text-sm md:text-base lg:text-lg";
    if (str.length > 11) return "text-base md:text-lg lg:text-[22px]";
    return "text-xl md:text-2xl lg:text-[26px]";
  };

  return (
    <div
      style={{
        paddingTop: "32px",
        paddingBottom: "32px",
        paddingLeft: "28px",
        paddingRight: "28px",
      }}
      className={`border rounded-[10px] hover:border-[#B6A47E] transition-all duration-200 group shadow-sm flex items-center gap-5 w-full min-w-0 ${
        isDarkMode
          ? "bg-[#18181C] border-white/10"
          : "bg-white border-[#D1D5DB]"
      }`}
    >
      <div
        style={{ width: "48px", height: "48px" }}
        className="flex items-center justify-center bg-[#B6A47E]/10 border border-[#B6A47E]/25 text-[#B6A47E] rounded-[8px] shrink-0 group-hover:bg-[#B6A47E] group-hover:text-[#0A0A0A] transition-all duration-200 [&_svg]:w-6 [&_svg]:h-6"
      >
        {renderIcon()}
      </div>

      <div className="flex flex-col justify-center text-left min-w-0 flex-1 my-auto overflow-hidden">
        <span
          className={`font-mono uppercase font-semibold block truncate text-[10px] md:text-[11px] tracking-[0.2em] mb-1.5 leading-tight ${
            isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"
          }`}
          title={label}
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
          }}
          className={`font-bold font-mono tracking-tight whitespace-nowrap truncate mb-1 leading-tight ${getValueFontSize()} ${
            isDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
          }`}
          title={String(value)}
        >
          {value}
        </div>
        {subtext && (
          <p
            className={`font-medium tracking-wide truncate text-[11px] leading-tight mt-0.5 ${
              isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
            }`}
            title={subtext}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
