"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="bg-[#080808] border-t border-white/10"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#c9a84c] to-[#d4af37] rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-sm font-serif">
                  L
                </span>
              </div>
              <span className="text-white font-serif text-xl font-semibold">
                LuxeDrive
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              L&apos;excellence automobile à votre service. Découvrez une
              collection exclusive de véhicules de prestige pour vos déplacements
              les plus importants.
            </p>
            <div className="flex items-center gap-3">
              {/* Social media icons using SVG since lucide-react doesn't include them */}
              {[
                {
                  label: "Instagram",
                  href: "#",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  ),
                },
                {
                  label: "Twitter / X",
                  href: "#",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  href: "#",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#c9a84c] hover:border-[#c9a84c]/50 transition-all duration-200"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Accueil" },
                { href: "/cars", label: "Notre flotte" },
                { href: "/login", label: "Connexion" },
                { href: "/register", label: "Créer un compte" },
                { href: "/dashboard", label: "Mon espace" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-[#c9a84c] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">
              Catégories
            </h3>
            <ul className="space-y-3">
              {[
                "Supercars",
                "Grand Tourisme",
                "Ultra Luxe",
                "Sport",
                "Berlines de luxe",
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href="/cars"
                    className="text-gray-500 hover:text-[#c9a84c] text-sm transition-colors duration-200"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <MapPin className="h-4 w-4 text-[#c9a84c] mt-0.5 shrink-0" />
                <span>12 Avenue des Champs-Élysées, 75008 Paris</span>
              </li>
              <li>
                <a
                  href="tel:+33123456789"
                  className="flex items-center gap-3 text-gray-500 hover:text-[#c9a84c] text-sm transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#c9a84c] shrink-0" />
                  +33 1 23 45 67 89
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@luxedrive.fr"
                  className="flex items-center gap-3 text-gray-500 hover:text-[#c9a84c] text-sm transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#c9a84c] shrink-0" />
                  contact@luxedrive.fr
                </a>
              </li>
            </ul>
            <Link
              href="/contact"
              className="inline-block mt-4 text-sm text-[#c9a84c] hover:text-[#f0c040] transition-colors"
            >
              Écrire un message
            </Link>
            <div className="mt-6 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
              <p className="text-[#c9a84c] text-xs font-medium mb-1">
                Service disponible 24h/7j
              </p>
              <p className="text-gray-600 text-xs">
                Notre équipe est à votre disposition à toute heure
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 LuxeDrive. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            {[
              { href: "/mentions-legales", label: "Mentions légales" },
              { href: "/confidentialite", label: "Confidentialité" },
              { href: "/cgv", label: "CGV" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
