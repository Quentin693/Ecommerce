"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Car,
  LogOut,
  User,
  Clock,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { reservationsApi, Reservation } from "@/lib/api";
import { ReservationStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/LoadingSkeleton";

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "r1",
    carId: "1",
    car: {
      id: "1",
      name: "Ferrari 488 GTB",
      brand: "Ferrari",
      pricePerDay: 1500,
      category: "supercar",
      imageUrl:
        "/cars/ferrari-488.jpg",
      available: true,
    },
    userId: "u1",
    startDate: "2026-10-15",
    endDate: "2026-10-17",
    totalPrice: 3000,
    status: "confirmed",
    createdAt: "2026-10-01",
  },
  {
    id: "r2",
    carId: "3",
    car: {
      id: "3",
      name: "Bentley Continental GT",
      brand: "Bentley",
      pricePerDay: 1200,
      category: "luxury",
      imageUrl:
        "/cars/bentley-continental.jpg",
      available: true,
    },
    userId: "u1",
    startDate: "2026-11-01",
    endDate: "2026-11-03",
    totalPrice: 2400,
    status: "pending",
    createdAt: "2026-10-05",
  },
];

function rentalDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Number.isFinite(days) && days > 0 ? days : 0;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const { data: reservationsData, isLoading: resLoading, isError } = useQuery({
    queryKey: ["reservations", "my"],
    queryFn: () => reservationsApi.getMyReservations(),
    enabled: isAuthenticated,
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations", "my"] });
    },
  });

  const reservations =
    isError || !reservationsData?.data
      ? MOCK_RESERVATIONS
      : reservationsData.data;

  const activeReservations = reservations.filter((item) => item.status !== "cancelled");
  const statCards = [
    { icon: CalendarDays, label: "Réservations totales", value: String(reservations.length) },
    {
      icon: Car,
      label: "Véhicules loués",
      value: String(new Set(activeReservations.map((item) => item.carId)).size),
    },
    {
      icon: Clock,
      label: "Jours de location",
      value: String(
        activeReservations.reduce((total, item) => total + rentalDays(item.startDate, item.endDate), 0)
      ),
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-28 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <span className="text-[#c9a84c] text-sm font-medium uppercase tracking-widest">
              Espace personnel
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">
              Bonjour, {user?.firstName} 👋
            </h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="secondary" size="sm">
                  Back-office
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="luxury-card rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-[#c9a84c]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-serif">
                  {stat.value}
                </p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reservations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reservations list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-xl font-serif">
                Mes réservations
              </h2>
              <Link href="/cars">
                <Button variant="secondary" size="sm">
                  <Car className="mr-2 h-4 w-4" />
                  Nouvelle réservation
                </Button>
              </Link>
            </div>

            {resLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            ) : reservations.length === 0 ? (
              <div className="luxury-card rounded-xl p-10 text-center">
                <CalendarDays className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Vous n&apos;avez pas encore de réservations
                </p>
                <Link href="/cars">
                  <Button variant="primary" size="sm">
                    Explorer la flotte
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation, i) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="luxury-card rounded-xl overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Car image */}
                      {reservation.car && (
                        <div className="relative h-36 sm:h-auto sm:w-48 shrink-0 bg-[#111111]">
                          <Image
                            src={reservation.car.imageUrl}
                            alt={reservation.car.name}
                            fill
                            className="object-cover"
                            sizes="192px"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="text-[#c9a84c] text-xs font-medium uppercase tracking-wider mb-1">
                              {reservation.car?.brand}
                            </p>
                            <h3 className="text-white font-semibold font-serif">
                              {reservation.car?.name || `Voiture #${reservation.carId}`}
                            </h3>
                          </div>
                          <ReservationStatusBadge status={reservation.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="h-3.5 w-3.5 text-[#c9a84c]" />
                            <span className="text-gray-400">
                              {format(
                                new Date(reservation.startDate),
                                "d MMM yyyy",
                                { locale: fr }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-gray-400">
                              {format(
                                new Date(reservation.endDate),
                                "d MMM yyyy",
                                { locale: fr }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#c9a84c] font-bold text-lg">
                            {reservation.totalPrice.toLocaleString("fr-FR")}€
                          </span>
                          {reservation.status === "pending" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => cancelMutation.mutate(reservation.id)}
                              isLoading={cancelMutation.isPending}
                            >
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Profile sidebar */}
          <div>
            <h2 className="text-white font-semibold text-xl font-serif mb-6">
              Mon profil
            </h2>
            <div className="luxury-card rounded-xl p-5">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[#2a2a2a]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#d4af37] flex items-center justify-center">
                  <span className="text-black font-bold text-xl">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-[#c9a84c]" />
                  <div>
                    <p className="text-gray-500 text-xs">Nom complet</p>
                    <p className="text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="h-4 w-4 text-[#c9a84c]" />
                  <div>
                    <p className="text-gray-500 text-xs">Membre depuis</p>
                    <p className="text-white">
                      {format(new Date(), "MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#2a2a2a]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
