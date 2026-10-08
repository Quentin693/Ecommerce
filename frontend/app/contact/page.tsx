"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { contactApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Indiquez votre nom"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Indiquez un sujet"),
  message: z.string().min(10, "Votre message doit faire au moins 10 caractères"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const fieldClass = (invalid: boolean) =>
  cn(
    "w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-gray-600",
    "focus:outline-none focus:ring-1 transition-all duration-200",
    invalid
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-[#c9a84c] focus:ring-[#c9a84c]/20"
  );

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      await contactApi.send({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        subject: data.subject,
        message: data.message,
      });
      setSent(true);
      reset();
    } catch {
      setServerError(
        "Le message n’a pas pu être envoyé. Vérifiez que l’API est démarrée, puis réessayez."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 max-w-2xl"
        >
          <span className="text-[#c9a84c] text-sm font-medium uppercase tracking-widest">
            Conciergerie
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3">
            Contactez-nous
          </h1>
          <p className="text-gray-400 mt-4 leading-relaxed">
            Une livraison, une date ou un véhicule sur mesure : écrivez-nous.
            L’équipe répond sous 24 heures.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: MapPin,
                label: "Adresse",
                value: "12 Avenue des Champs-Élysées, 75008 Paris",
              },
              { icon: Phone, label: "Téléphone", value: "+33 1 23 45 67 89" },
              { icon: Mail, label: "Email", value: "contact@luxedrive.fr" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex gap-4 p-5 rounded-2xl bg-[#111111] border border-white/6"
              >
                <item.icon className="h-5 w-5 text-[#c9a84c] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    {item.label}
                  </p>
                  <p className="text-white text-sm mt-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 rounded-2xl bg-[#111111] border border-white/6 p-6 sm:p-8">
            {sent && (
              <div className="mb-6 p-4 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] text-sm">
                Message reçu. Nous vous répondons à l’adresse indiquée.
              </div>
            )}
            {serverError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      {...register("name")}
                      placeholder="Camille Martin"
                      className={cn(fieldClass(!!errors.name), "pl-10")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="vous@email.com"
                      className={cn(fieldClass(!!errors.email), "pl-10")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    Téléphone
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+33 6 00 00 00 00"
                    className={fieldClass(false)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">
                    Sujet
                  </label>
                  <input
                    {...register("subject")}
                    placeholder="Livraison à l’hôtel"
                    className={fieldClass(!!errors.subject)}
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">
                  Message
                </label>
                <textarea
                  {...register("message")}
                  rows={5}
                  placeholder="Dates, véhicule, adresse de remise…"
                  className={cn(fieldClass(!!errors.message), "resize-y min-h-32")}
                />
                {errors.message && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" variant="primary" disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Envoi…" : "Envoyer le message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
