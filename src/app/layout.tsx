import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body className="bg-dark text-white font-sans">
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
