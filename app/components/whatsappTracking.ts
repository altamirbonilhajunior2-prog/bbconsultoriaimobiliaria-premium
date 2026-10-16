import { trackAdvertisingEvent } from "../../lib/privacy/advertising";

export function trackWhatsAppClick() {
  trackAdvertisingEvent("whatsapp_click");
}
