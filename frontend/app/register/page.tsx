"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { test: password.length >= 8, label: "8 caractères minimum" },
    { test: /[A-Z]/.test(password), label: "Majuscule" },
    { test: /[0-9]/.test(password), label: "Chiffre" },
    { test: /[^A-Za-z0-9]/.test(password), label: "Caractère spécial" },
  ];

  const passed = checks.filter((c) => c.test).length;
  const strength =
    passed === 0
      ? null
      : passed <= 1
      ? "weak"
      : passed <= 2
      ? "fair"
      : passed <= 3
      ? "good"
      : "strong";

  const colors = {
    weak: "bg-red-500",
    fair: "bg-yellow-500",
    good: "bg-blue-500",
    strong: "bg-green-500",
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              strength && passed >= i
                ? colors[strength]
                : "bg-[#2a2a2a]"
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={cn(
              "text-xs transition-colors",
              check.test ? "text-green-400" : "text-gray-600"
            )}
          >
            {check.test ? "✓" : "○"} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await authRegister({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      router.push("/dashboard");
    } catch {
      setServerError(
        "Un compte avec cet email existe déjà ou une erreur s'est produite."
      );
    }
  };

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full bg-[#1a1a1a] border rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-gray-600",
      "focus:outline-none focus:ring-1 transition-all duration-200",
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : "border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-[#c9a84c] focus:ring-[#c9a84c]/20"
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c9a84c]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="glass rounded-2xl p-8 border border-[#2a2a2a]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c9a84c] to-[#d4af37] rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-sm font-serif">
                  L
                </span>
              </div>
              <span className="text-white font-serif text-xl font-semibold">
                LuxeDrive
              </span>
            </Link>
            <h1 className="text-2xl font-serif font-bold text-white mb-2">
              Créer votre compte
            </h1>
            <p className="text-gray-500 text-sm">
              Rejoignez le cercle de l&apos;excellence automobile
            </p>
          </div>

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    {...register("firstName")}
                    placeholder="Jean"
                    autoComplete="given-name"
                    className={inputClass(!!errors.firstName)}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    {...register("lastName")}
                    placeholder="Dupont"
                    autoComplete="family-name"
                    className={inputClass(!!errors.lastName)}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="exemple@email.com"
                  autoComplete="email"
                  className={inputClass(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={cn(inputClass(!!errors.password), "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={cn(inputClass(!!errors.confirmPassword), "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Créer mon compte
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#2a2a2a]" />
            <span className="text-gray-600 text-xs">ou</span>
            <div className="h-px flex-1 bg-[#2a2a2a]" />
          </div>

          <p className="text-center text-gray-500 text-sm">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-[#c9a84c] hover:text-[#f0c040] font-medium transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
