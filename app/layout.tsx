import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MCP Registry",
    template: "%s | MCP Registry",
  },
  description: "A registry for Model Context Protocol (MCP) servers and tools.",
  keywords: ["MCP", "Model Context Protocol", "registry", "AI", "tools"],
  authors: [{ name: "MCP Registry Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MCP Registry",
    title: "MCP Registry",
    description:
      "A registry for Model Context Protocol (MCP) servers and tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP Registry",
    description:
      "A registry for Model Context Protocol (MCP) servers and tools.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
