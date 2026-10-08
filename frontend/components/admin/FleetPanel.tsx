"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, Car, CarInput } from "@/lib/api";
import Button from "@/components/ui/Button";

const photos = [
  "/cars/ferrari-488.jpg",
  "/cars/lamborghini-huracan.jpg",
  "/cars/bentley-continental.jpg",
  "/cars/porsche-911.jpg",
  "/cars/rolls-royce.jpg",
  "/cars/mclaren-720s.jpg",
  "/cars/aston-db11.jpg",
  "/cars/mercedes-amg.jpg",
  "/cars/bugatti-chiron.jpg",
];

const categories: { value: CarInput["category"]; label: string }[] = [
  { value: "supercar", label: "Supercar" },
  { value: "luxury", label: "Luxe" },
  { value: "suv", label: "SUV" },
  { value: "convertible", label: "Cabriolet" },
];

const categoryLabel: Record<string, string> = {
  supercar: "Supercar",
  luxury: "Luxe",
  suv: "SUV",
  convertible: "Cabriolet",
};

const fieldClass =
  "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-[#c9a84c] focus:outline-none";

type FormState = {
  name: string;
  brand: string;
  model: string;
  year: string;
  description: string;
  pricePerDay: string;
  category: CarInput["category"];
  imageUrl: string;
  seats: string;
  transmission: "automatic" | "manual";
  available: boolean;
  features: string;
};

const emptyForm = (): FormState => ({
  name: "",
  brand: "",
  model: "",
  year: String(new Date().getFullYear()),
  description: "",
  pricePerDay: "",
  category: "luxury",
  imageUrl: "/cars/porsche-911.jpg",
  seats: "2",
  transmission: "automatic",
  available: true,
  features: "",
});

function toForm(car: Car): FormState {
  return {
    name: car.name,
    brand: car.brand,
    model: car.model ?? "",
    year: String(car.year ?? new Date().getFullYear()),
    description: car.description ?? "",
    pricePerDay: String(Number(car.pricePerDay)),
    category: (categories.some((item) => item.value === car.category)
      ? car.category
      : "luxury") as CarInput["category"],
    imageUrl: car.imageUrl || photos[0],
    seats: String(car.seats ?? car.specs?.seats ?? 2),
    transmission: car.transmission === "manual" ? "manual" : "automatic",
    available: car.available,
    features: (car.features ?? []).join(", "),
  };
}

function toPayload(form: FormState): CarInput {
  const features = form.features
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    model: form.model.trim(),
    year: Number(form.year),
    description: form.description.trim(),
    pricePerDay: Number(form.pricePerDay),
    category: form.category,
    imageUrl: form.imageUrl.trim(),
    images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
    available: form.available,
    features,
    seats: Number(form.seats),
    transmission: form.transmission,
  };
}

function validate(form: FormState): string | null {
  if (form.name.trim().length < 2 || form.brand.trim().length < 2 || form.model.trim().length < 1) {
    return "Indiquez le nom, la marque et le modèle.";
  }
  if (form.description.trim().length < 10) {
    return "La description doit faire au moins 10 caractères.";
  }
  const year = Number(form.year);
  const price = Number(form.pricePerDay);
  const seats = Number(form.seats);
  if (!Number.isInteger(year) || year < 1990 || year > 2035) {
    return "Indiquez une année entre 1990 et 2035.";
  }
  if (!Number.isFinite(price) || price <= 0) {
    return "Indiquez un prix par jour supérieur à 0.";
  }
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
    return "Indiquez un nombre de places entre 1 et 8.";
  }
  if (!form.imageUrl.trim()) {
    return "Indiquez une photo, par exemple /cars/porsche-911.jpg.";
  }
  return null;
}

function apiMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response
    ?.data?.message;
  const text = Array.isArray(message) ? message.join(" ") : message;
  if (typeof text === "string" && text.includes("linked to bookings")) {
    return "Cette voiture a des commandes. Passez-la indisponible plutôt que de la supprimer.";
  }
  return fallback;
}

