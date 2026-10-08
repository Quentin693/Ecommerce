"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";
import { reservationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "d MMMM yyyy", { locale: fr });
}

export default function ConfirmationClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => reservationsApi.getById(bookingId),
    enabled: isAuthenticated && !!bookingId,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-28">
        <p className="text-center text-gray-500">Chargement…</p>
      </div>
    );
  }

  const booking = bookingQuery.data?.data;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl bg-[#111111] border border-white/6 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/40 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-[#c9a84c]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white">
            Réservation confirmée
          </h1>
          <p className="text-gray-400 mt-3">
            Paiement enregistré. Aucun e-mail n’est envoyé : cette page est votre
            confirmation.
          </p>

          {bookingQuery.isError && (
            <p className="mt-6 text-red-400 text-sm">
              Impossible de charger le détail. Retrouvez la réservation dans
              votre espace.
            </p>
          )}

          {booking && (
            <div className="mt-8 text-left space-y-3 rounded-xl bg-[#1a1a1a] border border-white/6 p-5">
              <p className="text-white font-medium">
                {booking.car?.name ?? "Véhicule"}
              </p>
              <p className="text-gray-400 text-sm">
                {formatDay(booking.startDate)} — {formatDay(booking.endDate)}
              </p>
              <p className="text-gray-400 text-sm">
                Statut :{" "}
                <span className="text-[#c9a84c]">{booking.status}</span>
              </p>
              <p className="text-[#c9a84c] font-serif text-2xl">
                {Number(booking.totalPrice).toLocaleString("fr-FR")} €
              </p>
              <p className="text-gray-600 text-xs break-all">Réf. {booking.id}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Mon espace
              </Button>
            </Link>
            <Link href="/cars">
              <Button variant="secondary" size="sm">
                Continuer à explorer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
