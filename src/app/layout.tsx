import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: "Transcend - Sports Intelligence",
    template: "%s | Transcend - Sports Intelligence",
  },
  description: "Transcend is the decision-grade sports intelligence platform powered by MASCE and The Loop.",
  icons: {
    icon: [
      { url: "/logos/tsai-emblem-full.png" },
    ],
    shortcut: ["/logos/tsai-emblem-full.png"],
    apple: [
      { url: "/logos/tsai-emblem-full.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="dark" closeButton />
      </body>
    </html>
  );
}
