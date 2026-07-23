import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteIcons = {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/web/icon-192.png", sizes: "192x192", type: "image/png" },
    { url: "/web/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [{ url: "/web/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  shortcut: ["/favicon.ico"],
};

export const metadata: Metadata = {
  title: "Pfolio Admin",
  description: "Edit the portfolio content.",
  icons: siteIcons,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
