import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FactSet Terminal",
  description: "AI-native financial data terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
