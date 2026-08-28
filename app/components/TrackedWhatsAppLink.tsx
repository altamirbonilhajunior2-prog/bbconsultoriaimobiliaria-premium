"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { trackWhatsAppClick } from "./whatsappTracking";

type TrackedWhatsAppLinkProps = ComponentPropsWithoutRef<"a"> & {
  trackingData?: Record<string, string>;
};

export default function TrackedWhatsAppLink({ onClick, trackingData, ...props }: TrackedWhatsAppLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackWhatsAppClick(trackingData);
    onClick?.(event);
  }

  return <a target="_blank" rel="noreferrer" {...props} onClick={handleClick} />;
}
