"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { ArrowRight, Shield, Clock, Truck, Star, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import CarCard from "@/components/ui/CarCard";
import { CarCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { carsApi } from "@/lib/api";
import { featuredCars } from "@/lib/mock-cars";

/* ─── Animation helpers ───────────────────────────────────────── */
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};
const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: {} } as Variants}
      transition={{ staggerChildren: 0.12 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Brands marquee ──────────────────────────────────────────── */
const BRANDS = ["Ferrari", "Lamborghini", "Rolls-Royce", "Bentley", "Porsche",
                "Aston Martin", "McLaren", "Bugatti", "Maserati", "Pagani"];

/* ─── Page ────────────────────────────────────────────────────── */
export default function HomePage() {
  const { data: carsData, isLoading } = useQuery({
    queryKey: ["cars", "featured"],
    queryFn: () => carsApi.getAll({ page: 1 }),
    retry: false,
  });

  const allCars = carsData?.data?.data ?? featuredCars;
  const featured = allCars.slice(0, 4);

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          HERO — full viewport
      ════════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[680px] flex items-center overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/cars/bugatti-chiron.jpg"
            alt="Bugatti Chiron"
            fill
            priority
            className="object-cover scale-[1.02]"
            sizes="100vw"
          />
          {/* Layered gradients for depth — short fade so the next section starts cleanly */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="max-w-2xl"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="flex items-center gap-3 mb-7"
            >
              <div className="h-px w-10 bg-[#c9a84c]" />
              <span className="text-[#c9a84c] text-xs font-medium tracking-[0.25em] uppercase">
                Excellence Automobile
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl font-serif font-bold text-white leading-[1.02] tracking-tight mb-7"
            >
              Vivez<br />
              <span className="text-gold-gradient">l&apos;Exception</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md"
            >
              Une collection exclusive de supercars et berlines de prestige.
              Chaque trajet devient une expérience gravée dans les mémoires.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/cars">
                <Button variant="primary" size="lg">
                  Découvrir notre flotte
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#featured">
                <Button variant="ghost" size="lg">Voir les vedettes</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600"
        >
          <span className="text-[10px] uppercase tracking-[0.22em]">Défiler</span>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BRANDS MARQUEE
      ════════════════════════════════════════════════════════ */}
      <div className="border-y border-white/[0.06] bg-[#0d0d0d] py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-10">
              <span className="text-white/30 text-sm font-medium tracking-[0.28em] uppercase">
                {brand}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#c9a84c]/40" />
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-24">
          <Section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c1c1c] rounded-2xl overflow-hidden">
              {[
                { value: "500+", label: "Clients satisfaits",  icon: Star  },
                { value: "50+",  label: "Véhicules premium",   icon: Shield },
                { value: "10",   label: "Ans d'expérience",    icon: Clock  },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-[#0a0a0a] px-10 py-12 text-center group hover:bg-[#0f0f0f] transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl
                    bg-[#c9a84c]/8 border border-[#c9a84c]/15 mb-5
                    group-hover:bg-[#c9a84c]/15 transition-colors duration-300">
                    <stat.icon className="h-5 w-5 text-[#c9a84c]" />
                  </div>
                  <p className="text-5xl font-bold font-serif text-gold-gradient mb-2 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-sm tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED CARS
      ════════════════════════════════════════════════════════ */}
      <section id="featured" className="bg-[#0a0a0a] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-28">
          <Section>
            {/* Header */}
            <motion.div variants={fadeUp} className="mb-14">
              <span className="text-[#c9a84c] text-xs font-medium uppercase tracking-[0.22em]">
                Sélection exclusive
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3 mb-4 leading-tight">
                Nos voitures vedettes
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                  Des joyaux mécaniques soigneusement sélectionnés,
                  prêts à transformer chaque kilomètre en souvenir impérissable.
                </p>
                <Link href="/cars" className="hidden md:flex items-center gap-2 text-[#c9a84c] text-sm hover:text-[#f0c040] transition-colors group">
                  Voir toute la flotte
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((car, index) => (
                  <CarCard key={car.id} car={car} index={index} />
                ))}
              </div>
            )}

            {/* Mobile CTA */}
            <motion.div variants={fadeIn} className="text-center mt-10 md:hidden">
              <Link href="/cars">
                <Button variant="secondary" size="lg">
                  Voir toute la flotte <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          IMMERSIVE BANNER
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/[0.06]">
            <Image
              src="/cars/porsche-banner.jpg"
              alt="Porsche vue panoramique"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 md:px-14 w-full">
                <Section>
                  <motion.p variants={fadeUp} className="text-[#c9a84c] text-xs uppercase tracking-[0.22em] mb-4">
                    Notre promesse
                  </motion.p>
                  <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif font-bold text-white max-w-xl leading-tight">
                    Chaque détail pensé<br/>pour votre plaisir
                  </motion.h2>
                  <motion.div variants={fadeUp} className="mt-8">
                    <Link href="/cars">
                      <Button variant="primary" size="lg">
                        Réserver maintenant <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </Section>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY US
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#111111] border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-28">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-[#c9a84c] text-xs font-medium uppercase tracking-[0.22em]">
                Notre engagement
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3">
                Pourquoi LuxeDrive&nbsp;?
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Star,
                  title: "Flotte d'exception",
                  desc: "Chaque véhicule est méticuleusement entretenu et préparé selon les standards les plus exigeants avant chaque prise en charge.",
                },
                {
                  icon: Clock,
                  title: "Service 24h/7j",
                  desc: "Notre équipe de conciergerie est disponible à toute heure pour répondre à vos besoins avec réactivité et discrétion.",
                },
                {
                  icon: Truck,
                  title: "Livraison à domicile",
                  desc: "Nous livrons votre véhicule à l'adresse de votre choix — hôtel, aéroport, résidence — partout en France.",
                },
                {
                  icon: Shield,
                  title: "Couverture totale",
                  desc: "Tous nos véhicules bénéficient d'une assurance tous risques incluse. Conduisez l'esprit parfaitement libre.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="luxury-card rounded-2xl p-8 group h-full"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#c9a84c]/8 border border-[#c9a84c]/15
                    flex items-center justify-center mb-6
                    group-hover:bg-[#c9a84c]/18 group-hover:border-[#c9a84c]/30
                    transition-colors duration-300">
                    <item.icon className="h-5 w-5 text-[#c9a84c]" />
                  </div>
                  <h3 className="text-white font-serif text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA FINALE
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0a0a0a] border-b border-white/[0.06]">
        {/* Gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[700px] h-[300px] rounded-full bg-[#c9a84c]/6 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <Section>
            <motion.span variants={fadeUp} className="text-[#c9a84c] text-xs font-medium uppercase tracking-[0.22em] block mb-5">
              Passez à l&apos;action
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Prêt pour une<br />expérience{" "}
              <span className="text-gold-gradient">unique&nbsp;?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 text-base mb-12 max-w-xl mx-auto leading-relaxed">
              Réservez dès maintenant votre voiture de rêve et offrez-vous
              une expérience automobile hors du commun.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cars">
                <Button variant="primary" size="lg">
                  Réserver maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" size="lg">Créer un compte</Button>
              </Link>
            </motion.div>
          </Section>
        </div>
      </section>
    </>
  );
}
