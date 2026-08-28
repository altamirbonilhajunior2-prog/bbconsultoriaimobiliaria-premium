export function trackWhatsAppClick() {
  const win = window as typeof window & {
    dataLayer?: Record<string, unknown>[];
  };

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({
    event: "whatsapp_click",
  });
}
