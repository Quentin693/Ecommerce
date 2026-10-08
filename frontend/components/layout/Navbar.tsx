"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, Shield, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/cars", label: "Flotte" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const isHome = pathname === "/";
  const solid = isScrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        solid
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c9a84c] to-[#d4af37] rounded-sm flex items-center justify-center">
              <span className="text-black font-bold text-sm font-serif">L</span>
            </div>
            <span className="text-white font-serif text-xl font-semibold tracking-wide group-hover:text-[#c9a84c] transition-colors">
              LuxeDrive
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 relative group",
                  pathname === link.href
                    ? "text-[#c9a84c]"
                    : "text-gray-300 hover:text-white"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-[#c9a84c] transition-all duration-300",
                    pathname === link.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-all duration-200",
                  pathname === "/admin" ? "text-[#c9a84c]" : "text-gray-300 hover:text-white"
                )}
              >
                Back-office
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#c9a84c]/50 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#d4af37] flex items-center justify-center">
                    <span className="text-black text-xs font-bold">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  </div>
                  <span className="text-white text-sm">
                    {user?.firstName}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-[#111111] border border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-[#2a2a2a]">
                        <p className="text-white text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/cart"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Panier
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Tableau de bord
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
                          >
                            <Shield className="h-4 w-4" />
                            Back-office
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg text-sm transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Créer un compte
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white hover:text-[#c9a84c] transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Menu"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a]"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "block text-base font-medium py-2 border-b border-[#1a1a1a]",
                    pathname === link.href
                      ? "text-[#c9a84c]"
                      : "text-gray-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/cart" onClick={() => setIsMobileOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Panier
                      </Button>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Button variant="secondary" size="sm" className="w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Button>
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setIsMobileOpen(false)}>
                        <Button variant="secondary" size="sm" className="w-full">
                          <Shield className="mr-2 h-4 w-4" />
                          Back-office
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Button variant="ghost" size="sm" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Button variant="primary" size="sm" className="w-full">
                        Créer un compte
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
