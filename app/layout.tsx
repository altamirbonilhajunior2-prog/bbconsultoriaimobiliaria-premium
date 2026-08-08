import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bbconsultoriaimobiliaria-premium.vercel.app"),

  title: {
    default: "B&B Consultoria Imobiliária",
    template: "%s | B&B Consultoria Imobiliária",
  },

  description:
    "Consultoria imobiliária especializada em imóveis de médio e alto padrão em São José dos Campos. Atendimento consultivo, análise patrimonial e oportunidades selecionadas.",

  applicationName: "B&B Consultoria Imobiliária",

  keywords: [
    "imóveis São José dos Campos",
    "casas Urbanova",
    "apartamentos Jardim Aquarius",
    "consultoria imobiliária",
    "alto padrão",
    "casas em condomínio",
    "imóveis de luxo",
    "imobiliária São José dos Campos",
    "B&B Consultoria Imobiliária",
  ],

  authors: [
    {
      name: "B&B Consultoria Imobiliária",
    },
  ],

  creator: "B&B Consultoria Imobiliária",

  publisher: "B&B Consultoria Imobiliária",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://bbconsultoriaimobiliaria-premium.vercel.app",
    siteName: "B&B Consultoria Imobiliária",
    title: "B&B Consultoria Imobiliária",
    description:
      "Consultoria imobiliária especializada em imóveis de médio e alto padrão em São José dos Campos.",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "B&B Consultoria Imobiliária",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "B&B Consultoria Imobiliária",
    description:
      "Consultoria imobiliária especializada em imóveis de médio e alto padrão em São José dos Campos.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-white">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}