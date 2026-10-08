"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CarCard from "@/components/ui/CarCard";
import { CarGridSkeleton } from "@/components/ui/LoadingSkeleton";
import Button from "@/components/ui/Button";
import { carsApi, type Car } from "@/lib/api";
import { mockCars } from "@/lib/mock-cars";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "Toutes" },
  { value: "supercar", label: "Supercar" },
  { value: "luxury", label: "Luxe" },
  { value: "sport", label: "Sport" },
  { value: "ultra-luxury", label: "Ultra Luxe" },
];

const TRANSMISSIONS = [
  { value: "", label: "Toutes" },
  { value: "automatic", label: "Automatique" },
  { value: "manual", label: "Manuelle" },
];

function matchesSearch(car: Car, search: string) {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  return [car.name, car.brand, car.model]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(q));
}

function matchesTransmission(car: Car, transmission: string) {
  if (!transmission) return true;
  if (car.transmission === "automatic" || car.transmission === "manual") {
    return car.transmission === transmission;
  }
  const value = (car.specs?.transmission ?? "").toLowerCase();
  if (!value) return true;
  if (transmission === "automatic") return value.includes("auto");
  if (transmission === "manual") return value.includes("manu");
  return true;
}

export default function CarsPage() {
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    transmission: "",
    search: "",
  });
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cars", filters, page],
    queryFn: () =>
      carsApi.getAll({
        category: filters.category || undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        transmission: filters.transmission || undefined,
        page,
      }),
    retry: false,
  });

  const carsFromApi = data?.data?.data;
  const totalFromApi = data?.data?.total;
  const usingMock = isError;

  const pool = usingMock ? mockCars : carsFromApi ?? [];
  const cars = pool.filter((car) => {
    const price = Number(car.pricePerDay);
    if (filters.category && car.category !== filters.category) return false;
    if (filters.minPrice && price < parseInt(filters.minPrice, 10)) return false;
    if (filters.maxPrice && price > parseInt(filters.maxPrice, 10)) return false;
    if (!matchesSearch(car, filters.search)) return false;
    if (!matchesTransmission(car, filters.transmission)) return false;
    return true;
  });

  const total = usingMock ? cars.length : totalFromApi || cars.length;
  const shownCount = filters.search ? cars.length : total;
  const totalPages = Math.ceil(total / 9);

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      transmission: "",
      search: "",
    });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const fieldClass =
    "h-11 bg-[#141414] border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c9a84c]/60";

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[#c9a84c] text-xs font-medium uppercase tracking-[0.22em]">
              Notre sélection
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3 mb-3">
              Notre Flotte
            </h1>
            <p className="text-gray-500">
              {isLoading
                ? "Chargement de la flotte…"
                : shownCount > 0
                  ? `${shownCount} véhicule${shownCount > 1 ? "s" : ""} disponible${shownCount > 1 ? "s" : ""}`
                  : "Aucun véhicule correspondant"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="sticky top-20 z-30 bg-[#0c0c0c]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, search: e.target.value }));
                  setPage(1);
                }}
                placeholder="Rechercher une marque ou un modèle"
                className={cn(fieldClass, "w-full pl-10 pr-4")}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-gray-500 shrink-0">
                Prix / jour
              </span>
              <input
                type="number"
                min={0}
                value={filters.minPrice}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, minPrice: e.target.value }));
                  setPage(1);
                }}
                placeholder="Min"
                className={cn(fieldClass, "w-[5.5rem] px-3")}
              />
              <span className="text-gray-600">—</span>
              <input
                type="number"
                min={0}
                value={filters.maxPrice}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, maxPrice: e.target.value }));
                  setPage(1);
                }}
                placeholder="Max"
                className={cn(fieldClass, "w-[5.5rem] px-3")}
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-1.5 h-11 px-3 text-sm text-[#c9a84c] hover:text-[#f0c040] shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = filters.category === cat.value;
                return (
                  <button
                    key={cat.value || "all"}
                    onClick={() => {
                      setFilters((f) => ({ ...f, category: cat.value }));
                      setPage(1);
                    }}
                    className={cn(
                      "h-9 px-3.5 rounded-full text-sm border transition-colors",
                      active
                        ? "bg-[#c9a84c] text-black border-[#c9a84c]"
                        : "text-gray-400 border-white/10 hover:text-white hover:border-white/25"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 max-w-full">
              <span className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mr-1">
                Transmission
              </span>
              {TRANSMISSIONS.map((item) => {
                const active = filters.transmission === item.value;
                return (
                  <button
                    key={item.value || "all-transmission"}
                    onClick={() => {
                      setFilters((f) => ({ ...f, transmission: item.value }));
                      setPage(1);
                    }}
                    className={cn(
                      "h-9 px-3.5 rounded-full text-sm border transition-colors",
                      active
                        ? "bg-[#c9a84c] text-black border-[#c9a84c]"
                        : "text-gray-400 border-white/10 hover:text-white hover:border-white/25"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {isLoading ? (
          <CarGridSkeleton count={9} />
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Aucun véhicule trouvé</p>
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                  p === page
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:border-[#c9a84c]/50"
                )}
              >
                {p}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
