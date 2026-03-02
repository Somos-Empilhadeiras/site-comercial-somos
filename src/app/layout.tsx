import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from 'sonner';
import NavBar from "../shared/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comercial | Somos Empilhadeiras",
  description: "Portal Comercial Somos Empilhadeiras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <NavBar />

        {/* Contêiner limpo: permite que o Admin expanda 100% e as outras páginas se controlem */}
        <main className="flex-1 w-full flex flex-col">
          {children}
          <Toaster position="top-right" richColors />
        </main>

        <Analytics />
      </body>
    </html>
  );
}