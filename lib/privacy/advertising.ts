import { CONSENT_KEY, isPublicPath, type Choice } from "./consent";
import { browserConsent } from "./browser-consent";

export const GTM_ID = "GTM-PFRXG4HN";
export const META_PIXEL_ID = "1438566438417554";
// The GTM workspace still needs consent configuration and network validation.
export const ADVERTISING_RELEASE_READY = false;
export const PRIVACY_CHOICE_EVENT = "bb:privacy-choice";
export const CONSENT_GRANTED_EVENT = "bb_consent_granted";
export const CONSENT_REVOKED_EVENT = "bb_consent_revoked";
export const CONSENT_GRANT_CONFIRMED_EVENT = "bb:consent-grant-confirmed";
export const ADVERTISING_READY_EVENT = "bb_advertising_ready";

type AdvertisingWindow = Window & {
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
};
type EventName = "whatsapp_click" | "portal_lead_created";
let readyRevision: string | null = null;
let pendingGrant: { requestId: string; revision: string } | null = null;
let stopped = false;
let loaderStarted = false;
let loadedRevision: string | null = null;

export function permitsAdvertising(
  choice: Choice | null,
  pathname: string,
  now = Date.now(),
  releaseReady: boolean = ADVERTISING_RELEASE_READY,
): boolean {
  return Boolean(
    releaseReady && choice?.advertising && choice.expiresAt > now &&
    isPublicPath(pathname),
  );
}

export function currentChoice(): Choice | null {
  if (typeof window === "undefined") return null;
  try { return browserConsent().current(); } catch { return null; }
}

export function canAdvertise(): boolean {
  if (typeof window === "undefined" || stopped) return false;
  const choice = currentChoice();
  return permitsAdvertising(choice, window.location.pathname) &&
    readyRevision === choice?.revision;
}

/** Browser choice controls tags only; it is not CRM consent proof. */
export function startAdvertising(): boolean {
  if (typeof window === "undefined") return false;
  const choice = currentChoice();
  if (!permitsAdvertising(choice, window.location.pathname)) return false;
  // Once GTM has been mounted, a changed choice needs a fresh page load.
  if (loaderStarted && loadedRevision !== choice!.revision) return false;
  if (pendingGrant?.revision === choice!.revision || readyRevision === choice!.revision) return true;
  let requestId: string;
  try { requestId = crypto.randomUUID(); } catch { return false; }
  stopped = false;
  readyRevision = null;
  pendingGrant = { requestId, revision: choice!.revision };
  (window as AdvertisingWindow).dataLayer ??= [];
  (window as AdvertisingWindow).dataLayer!.push({
    event: CONSENT_GRANTED_EVENT,
    bb_consent_request_id: requestId,
  });
  loaderStarted = true;
  loadedRevision = choice!.revision;
  return true;
}

export function matchesGrantConfirmation(
  detail: unknown,
  pending: { requestId: string; revision: string } | null,
  choice: Choice | null,
  pathname: string,
  loadedChoiceRevision: string | null,
  releaseReady: boolean = ADVERTISING_RELEASE_READY,
): boolean {
  if (!pending || !detail || typeof detail !== "object" ||
    !permitsAdvertising(choice, pathname, Date.now(), releaseReady) ||
    choice?.revision !== pending.revision || loadedChoiceRevision !== pending.revision) return false;
  const confirmation = detail as { requestId?: unknown; status?: unknown };
  return confirmation.status === "granted" && confirmation.requestId === pending.requestId;
}

/** Only the sequenced GTM confirmation can release events for this choice. */
export function confirmAdvertisingGrant(event: Event): boolean {
  if (typeof window === "undefined" || !ADVERTISING_RELEASE_READY || stopped || !pendingGrant ||
    !(event instanceof CustomEvent)) return false;
  const choice = currentChoice();
  if (!matchesGrantConfirmation(event.detail, pendingGrant, choice,
    window.location.pathname, loadedRevision)) return false;
  readyRevision = choice!.revision;
  pendingGrant = null;
  (window as AdvertisingWindow).dataLayer?.push({
    event: ADVERTISING_READY_EVENT,
    bb_consent_request_id: event.detail.requestId,
    bb_consent_revision: choice!.revision,
    bb_public_page: true,
  });
  return true;
}

export function advertisingWasLoaded(): boolean {
  return loaderStarted;
}

export function trackAdvertisingEvent(
  event: EventName,
  fields: { property_code?: string; lead_origin?: string } = {},
): boolean {
  try {
    if (!canAdvertise()) return false;
    const choice = currentChoice();
    if (!choice || choice.revision !== readyRevision) return false;
    const target = window as AdvertisingWindow;
    (target.dataLayer ??= []).push({
      event,
      ...(fields.property_code ? { property_code: fields.property_code.slice(0, 80) } : {}),
      ...(fields.lead_origin ? { lead_origin: fields.lead_origin.slice(0, 40) } : {}),
      bb_consent_revision: choice.revision,
      bb_public_page: true,
    });
    return true;
  } catch {
    return false; // Tracking never interrupts forms, WhatsApp, or Iris.
  }
}

export function stopAdvertising(): void {
  const hadActiveChoice = pendingGrant !== null || readyRevision !== null;
  stopped = true;
  pendingGrant = null;
  readyRevision = null;
  if (typeof window === "undefined") return;
  const target = window as AdvertisingWindow;
  try { target.fbq?.("consent", "revoke"); } catch { /* remain blocked */ }
  if (loaderStarted && hadActiveChoice) {
    (target.dataLayer ??= []).push({
      event: CONSENT_REVOKED_EVENT,
      bb_consent_request_id: null,
      bb_consent_revision: null,
    });
  }
}

export function clearAdvertisingCookies() {
  // Only known advertising cookie families; never clear authentication cookies.
  const names = document.cookie.split(";").map((part) => part.trim().split("=")[0])
    .filter((name) => /^(_fbp|_fbc|_gcl_[a-zA-Z0-9_]+)$/.test(name));
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = ["", host, ...parts.slice(1, -1).map((_, i) => parts.slice(i + 1).join("."))];
  for (const name of names) for (const domain of domains) {
    document.cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax" +
      (domain ? "; Domain=" + domain : "") +
      (window.location.protocol === "https:" ? "; Secure" : "");
  }
}
export { CONSENT_KEY };
