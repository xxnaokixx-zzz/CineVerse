import type { Metadata } from "next";
import { Jost, Kosugi } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";

const jost = Jost({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-jost',
});

const kosugi = Kosugi({
  // @ts-ignore
  subsets: ["japanese", "latin"],
  weight: "400",
  display: 'swap',
  variable: '--font-kosugi',
});

export const metadata: Metadata = {
  title: "CineVerse - Movie & Anime Discovery",
  description: "Your ultimate guide to movies and anime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${jost.variable} ${kosugi.variable}`}>
      <body className="bg-dark text-white">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="pt-5 mb-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
