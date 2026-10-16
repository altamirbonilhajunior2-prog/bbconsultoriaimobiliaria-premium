import { browserConsent } from "./browser-consent";
export { REVOCATION_PENDING } from "./browser-consent";

const CAMPAIGN_KEY = "bb.privacy.campaign.v1";
export function clearCampaign() {
  try { window.sessionStorage.removeItem(CAMPAIGN_KEY); } catch { /* optional storage */ }
}
export function clientAttribution(): Record<string, string> {
  try {
    const choice = browserConsent().current();
    if (!choice) { clearCampaign(); return {}; }
    const query = new URL(window.location.href).searchParams;
    const fields: Record<string, string> = {};
    for (const [field, param] of Object.entries({ utmSource: "utm_source", utmMedium: "utm_medium",
      utmCampaign: "utm_campaign", utmTerm: "utm_term", utmContent: "utm_content", gclid: "gclid" })) {
      const value = query.get(param);
      if (value) fields[field] = value.slice(0, field === "gclid" ? 255 : 250);
    }
    const existing = window.sessionStorage.getItem(CAMPAIGN_KEY);
    const serialized = JSON.stringify({ revision: choice.revision, fields });
    if (Object.keys(fields).length && existing !== serialized) window.sessionStorage.setItem(CAMPAIGN_KEY, serialized);
    const saved = JSON.parse(window.sessionStorage.getItem(CAMPAIGN_KEY) ?? "null");
    return { ...(saved?.revision === choice.revision ? saved.fields : fields), advertisingConsent: "true" };
  } catch { return {}; }
}
