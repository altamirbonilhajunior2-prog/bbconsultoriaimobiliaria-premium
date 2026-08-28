export function trackWhatsAppClick(details: Record<string, string> = {}) {
  const win = window as typeof window & { dataLayer?: Record<string, unknown>[] };

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ event: "whatsapp_click", ...details });
}
