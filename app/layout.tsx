import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { PaperNav } from "@/components/layout/PaperNav";
import { Footer } from "@/components/layout/Footer";
import { PatientProvider } from "@/lib/patient-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dr Muddu TyG Research Dashboard",
  description: "TyG index research dashboard – HOMA Clinic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PatientProvider>
          <Header />
          <PaperNav />
          <main className="container mx-auto min-h-screen px-4 py-6">
            {children}
          </main>
          <Footer />
        </PatientProvider>
      </body>
    </html>
  );
}
