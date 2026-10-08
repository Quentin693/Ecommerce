"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  adminApi,
  BookingStatus,
  ContactMessage,
  DeliveryStatus,
  Reservation,
  User,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import FleetPanel from "@/components/admin/FleetPanel";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Tab = "orders" | "deliveries" | "fleet" | "accounts" | "messages";

const tabs: { id: Tab; label: string }[] = [
  { id: "orders", label: "Commandes" },
  { id: "deliveries", label: "Livraisons" },
  { id: "fleet", label: "Flotte" },
  { id: "accounts", label: "Comptes" },
  { id: "messages", label: "Messages" },
];

const bookingStatusLabel: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  to_schedule: "À planifier",
  scheduled: "Planifiée",
  in_transit: "En cours",
  delivered: "Livrée",
  returned: "Véhicule rendu",
};

const messageStatusLabel: Record<ContactMessage["status"], string> = {
  new: "Nouveau",
  read: "Lu",
  handled: "Traité",
};

const selectClass =
  "bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:border-[#c9a84c] focus:outline-none";

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "d MMM yyyy", { locale: fr });
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const isAdmin = isAuthenticated && user?.role === "admin";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  const bookingsQuery = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => adminApi.getBookings(),
    enabled: isAdmin,
    retry: false,
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.getUsers(),
    enabled: isAdmin && tab === "accounts",
    retry: false,
  });

  const messagesQuery = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: () => adminApi.getMessages(),
    enabled: isAdmin && tab === "messages",
    retry: false,
  });

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-28">
        <p className="text-center text-gray-500">Chargement du back-office…</p>
      </div>
    );
  }

  const bookings = bookingsQuery.data?.data ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <span className="text-[#c9a84c] text-sm font-medium uppercase tracking-widest">
          Administration
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">
          Back-office
        </h1>
        <p className="text-gray-500 mt-2">
          Commandes, livraisons, flotte, comptes et messages reçus via le formulaire.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm border transition-colors",
                tab === item.id
                  ? "bg-[#c9a84c] text-black border-[#c9a84c]"
                  : "bg-[#111111] text-gray-300 border-white/10 hover:border-[#c9a84c]/40"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "orders" && (
            <OrdersPanel
              bookings={bookings}
              isLoading={bookingsQuery.isLoading}
              isError={bookingsQuery.isError}
            />
          )}
          {tab === "deliveries" && (
            <DeliveriesPanel
              bookings={bookings}
              isLoading={bookingsQuery.isLoading}
              isError={bookingsQuery.isError}
            />
          )}
          {tab === "fleet" && <FleetPanel />}
          {tab === "accounts" && (
            <AccountsPanel
              users={usersQuery.data?.data ?? []}
              currentUserId={user.id}
              isLoading={usersQuery.isLoading}
              isError={usersQuery.isError}
            />
          )}
          {tab === "messages" && (
            <MessagesPanel
              messages={messagesQuery.data?.data ?? []}
              isLoading={messagesQuery.isLoading}
              isError={messagesQuery.isError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function panelMessage(isLoading: boolean, isError: boolean, empty: boolean, emptyLabel: string) {
  if (isLoading) return "Chargement…";
  if (isError) {
    return "Impossible de charger ces données. Vérifiez que l’API tourne et que votre session admin est valide.";
  }
  if (empty) return emptyLabel;
  return null;
}

function PanelMessage({ message, isError }: { message: string; isError: boolean }) {
  return <p className={isError ? "text-red-400 text-sm" : "text-gray-500 text-sm"}>{message}</p>;
}

function OrdersPanel({
  bookings,
  isLoading,
  isError,
}: {
  bookings: Reservation[];
  isLoading: boolean;
  isError: boolean;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      adminApi.updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  });

  const message = panelMessage(isLoading, isError, bookings.length === 0, "Aucune commande pour le moment.");
  if (message) return <PanelMessage message={message} isError={isError} />;

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="rounded-2xl bg-[#111111] border border-white/6 p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between"
        >
          <div>
            <p className="text-white font-medium">
              {booking.car?.name ?? "Véhicule"}{" "}
              <span className="text-gray-500 font-normal">
                · {booking.user?.firstName} {booking.user?.lastName}
              </span>
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {formatDay(booking.startDate)} — {formatDay(booking.endDate)} ·{" "}
              {Number(booking.totalPrice).toLocaleString("fr-FR")} €
            </p>
            <p className="text-gray-600 text-xs mt-1">{booking.user?.email}</p>
          </div>
          <select
            className={selectClass}
            value={booking.status}
            disabled={mutation.isPending}
            onChange={(event) =>
              mutation.mutate({
                id: booking.id,
                status: event.target.value as BookingStatus,
              })
            }
          >
            {(Object.keys(bookingStatusLabel) as BookingStatus[]).map((status) => (
              <option key={status} value={status}>
                {bookingStatusLabel[status]}
              </option>
            ))}
          </select>
        </article>
      ))}
    </div>
  );
}

