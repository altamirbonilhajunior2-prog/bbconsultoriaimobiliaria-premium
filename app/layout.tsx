import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
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
  metadataBase: new URL("https://www.bbconsultoriaimoveis.com.br"),

  title: {
    default:
      "Imóveis em São José dos Campos | B&B Consultoria Imobiliária",
    template: "%s | B&B Consultoria Imobiliária",
  },

  description:
    "Imóveis à venda e para locação em São José dos Campos, com foco em Urbanova, Jardim Aquarius e bairros selecionados. Curadoria imobiliária, atendimento consultivo e imóveis de médio e alto padrão.",

  applicationName: "B&B Consultoria Imobiliária",

  authors: [
    {
      name: "B&B Consultoria Imobiliária",
    },
  ],

  creator: "B&B Consultoria Imobiliária",

  publisher: "B&B Consultoria Imobiliária",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "B&B Consultoria Imobiliária",
    title: "Imóveis em São José dos Campos | B&B Consultoria Imobiliária",
    description:
      "Imóveis à venda e para locação em São José dos Campos. Curadoria imobiliária, conhecimento local e atendimento consultivo.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Imóveis em São José dos Campos | B&B Consultoria Imobiliária",
    description:
      "Imóveis à venda e para locação em São José dos Campos. Curadoria imobiliária, conhecimento local e atendimento consultivo.",
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

        <GoogleTagManager gtmId="GTM-PFRXG4HN" />
      </body>
    </html>
  );
}