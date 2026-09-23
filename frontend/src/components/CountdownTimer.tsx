"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string;
  compact?: boolean;
  onExpire?: () => void;
  textColor?: "white" | "black";
}

export default function CountdownTimer({ expiresAt, compact = false, onExpire, textColor = "black" }: CountdownTimerProps) {
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
    const mainColor = textColor === "black" ? "text-[#0A0A0A]" : "text-[#FFFFFF]";
    const labelColor = textColor === "black" ? "text-[#555555]" : "text-[#8A8A8A]";

    return (
      <div className={`inline-flex items-center gap-1.5 ${mainColor} py-1 px-2 text-[9px] tracking-[0.1em] font-mono font-medium`}>
        <span className={`uppercase text-[8.5px] ${labelColor} tracking-[0.05em]`}>ENDS IN</span>
        <span className={`${mainColor} font-bold tracking-tight`}>
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
            <span className="text-white text-[11px] font-bold">
              {pad(timeLeft.days)}d
            </span>
            <span className="text-[#888888] text-xs font-bold">:</span>
          </>
        )}
        <span className="text-white text-[11px] font-bold">
          {pad(timeLeft.hours)}h
        </span>
        <span className="text-[#888888] text-xs font-bold">:</span>
        <span className="text-white text-[11px] font-bold">
          {pad(timeLeft.minutes)}m
        </span>
        <span className="text-[#888888] text-xs font-bold">:</span>
        <span className="text-white text-[11px] font-bold animate-pulse">
          {pad(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
}
