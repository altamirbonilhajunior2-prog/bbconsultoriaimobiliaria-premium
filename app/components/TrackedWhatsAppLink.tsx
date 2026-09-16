"use client";

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
  function handleClick(
    event:
      MouseEvent<HTMLAnchorElement>,
  ) {
    trackWhatsAppClick();

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

      const redirectParams =
        new URLSearchParams();

      redirectParams.set(
        "target",
        href,
      );

      redirectParams.set(
        "sourcePage",
        `${currentUrl.pathname}${currentUrl.search}`,
      );

      if (propertyCode) {
        redirectParams.set(
          "propertyCode",
          propertyCode,
        );
      }

      if (document.referrer) {
        redirectParams.set(
          "referrer",
          document.referrer,
        );
      }

      const campaignParams = [
        [
          "utm_source",
          "utmSource",
        ],
        [
          "utm_medium",
          "utmMedium",
        ],
        [
          "utm_campaign",
          "utmCampaign",
        ],
        [
          "utm_term",
          "utmTerm",
        ],
        [
          "utm_content",
          "utmContent",
        ],
        [
          "gclid",
          "gclid",
        ],
      ] as const;

      for (
        const [
          sourceKey,
          destinationKey,
        ] of campaignParams
      ) {
        const value =
          currentUrl.searchParams.get(
            sourceKey,
          );

        if (value) {
          redirectParams.set(
            destinationKey,
            value,
          );
        }
      }

      event.currentTarget.href =
        `/api/whatsapp-redirect?${redirectParams.toString()}`;
    }

    onClick?.(event);
  }

  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={href}
      {...props}
      onClick={handleClick}
    />
  );
}