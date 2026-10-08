"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ShoppingBag, Trash2 } from "lucide-react";
import { cartApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "d MMM yyyy", { locale: fr });
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
    retry: false,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => cartApi.removeItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <span className="text-[#c9a84c] text-sm font-medium uppercase tracking-widest">
          Panier
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">
          Votre sélection
        </h1>
        <p className="text-gray-500 mt-2">
          Vérifiez les dates, puis passez au paiement. La confirmation s’affiche
          sur le site.
        </p>

        {cartQuery.isError && (
          <p className="mt-6 text-red-400 text-sm">
            Impossible de charger le panier.
          </p>
        )}

        {!cartQuery.isLoading && items.length === 0 && (
          <div className="mt-10 rounded-2xl bg-[#111111] border border-white/6 p-10 text-center">
            <ShoppingBag className="h-10 w-10 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Votre panier est vide.</p>
            <Link href="/cars">
              <Button variant="primary" size="sm">
                Voir la flotte
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-[#111111] border border-white/6 p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-[#1a1a1a] shrink-0">
                {item.car?.imageUrl && (
                  <Image
                    src={item.car.imageUrl}
                    alt={item.car.name}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{item.car?.name}</p>
                <p className="text-gray-500 text-sm">
                  {formatDay(item.startDate)} — {formatDay(item.endDate)} ·{" "}
                  {item.days} j
                </p>
                <p className="text-[#c9a84c] text-sm mt-1">
                  {Number(item.lineTotal).toLocaleString("fr-FR")} €
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Retirer
              </Button>
            </article>
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#111111] border border-white/6 p-5">
            <p className="text-white">
              Total{" "}
              <span className="text-[#c9a84c] font-serif text-2xl ml-2">
                {Number(total).toLocaleString("fr-FR")} €
              </span>
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push("/checkout")}
            >
              Passer au paiement
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
