"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Zap, Gauge } from "lucide-react";
import { Car as CarType } from "@/lib/api";

interface CarCardProps {
  car: CarType;
  index?: number;
  /** Taller image — used for hero/featured grids */
  large?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  supercar:       "Supercar",
  luxury:         "Grand Tourisme",
  sport:          "Sport",
  "ultra-luxury": "Ultra Luxe",
  suv:            "SUV",
  convertible:    "Cabriolet",
};

export default function CarCard({ car, index = 0, large = false }: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
      className="car-card-cinematic rounded-2xl group h-full"
    >
      <Link href={`/cars/${car.id}`} className="block relative h-full">
        {/* ── Image ── */}
        <div className={`relative overflow-hidden rounded-2xl ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
          <Image
            src={car.imageUrl}
            alt={car.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Dark gradient — stronger at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />

          {/* Unavailable overlay */}
          {!car.available && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-xl">
              <span className="text-white/50 text-xs font-light tracking-[0.25em] uppercase">
                Indisponible
              </span>
            </div>
          )}

          {/* ── Category tag — top left ── */}
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#c9a84c]/90">
              {CATEGORY_LABELS[car.category] ?? car.category}
            </span>
          </div>

          {/* ── Arrow icon — top right, slides in on hover ── */}
          <div
            className="absolute top-4 right-4 z-10
              opacity-0 translate-x-2 -translate-y-2
              group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0
              transition-all duration-300 ease-out"
          >
            <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center shadow-lg">
              <ArrowUpRight className="h-4 w-4 text-black" />
            </div>
          </div>

          {/* ── Bottom overlay — brand / name / price ── */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
            {/* Brand */}
            <p className="text-[#c9a84c]/70 text-[10px] uppercase tracking-[0.2em] font-medium mb-1">
              {car.brand}
            </p>

            {/* Name + Price on same row */}
            <div className="flex items-end justify-between gap-2">
              <h3 className="text-white font-serif text-xl font-semibold leading-tight">
                {car.model ?? car.name}
              </h3>
              <div className="text-right shrink-0">
                <p className="text-white text-2xl font-bold leading-none tabular-nums">
                  {car.pricePerDay.toLocaleString("fr-FR")}€
                </p>
                <p className="text-white/35 text-[9px] tracking-widest mt-0.5">/JOUR</p>
              </div>
            </div>

            {/* Specs bar — fades in on hover */}
            <div
              className="mt-3 flex items-center gap-4 text-[11px] text-gray-400
                overflow-hidden max-h-0 group-hover:max-h-10
                transition-all duration-400 ease-out"
            >
              {car.specs?.power && (
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-[#c9a84c]/60 shrink-0" />
                  {car.specs.power}
                </span>
              )}
              {car.specs?.acceleration && (
                <span className="flex items-center gap-1.5">
                  <Gauge className="h-3 w-3 text-[#c9a84c]/60 shrink-0" />
                  {car.specs.acceleration}
                </span>
              )}
              {car.year && (
                <span className="ml-auto text-[#c9a84c]/40 tracking-widest text-[10px]">
                  {car.year}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
