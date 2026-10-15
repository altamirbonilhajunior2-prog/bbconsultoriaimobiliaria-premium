"use client";

import { clientAttribution } from "../../lib/privacy/client-attribution";

import { useRef } from "react";

import type {
  ComponentPropsWithoutRef,
  MouseEvent,
} from "react";

import { trackWhatsAppClick } from "./whatsappTracking";

type TrackedWhatsAppLinkProps =
  ComponentPropsWithoutRef<"a">;

function isWhatsAppHref(
  href: unknown,
) {
  if (
    typeof href !== "string"
  ) {
    return false;
  }

  try {
    const url =
      new URL(href);

    return (
      url.protocol ===
        "https:" &&
      (
        url.hostname ===
          "wa.me" ||
        url.hostname ===
          "api.whatsapp.com"
      )
    );
  } catch {
    return false;
  }
}

export default function TrackedWhatsAppLink({
  onClick,
  href,
  ...props
}: TrackedWhatsAppLinkProps) {
  const interaction = useRef<{ id: string; at: number; href: string; sourcePage: string } | null>(null);
  function handleClick(
    event:
      MouseEvent<HTMLAnchorElement>,
  ) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (
      typeof href ===
        "string" &&
      isWhatsAppHref(
        href,
      )
    ) {
      const currentUrl =
        new URL(
          window.location.href,
        );

      const propertyMatch =
        currentUrl.pathname.match(
          /^\/imovel\/([^/]+)/i,
        );

      const propertyCode =
        propertyMatch?.[1]
          ? decodeURIComponent(
              propertyMatch[1],
            ).toUpperCase()
          : null;

      const targetUrl = new URL(href);
      for (const key of Array.from(targetUrl.searchParams.keys())) {
        if (key !== "text" && key !== "phone") targetUrl.searchParams.delete(key);
      }
      targetUrl.hash = "";

      const redirectParams = new URLSearchParams();
      try {
        const now = Date.now();
        const repeated = interaction.current?.href === href &&
          interaction.current.sourcePage === currentUrl.pathname && now - interaction.current.at < 1500;
        if (!repeated) {
          interaction.current = { id: crypto.randomUUID(), at: now, href, sourcePage: currentUrl.pathname };
          trackWhatsAppClick();
        }
        redirectParams.set("interactionId", interaction.current!.id);
      } catch { return; } // Keep the original operational link if crypto is unavailable.

      redirectParams.set(
        "target",
        targetUrl.toString(),
      );

      redirectParams.set(
        "sourcePage",
        currentUrl.pathname,
      );

      for (const [key, value] of Object.entries(clientAttribution())) redirectParams.set(key, value);

      if (propertyCode) {
        redirectParams.set(
          "propertyCode",
          propertyCode,
        );
      }

      event.currentTarget.href =
        `/api/whatsapp-redirect?${redirectParams.toString()}`;
    }

  }

  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={href}
      {...props}
      referrerPolicy="no-referrer"
      onClick={handleClick}
    />
  );
}
