import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuxeDrive – Location de Voitures de Luxe",
  description:
    "Découvrez notre flotte exclusive de voitures de luxe. Ferrari, Lamborghini, Bentley et plus encore. Service premium, livraison incluse.",
  keywords: "location voiture luxe, Ferrari, Lamborghini, Bentley, supercar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#0a0a0a] text-white font-sans antialiased">
        <AuthProvider>
          <QueryProvider>
            <Suspense fallback={<div className="fixed top-0 left-0 right-0 h-20 z-50 bg-transparent" />}>
              <Navbar />
            </Suspense>
            <main className="min-h-screen">{children}</main>
            <Footer />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
