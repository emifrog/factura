import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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
  title: "Factura — Facturation électronique pour freelances",
  description:
    "Le moins cher pour être conforme à la réforme française 2026-2027. Factur-X, archivage 10 ans, émission via PDP partenaire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable} h-full`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">{children}</body>
    </html>
  );
}
