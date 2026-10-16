export const CONSENT_VERSION = "bb-advertising-v1";
export const CONSENT_KEY = "bb.privacy.choice.v1";
export const CONSENT_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;
export type Choice = {
  version: typeof CONSENT_VERSION;
  advertising: boolean;
  decidedAt: number;
  expiresAt: number;
  revision: string;
  sessionId?: string;
  serverRevision?: number;
  sessionExpiresAt?: number;
  denialEpoch?: string;
};
export function createChoice(advertising: boolean, now = Date.now()): Choice {
  return { version: CONSENT_VERSION, advertising, decidedAt: now,
    expiresAt: now + CONSENT_LIFETIME_MS, revision: crypto.randomUUID() };
}
export function parseChoice(raw: string | null, now = Date.now()): Choice | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return null;
    const c = value as Partial<Choice>;
    if (c.version !== CONSENT_VERSION || typeof c.advertising !== "boolean" ||
      !Number.isSafeInteger(c.decidedAt) || !Number.isSafeInteger(c.expiresAt) ||
      c.decidedAt! > now || c.decidedAt! < 0 || c.expiresAt! <= now ||
      c.expiresAt! - c.decidedAt! !== CONSENT_LIFETIME_MS ||
      typeof c.revision !== "string" || !/^[a-zA-Z0-9-]{16,64}$/.test(c.revision)) return null;
    return c as Choice;
  } catch { return null; }
}
export function isPublicPath(input: string): boolean {
  try {
    const path = decodeURIComponent(input.split(/[?#]/, 1)[0]);
    // Reject ambiguous/noncanonical paths instead of normalizing them into public routes.
    if (!path.startsWith("/") || /[\\%\s?#]/.test(path) || path.includes("//")) {
      return false;
    }
    if (path.split("/").some((segment) => segment === "." || segment === "..")) {
      return false;
    }
    const normalized = path.replace(/\/+$/, "").toLowerCase();
    return !["/admin", "/login-admin", "/api"].some(
      (prefix) => normalized === prefix || normalized.startsWith(prefix + "/"),
    );
  } catch {
    return false;
  }
}
export function googleConsent(advertising: boolean) {
  const ads = advertising ? "granted" : "denied";
  return { ad_storage: ads, ad_user_data: ads, ad_personalization: ads,
    analytics_storage: "denied" } as const;
}
