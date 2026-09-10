import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import AccessibilityButton from "@/components/AccessibilityButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  subsets: ["hebrew"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "סוכנות רון שלום",
  description: "השוואת מחירי ביטוח נסיעות לחו״ל",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${rubik.variable} min-h-full flex flex-col`}>
        <Header />
        {children}
        <AccessibilityButton />
      </body>
    </html>
  );
}