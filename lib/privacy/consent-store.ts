import { CONSENT_KEY, parseChoice, type Choice } from "./consent";
export type PreferenceStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function readChoice(storage: PreferenceStorage, now = Date.now()): Choice | null {
  try { return parseChoice(storage.getItem(CONSENT_KEY), now); } catch { return null; }
}
export function writeChoice(storage: PreferenceStorage, choice: Choice): boolean {
  try {
    storage.setItem(CONSENT_KEY, JSON.stringify(choice));
    return readChoice(storage)?.revision === choice.revision;
  } catch { return false; }
}
export function invalidateChoice(storage: PreferenceStorage): boolean {
  try { storage.removeItem(CONSENT_KEY); return storage.getItem(CONSENT_KEY) === null; }
  catch { return false; }
}
