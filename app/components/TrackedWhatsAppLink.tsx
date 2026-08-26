"use client";

import type { ReactNode } from "react";

type TrackedWhatsAppLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function TrackedWhatsAppLink({
  href,
  children,
  className,
}: TrackedWhatsAppLinkProps) {
  function handleClick() {
    console.log("B&B TESTE: clique no WhatsApp detectado");

    const win = window as typeof window & {
      dataLayer?: Record<string, unknown>[];
    };

    win.dataLayer = win.dataLayer || [];

    win.dataLayer.push({
      event: "whatsapp_click",
      whatsapp_source: "property_detail",
      page_location: window.location.href,
    });

    console.log("B&B TESTE: evento enviado ao dataLayer", win.dataLayer);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}