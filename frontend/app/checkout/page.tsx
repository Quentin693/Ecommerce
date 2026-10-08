"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { cartApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";

const fieldClass =
  "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:border-[#c9a84c] focus:outline-none";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Paris");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
    retry: false,
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      cartApi.checkout({
        deliveryAddress: deliveryAddress || undefined,
        deliveryCity: deliveryCity || undefined,
        notes: notes || undefined,
      }),
    onSuccess: (response) => {
      const first = response.data.orders[0];
      if (first?.booking?.id) {
        router.push(`/confirmation/${first.booking.id}`);
        return;
      }
      router.push("/dashboard");
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-28">
        <p className="text-center text-gray-500">Chargement…</p>
      </div>
    );
  }

  const items = cartQuery.data?.data.items ?? [];
  const total = cartQuery.data?.data.total ?? 0;
  const errorMessage = (
    checkoutMutation.error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <span className="text-[#c9a84c] text-sm font-medium uppercase tracking-widest">
          Paiement
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">
          Confirmer la réservation
        </h1>
        <p className="text-gray-500 mt-2">
          Paiement simulé (mode démo). Aucun e-mail : la confirmation s’affiche
          immédiatement sur le site.
        </p>

        {items.length === 0 ? (
          <p className="mt-8 text-gray-400">
            Panier vide.{" "}
            <button
              type="button"
              className="text-[#c9a84c]"
              onClick={() => router.push("/cars")}
            >
              Retour à la flotte
            </button>
          </p>
        ) : (
          <div className="mt-8 space-y-5 rounded-2xl bg-[#111111] border border-white/6 p-6">
            <ul className="space-y-2 text-sm text-gray-300">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span>{item.car?.name}</span>
                  <span className="text-[#c9a84c]">
                    {Number(item.lineTotal).toLocaleString("fr-FR")} €
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-white font-medium pt-3 border-t border-white/10">
              Total à régler :{" "}
              <span className="text-[#c9a84c]">
                {Number(total).toLocaleString("fr-FR")} €
              </span>
            </p>

            <label className="block text-sm text-gray-400">
              Adresse de remise
              <input
                className={`${fieldClass} mt-1.5`}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="12 Avenue des Champs-Élysées"
              />
            </label>
            <label className="block text-sm text-gray-400">
              Ville
              <input
                className={`${fieldClass} mt-1.5`}
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
              />
            </label>
            <label className="block text-sm text-gray-400">
              Notes
              <textarea
                className={`${fieldClass} mt-1.5 resize-y min-h-20`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            {checkoutMutation.isError && (
              <p className="text-red-400 text-sm">
                {Array.isArray(errorMessage)
                  ? errorMessage.join(" ")
                  : typeof errorMessage === "string"
                    ? errorMessage.includes("already booked")
                      ? "Un véhicule du panier n’est plus disponible sur ces dates."
                      : errorMessage
                    : "Le paiement a échoué."}
              </p>
            )}

            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={checkoutMutation.isPending}
              isLoading={checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate()}
            >
              Payer et confirmer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
