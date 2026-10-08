"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Gauge,
  Car,
  Users,
  Settings,
  Timer,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { differenceInDays, format, addDays } from "date-fns";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import { CategoryBadge } from "@/components/ui/Badge";
import { carsApi, cartApi } from "@/lib/api";
import { mockCars } from "@/lib/mock-cars";
import { useAuth } from "@/lib/auth";

export default function CarDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [activeImage, setActiveImage] = useState(0);

  const carId = params.id as string;
  const {
    data: carData,
    isError,
    isLoading: carLoading,
  } = useQuery({
    queryKey: ["car", carId],
    queryFn: () => carsApi.getById(carId),
    retry: false,
    enabled: !!carId,
  });

  // Ne jamais substituer mockCars[0] : son id ("1") n'est pas un UUID API.
  const apiCar = carData?.data;
  const mockCar = mockCars.find((c) => c.id === carId);
  const car = apiCar ?? mockCar ?? null;
  const canAddToCart = Boolean(apiCar?.id) && !isError;

  const images = car
    ? car.images?.length
      ? car.images
      : [car.imageUrl]
    : [];

  const days = Math.max(
    1,
    differenceInDays(new Date(endDate), new Date(startDate))
  );
  const totalPrice = car ? days * Number(car.pricePerDay) : 0;

  const cartMutation = useMutation({
    mutationFn: () => {
      if (!apiCar?.id) {
        throw new Error("Véhicule API introuvable");
      }
      return cartApi.addItem({
        carId: apiCar.id,
        startDate,
        endDate,
      });
    },
    onSuccess: () => {
      router.push("/cart");
    },
  });

  const handleReserve = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!canAddToCart) return;
    cartMutation.mutate();
  };

  const cartError =
    (cartMutation.error as { response?: { data?: { message?: string | string[] } } })
      ?.response?.data?.message;

  const specs = [
    { icon: Zap, label: "Puissance", value: car.specs?.power },
    { icon: Timer, label: "0-100 km/h", value: car.specs?.acceleration },
    { icon: Gauge, label: "Vitesse max", value: car.specs?.topSpeed },
    { icon: Car, label: "Moteur", value: car.specs?.engine },
    { icon: Settings, label: "Transmission", value: car.specs?.transmission },
    {
      icon: Users,
      label: "Places",
      value: car.specs?.seats ? `${car.specs.seats} places` : undefined,
    },
  ].filter((s) => s.value);

  if (carLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-28">
        <p className="text-center text-gray-500 py-20">Chargement du véhicule…</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-28">
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-400 mb-4">Véhicule introuvable.</p>
          <Button variant="secondary" size="sm" onClick={() => router.push("/cars")}>
            Retour à la flotte
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la flotte
        </button>

        {isError && (
          <p className="mb-6 text-amber-400/90 text-sm rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            L’API véhicules est indisponible. Affichage de démonstration uniquement :
            l’ajout au panier est désactivé.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Images + Info */}
          <div className="lg:col-span-2">
            {/* Main image */}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative h-80 md:h-[480px] rounded-2xl overflow-hidden bg-[#111111] border border-[#2a2a2a] mb-4"
            >
              <Image
                src={images[activeImage]}
                alt={car.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <CategoryBadge category={car.category} />
              </div>
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-[#c9a84c]"
                        : "border-[#2a2a2a] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${car.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Car info */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[#c9a84c] text-sm font-medium uppercase tracking-wider mb-1">
                    {car.brand}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                    {car.name}
                  </h1>
                  {car.year && (
                    <p className="text-gray-500 text-sm mt-1">{car.year}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#c9a84c]">
                    {car.pricePerDay.toLocaleString("fr-FR")}€
                  </p>
                  <p className="text-gray-500 text-sm">par jour</p>
                </div>
              </div>

              {car.description && (
                <p className="text-gray-400 leading-relaxed mt-4">
                  {car.description}
                </p>
              )}
            </div>

            {/* Specs grid */}
            {specs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-semibold text-lg mb-4 font-serif">
                  Caractéristiques techniques
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#c9a84c]/30 transition-colors"
                    >
                      <spec.icon className="h-4 w-4 text-[#c9a84c] mb-2" />
                      <p className="text-gray-500 text-xs mb-1">{spec.label}</p>
                      <p className="text-white text-sm font-medium">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div>
                <h2 className="text-white font-semibold text-lg mb-4 font-serif">
                  Équipements
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {car.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-gray-300 text-sm py-2 border-b border-[#1a1a1a]"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#c9a84c] shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Reservation panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="luxury-card rounded-2xl p-6 border border-[#2a2a2a]">
                <>
                    <div className="flex items-center gap-2 mb-6">
                      <CalendarDays className="h-5 w-5 text-[#c9a84c]" />
                      <h2 className="text-white font-semibold text-lg font-serif">
                        Réserver ce véhicule
                      </h2>
                    </div>

                    <div className="space-y-4 mb-6">
                      <DatePicker
                        label="Date de début"
                        value={startDate}
                        onChange={(val) => {
                          setStartDate(val);
                          if (val >= endDate) {
                            setEndDate(
                              format(
                                addDays(new Date(val), 1),
                                "yyyy-MM-dd"
                              )
                            );
                          }
                        }}
                        min={today}
                      />
                      <DatePicker
                        label="Date de fin"
                        value={endDate}
                        onChange={setEndDate}
                        min={format(
                          addDays(new Date(startDate), 1),
                          "yyyy-MM-dd"
                        )}
                      />
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {car.pricePerDay.toLocaleString("fr-FR")}€ × {days}{" "}
                          {days > 1 ? "jours" : "jour"}
                        </span>
                        <span className="text-white">
                          {(car.pricePerDay * days).toLocaleString("fr-FR")}€
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Livraison</span>
                        <span className="text-green-400 text-xs font-medium">
                          Incluse
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Assurance</span>
                        <span className="text-green-400 text-xs font-medium">
                          Incluse
                        </span>
                      </div>
                      <div className="pt-3 border-t border-[#2a2a2a] flex justify-between">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-[#c9a84c] font-bold text-xl">
                          {totalPrice.toLocaleString("fr-FR")}€
                        </span>
                      </div>
                    </div>

                    {cartMutation.isError && (
                      <p className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        {Array.isArray(cartError)
                          ? cartError.join(" ")
                          : typeof cartError === "string"
                            ? cartError.includes("already booked")
                              ? "Ce véhicule est déjà réservé sur ces dates."
                              : cartError.includes("UUID")
                                ? "Identifiant véhicule invalide. Revenez à la flotte et rouvrez la fiche."
                                : cartError
                            : "Impossible d’ajouter au panier. Réessayez."}
                      </p>
                    )}

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleReserve}
                      isLoading={cartMutation.isPending}
                      disabled={!car.available || !canAddToCart}
                    >
                      {!canAddToCart
                        ? "Panier indisponible"
                        : car.available
                          ? isAuthenticated
                            ? "Ajouter au panier"
                            : "Se connecter pour réserver"
                          : "Véhicule indisponible"}
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-gray-500 text-xs text-center mt-3">
                        Vous serez redirigé vers la page de connexion
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2 text-gray-600 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      Annulation gratuite jusqu&apos;à 48h avant
                    </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
