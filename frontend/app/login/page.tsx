"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch {
      setServerError(
        "Email ou mot de passe incorrect. Vérifiez vos identifiants."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-20">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c9a84c]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
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
              Bon retour parmi nous
            </h1>
            <p className="text-gray-500 text-sm">
              Connectez-vous à votre espace personnel
            </p>
          </div>

          {/* Error message */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              {serverError}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  className={cn(
                    "w-full bg-[#1a1a1a] border rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-gray-600",
                    "focus:outline-none focus:ring-1 transition-all duration-200",
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-[#c9a84c] focus:ring-[#c9a84c]/20"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-xs text-[#c9a84c] hover:text-[#f0c040] transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    "w-full bg-[#1a1a1a] border rounded-xl pl-10 pr-12 py-3.5 text-white text-sm placeholder:text-gray-600",
                    "focus:outline-none focus:ring-1 transition-all duration-200",
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[#2a2a2a] hover:border-[#3a3a3a] focus:border-[#c9a84c] focus:ring-[#c9a84c]/20"
                  )}
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
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.password.message}
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
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#2a2a2a]" />
            <span className="text-gray-600 text-xs">ou</span>
            <div className="h-px flex-1 bg-[#2a2a2a]" />
          </div>

          {/* Register link */}
          <p className="text-center text-gray-500 text-sm">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-[#c9a84c] hover:text-[#f0c040] font-medium transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
