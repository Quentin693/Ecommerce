import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "success" | "warning" | "danger" | "info" | "default";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    gold: "bg-[#c9a84c]/20 text-[#f0c040] border border-[#c9a84c]/30",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    default: "bg-white/10 text-gray-300 border border-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ReservationStatusBadge({
  status,
}: {
  status: "pending" | "confirmed" | "cancelled" | "completed";
}) {
  const config = {
    pending: { label: "En attente", variant: "warning" as const },
    confirmed: { label: "Confirmée", variant: "success" as const },
    cancelled: { label: "Annulée", variant: "danger" as const },
    completed: { label: "Terminée", variant: "info" as const },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    supercar: "Supercar",
    luxury: "Luxe",
    sport: "Sport",
    "ultra-luxury": "Ultra Luxe",
  };
  return <Badge variant="gold">{labels[category] || category}</Badge>;
}
