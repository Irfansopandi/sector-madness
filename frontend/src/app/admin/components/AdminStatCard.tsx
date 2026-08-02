"use client";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  accentColor?: string;
}

export default function AdminStatCard({
  label,
  value,
  subtext,
  icon = "📈",
  accentColor = "#0A0A0A",
}: AdminStatCardProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] p-6 flex flex-col justify-between hover:border-[#0A0A0A] transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#777777] font-semibold">
          {label}
        </span>
        <span className="text-xl">{icon}</span>
      </div>

      <div>
        <div
          style={{ color: accentColor }}
          className="text-2xl md:text-3xl font-bold font-mono tracking-tight mb-1"
        >
          {value}
        </div>
        {subtext && (
          <p className="text-[11px] text-[#888888] font-medium tracking-wide">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
