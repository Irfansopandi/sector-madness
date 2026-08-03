"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  compact?: boolean;
  onExpire?: () => void;
}

export default function CountdownTimer({ expiresAt, compact = false, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial.isExpired) {
      onExpire?.();
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft.isExpired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 text-white py-1 px-2 text-[9px] tracking-[0.1em] font-mono font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        <svg className="w-3 h-3 text-[#FF3B30] animate-pulse shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h7v8l10-12h-7V2z" />
        </svg>
        <span className="uppercase text-[8.5px] text-[#D1D1D1] tracking-[0.05em]">ENDS IN</span>
        <span className="text-white font-bold tracking-tight">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] py-3.5 px-4 flex items-center justify-between my-3">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white">FLASH SALE</span>
      </div>
      <div className="flex items-center gap-1.5 font-mono">
        <span className="text-[10px] text-[#888888] tracking-[0.1em] uppercase mr-1 hidden sm:inline">ENDS IN</span>
        {timeLeft.days > 0 && (
          <>
            <span className="bg-[#1A1A1A] text-white text-[11px] font-bold px-2 py-1 rounded-sm">
              {pad(timeLeft.days)}d
            </span>
            <span className="text-[#888888] text-xs font-bold">:</span>
          </>
        )}
        <span className="bg-[#1A1A1A] text-white text-[11px] font-bold px-2 py-1 rounded-sm">
          {pad(timeLeft.hours)}h
        </span>
        <span className="text-[#888888] text-xs font-bold">:</span>
        <span className="bg-[#1A1A1A] text-white text-[11px] font-bold px-2 py-1 rounded-sm">
          {pad(timeLeft.minutes)}m
        </span>
        <span className="text-[#888888] text-xs font-bold">:</span>
        <span className="bg-[#1A1A1A] text-[#FF3B30] text-[11px] font-bold px-2 py-1 rounded-sm animate-pulse">
          {pad(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
}
