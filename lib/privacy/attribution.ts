import { isPublicPath } from "./consent";

/**
 * Temporary rule: campaign attribution may only return after server-verifiable
 * advertising consent exists. Until then, retain operational page context only.
 */
export function operationalSource(input: string): string {
  try {
    const url = new URL(input, "https://portal.invalid");
    if (url.origin !== "https://portal.invalid") return "/";
    const path = url.pathname;
    return path.length <= 1000 && isPublicPath(path) ? path : "/";
  } catch {
    return "/";
  }
}

export function sanitizeWhatsAppTarget(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" ||
      !["wa.me", "api.whatsapp.com"].includes(url.hostname)) return null;
    // Preserve WhatsApp's operational message/phone only.
    for (const key of Array.from(url.searchParams.keys())) {
      if (!["text", "phone"].includes(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
