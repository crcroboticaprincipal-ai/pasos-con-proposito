import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pasos con Propósito | 4K de Solidaridad",
  description: "Carrera-caminata benéfica de 4km del Colegio Rafael Castillo. Únete a este movimiento de solidaridad y apoya a nuestra institución.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
