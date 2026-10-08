"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  error?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  className,
  error,
}: DatePickerProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9a84c] h-4 w-4 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className={cn(
            "w-full bg-[#1a1a1a] border rounded-lg pl-10 pr-4 py-3 text-white",
            "focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/50",
            "text-sm transition-all duration-200",
            "[color-scheme:dark]",
            error
              ? "border-red-500"
              : "border-[#2a2a2a] hover:border-[#c9a84c]/50"
          )}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
