import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans_Devanagari, Noto_Sans_Kannada } from "next/font/google";
import { PreferencesProvider } from "@/components/layout/preferences-provider";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"], display: "swap" });
const kannada = Noto_Sans_Kannada({ variable: "--font-kannada", subsets: ["kannada"], display: "swap" });

export const metadata: Metadata = {
  title: "Mohalla Mic | Neighbourhood, heard.",
  description: "A clear, community-led way to report neighbourhood issues.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${devanagari.variable} ${kannada.variable}`} suppressHydrationWarning>
    <body><PreferencesProvider>{children}</PreferencesProvider></body>
  </html>;
}
