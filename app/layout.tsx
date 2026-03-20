import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoTrace — Decarbonizing Commerce",
  description: "Decarbonizing Commerce, One Transaction at a Time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body style={{ background: '#0A0F0A', color: '#E8F5E9', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