function DeliveriesPanel({
  bookings,
  isLoading,
  isError,
}: {
  bookings: Reservation[];
  isLoading: boolean;
  isError: boolean;
}) {
  const message = panelMessage(isLoading, isError, bookings.length === 0, "Aucune livraison à suivre.");
  if (message) return <PanelMessage message={message} isError={isError} />;

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <DeliveryCard
          key={`${booking.id}-${booking.deliveryStatus}-${booking.deliveryAddress}-${booking.deliveryCity}`}
          booking={booking}
        />
      ))}
    </div>
  );
}

function DeliveryCard({ booking }: { booking: Reservation }) {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState(booking.deliveryAddress ?? "");
  const [city, setCity] = useState(booking.deliveryCity ?? "");
  const [status, setStatus] = useState<DeliveryStatus>(
    booking.deliveryStatus ?? "to_schedule"
  );

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.updateDelivery(booking.id, {
        deliveryAddress: address,
        deliveryCity: city,
        deliveryStatus: status,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  });

  return (
    <article className="rounded-2xl bg-[#111111] border border-white/6 p-5">
      <p className="text-white font-medium">
        {booking.car?.name ?? "Véhicule"} · {booking.user?.firstName} {booking.user?.lastName}
      </p>
      <p className="text-gray-500 text-sm mt-1">
        {formatDay(booking.startDate)} — {formatDay(booking.endDate)}
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Adresse de remise"
          className={selectClass}
        />
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ville"
          className={selectClass}
        />
        <select
          className={selectClass}
          value={status}
          onChange={(event) => setStatus(event.target.value as DeliveryStatus)}
        >
          {(Object.keys(deliveryStatusLabel) as DeliveryStatus[]).map((item) => (
            <option key={item} value={item}>
              {deliveryStatusLabel[item]}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Enregistrement…" : "Enregistrer la livraison"}
        </Button>
        {mutation.isError && (
          <p className="text-red-400 text-xs">Enregistrement impossible.</p>
        )}
      </div>
    </article>
  );
}

function AccountsPanel({
  users,
  currentUserId,
  isLoading,
  isError,
}: {
  users: User[];
  currentUserId: string;
  isLoading: boolean;
  isError: boolean;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "admin" | "user" }) =>
      adminApi.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const message = panelMessage(isLoading, isError, users.length === 0, "Aucun compte.");
  if (message) return <PanelMessage message={message} isError={isError} />;

  return (
    <div className="space-y-3">
      {users.map((account) => {
        const isSelf = account.id === currentUserId;
        const nextRole = account.role === "admin" ? "user" : "admin";
        return (
          <article
            key={account.id}
            className="rounded-2xl bg-[#111111] border border-white/6 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <p className="text-white font-medium">
                {account.firstName} {account.lastName}
              </p>
              <p className="text-gray-500 text-sm">{account.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-[#c9a84c]">
                {account.role === "admin" ? "Admin" : "Client"}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSelf || mutation.isPending}
                onClick={() => mutation.mutate({ id: account.id, role: nextRole })}
              >
                {isSelf
                  ? "Votre compte"
                  : nextRole === "admin"
                    ? "Passer admin"
                    : "Passer client"}
              </Button>
            </div>
          </article>
        );
      })}
      {mutation.isError && (
        <p className="text-red-400 text-sm">Le rôle n’a pas pu être modifié.</p>
      )}
    </div>
  );
}

function MessagesPanel({
  messages,
  isLoading,
  isError,
}: {
  messages: ContactMessage[];
  isLoading: boolean;
  isError: boolean;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessage["status"] }) =>
      adminApi.updateMessageStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "messages"] }),
  });

  const message = panelMessage(isLoading, isError, messages.length === 0, "Aucun message.");
  if (message) return <PanelMessage message={message} isError={isError} />;

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <article
          key={message.id}
          className="rounded-2xl bg-[#111111] border border-white/6 p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <p className="text-white font-medium">{message.subject}</p>
              <p className="text-gray-500 text-sm mt-1">
                {message.name} · {message.email}
                {message.phone ? ` · ${message.phone}` : ""}
              </p>
            </div>
            <span className="text-xs uppercase tracking-wider text-[#c9a84c]">
              {messageStatusLabel[message.status]}
            </span>
          </div>
          <p className="text-gray-300 text-sm mt-4 whitespace-pre-wrap">{message.message}</p>
          <p className="text-gray-600 text-xs mt-3">{formatDay(message.createdAt)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["read", "handled", "new"] as const).map((status) => (
              <button
                key={status}
                type="button"
                disabled={mutation.isPending || message.status === status}
                onClick={() => mutation.mutate({ id: message.id, status })}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-300 hover:border-[#c9a84c]/50 disabled:opacity-40"
              >
                {messageStatusLabel[status]}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