export default function FleetPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const carsQuery = useQuery({
    queryKey: ["admin", "cars"],
    queryFn: () => adminApi.getCars(),
    retry: false,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "cars"] });
    queryClient.invalidateQueries({ queryKey: ["cars"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: CarInput) =>
      editingId ? adminApi.updateCar(editingId, payload) : adminApi.createCar(payload),
    onSuccess: () => {
      setForm(null);
      setEditingId(null);
      setFormError(null);
      refresh();
    },
    onError: () => {
      setFormError("L’enregistrement a échoué. Vérifiez les champs et que l’API est démarrée.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCar(id),
    onSuccess: () => {
      setPendingDelete(null);
      setDeleteError(null);
      if (editingId && pendingDelete === editingId) {
        setForm(null);
        setEditingId(null);
      }
      refresh();
    },
    onError: (error) => {
      setDeleteError(apiMessage(error, "La suppression a échoué."));
    },
  });

  const cars = carsQuery.data?.data.data ?? [];
  const message = carsQuery.isLoading
    ? "Chargement…"
    : carsQuery.isError
      ? "Impossible de charger la flotte. Vérifiez que l’API tourne et que votre session admin est valide."
      : cars.length === 0
        ? "Aucune voiture dans la flotte."
        : null;

  const update = (patch: Partial<FormState>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const error = validate(form);
    setFormError(error);
    if (error) return;
    saveMutation.mutate(toPayload(form));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm());
            setFormError(null);
          }}
        >
          Ajouter une voiture
        </Button>
      </div>

      {form && (
        <form
          onSubmit={submit}
          className="rounded-2xl bg-[#111111] border border-white/6 p-5 space-y-4"
        >
          <h2 className="text-white font-serif text-xl">
            {editingId ? "Modifier la voiture" : "Nouvelle voiture"}
          </h2>
          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="text-sm text-gray-400">
              Nom
              <input
                className={`${fieldClass} mt-1.5`}
                value={form.name}
                onChange={(event) => update({ name: event.target.value })}
              />
            </label>
            <label className="text-sm text-gray-400">
              Marque
              <input
                className={`${fieldClass} mt-1.5`}
                value={form.brand}
                onChange={(event) => update({ brand: event.target.value })}
              />
            </label>
            <label className="text-sm text-gray-400">
              Modèle
              <input
                className={`${fieldClass} mt-1.5`}
                value={form.model}
                onChange={(event) => update({ model: event.target.value })}
              />
            </label>
            <label className="text-sm text-gray-400">
              Année
              <input
                type="number"
                className={`${fieldClass} mt-1.5`}
                value={form.year}
                onChange={(event) => update({ year: event.target.value })}
              />
            </label>
            <label className="text-sm text-gray-400">
              Prix / jour (€)
              <input
                type="number"
                min={1}
                className={`${fieldClass} mt-1.5`}
                value={form.pricePerDay}
                onChange={(event) => update({ pricePerDay: event.target.value })}
              />
            </label>
            <label className="text-sm text-gray-400">
              Places
              <input
                type="number"
                min={1}
                max={8}
                className={`${fieldClass} mt-1.5`}
                value={form.seats}
                onChange={(event) => update({ seats: event.target.value })}
              />
            </label>
            <label className="text-sm text-gray-400">
              Catégorie
              <select
                className={`${fieldClass} mt-1.5`}
                value={form.category}
                onChange={(event) =>
                  update({ category: event.target.value as CarInput["category"] })
                }
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-400">
              Transmission
              <select
                className={`${fieldClass} mt-1.5`}
                value={form.transmission}
                onChange={(event) =>
                  update({ transmission: event.target.value as "automatic" | "manual" })
                }
              >
                <option value="automatic">Automatique</option>
                <option value="manual">Manuelle</option>
              </select>
            </label>
            <label className="text-sm text-gray-400">
              Photo
              <input
                list="fleet-photos"
                className={`${fieldClass} mt-1.5`}
                value={form.imageUrl}
                onChange={(event) => update({ imageUrl: event.target.value })}
              />
              <datalist id="fleet-photos">
                {photos.map((photo) => (
                  <option key={photo} value={photo} />
                ))}
              </datalist>
            </label>
          </div>
          <label className="block text-sm text-gray-400">
            Équipements, séparés par des virgules
            <input
              className={`${fieldClass} mt-1.5`}
              value={form.features}
              placeholder="GPS, Assurance incluse"
              onChange={(event) => update({ features: event.target.value })}
            />
          </label>
          <label className="block text-sm text-gray-400">
            Description
            <textarea
              rows={3}
              className={`${fieldClass} mt-1.5 resize-y`}
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(event) => update({ available: event.target.checked })}
            />
            Disponible à la location
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setForm(null);
                setEditingId(null);
                setFormError(null);
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      {message && (
        <p className={carsQuery.isError ? "text-red-400 text-sm" : "text-gray-500 text-sm"}>
          {message}
        </p>
      )}
      {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}

      <div className="space-y-3">
        {cars.map((car) => (
          <article
            key={car.id}
            className="rounded-2xl bg-[#111111] border border-white/6 p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
          >
            <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-[#1a1a1a] shrink-0">
              {car.imageUrl && (
                <Image src={car.imageUrl} alt={car.name} fill className="object-cover" sizes="144px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate">{car.name}</p>
              <p className="text-gray-500 text-sm">
                {car.brand} {car.model} · {categoryLabel[car.category] ?? car.category} ·{" "}
                {Number(car.pricePerDay).toLocaleString("fr-FR")} € / jour
              </p>
              <p className="text-xs uppercase tracking-wider text-[#c9a84c] mt-1">
                {car.available ? "Disponible" : "Indisponible"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingId(car.id);
                  setForm(toForm(car));
                  setFormError(null);
                }}
              >
                Modifier
              </Button>
              {pendingDelete === car.id ? (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(car.id)}
                >
                  {deleteMutation.isPending ? "Suppression…" : "Confirmer"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPendingDelete(car.id);
                    setDeleteError(null);
                  }}
                >
                  Supprimer
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
