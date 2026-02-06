import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Bookkeeper",
  description: "Intelligent transaction categorization & financial insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
