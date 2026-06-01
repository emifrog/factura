import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Factura — Facturation électronique conforme 2026",
    template: "%s · Factura",
  },
  description:
    "La facturation électronique conforme à la réforme 2026, pensée pour les freelances solo. 9 €/mois, sans usine à gaz comptable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
