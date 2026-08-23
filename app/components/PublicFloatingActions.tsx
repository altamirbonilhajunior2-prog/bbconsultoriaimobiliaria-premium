"use client";

import { usePathname } from "next/navigation";

import IrisAssistant from "./IrisAssistant";
import WhatsAppButton from "./WhatsAppButton";

export default function PublicFloatingActions() {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login-admin";

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <IrisAssistant />
      <WhatsAppButton />
    </>
  );
}