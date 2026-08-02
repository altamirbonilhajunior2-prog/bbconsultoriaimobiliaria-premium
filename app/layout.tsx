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
  metadataBase: new URL("https://www.bbconsultoriaimobiliaria.com.br"),

  title: {
    default: "B&B Consultoria Imobiliária",
    template: "%s | B&B Consultoria Imobiliária",
  },

  description:
    "Consultoria imobiliária especializada em imóveis de médio e alto padrão em São José dos Campos. Atendimento personalizado, análise patrimonial e oportunidades selecionadas.",

  keywords: [
    "imóveis São José dos Campos",
    "consultoria imobiliária",
    "Urbanova",
    "Jardim Aquarius",
    "Colinas",
    "Altos do Esplanada",
    "casas alto padrão",
    "apartamentos São José dos Campos",
    "B&B Consultoria Imobiliária",
  ],

  authors: [
    {
      name: "B&B Consultoria Imobiliária",
    },
  ],

  creator: "B&B Consultoria Imobiliária",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "B&B Consultoria Imobiliária",
    description:
      "Consultoria imobiliária especializada em imóveis de médio e alto padrão em São José dos Campos.",
    siteName: "B&B Consultoria Imobiliária",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "B&B Consultoria Imobiliária",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
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