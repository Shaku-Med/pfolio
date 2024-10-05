import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'animate.css';
import Nav from "./components/Pages/Nav/Nav";
import NextTopLoader from 'nextjs-toploader'
import Tost from './Toastify/Toast'
// 
const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: true,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Medzy Amara | Portfolio",
  description: "Explore Medzy Amara's portfolio showcasing projects, skills, and achievements in computer science.",
  keywords: "Medzy Amara, computer science student, portfolio, projects, skills, achievements",
  authors: [
    {
      name: `Medzy Amara`,
      url: `https://facebook.com/medzy.amara.1`
    }
  ],
  openGraph: {
    description: "Explore Medzy Amara's portfolio showcasing projects, skills, and achievements in computer science.",
    images: [
      {
        url: `https://medzyamara.dev/favicon.ico`,
      }
    ],
    title: "Medzy Amara | Portfolio",
  },
  twitter: {
    site: "@medzyamara",
    card: "summary_large_image",
    images: [
      {
        url: `https://medzyamara.dev/apple-touch-icon.png`,
      }
    ]
  },
  icons: [
    {
      type: `image/x-icon`,
      url: `https://medzyamara.dev/favicon.ico`,
      rel: `shortcut icon`
    },
    {
      rel: `apple-touch-icon`,
      url: `https://medzyamara.dev/apple-touch-icon.png`,
      type: `image/png`
    },
    {
      rel: `apple-touch-icon-pre`,
      url: `https://medzyamara.dev/apple-touch-icon-precomposed.png`,
      type: `image/png`
    }
  ],
  manifest: `https://medzyamara.dev/manifest.json`,
  publisher: `Medzy Amara || Mohamed Amara`,
  creator: `Medzy Amara || Mohamed Amara`,
  category: `portfolio`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`animate__backInUp`} lang="en">
      <body className={`${inter.className} flex items-center justify-between flex-col`}>

        <meta name="theme-color" content="#f7f7f7" media="(prefers-color-scheme: light)"></meta>
        <meta name="theme-color" content="#070707" media="(prefers-color-scheme: dark)"></meta>

        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""></link>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"></link>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>
        {/*  */}

        <div className="poSH fixed top-0 left-0 w-full z-[10000000000000]">
          <NextTopLoader color={`var(--txt)`} showSpinner={false} />
        </div>
        {/*  */}
        <Nav />
        {/*  */}
        {children}
        {/*  */}
        <Tost />
      </body>
    </html>
  );
};