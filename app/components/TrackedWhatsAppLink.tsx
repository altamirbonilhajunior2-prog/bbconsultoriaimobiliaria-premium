"use client";

import type {
  ComponentPropsWithoutRef,
  MouseEvent,
} from "react";
import { trackWhatsAppClick } from "./whatsappTracking";

type TrackedWhatsAppLinkProps =
  ComponentPropsWithoutRef<"a">;

export default function TrackedWhatsAppLink({
  onClick,
  ...props
}: TrackedWhatsAppLinkProps) {
  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    trackWhatsAppClick();
    onClick?.(event);
  }

  return (
    <a
      target="_blank"
      rel="noreferrer"
      {...props}
      onClick={handleClick}
    />
  );
}
