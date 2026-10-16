import { CONSENT_VERSION, createChoice, type Choice } from "./consent";
import { readChoice, writeChoice } from "./consent-store";

export const REVOCATION_PENDING = "bb.privacy.revocation-pending.v1";
export const DENIAL_EPOCH = "bb.privacy.denial-epoch.v1";
export const CONSENT_LOCK = "bb.privacy.consent";
type Snapshot = { success: true; sessionId: string; revision: number; sessionToken: string;
  sessionExpiresAt: number; advertising: boolean; issuedAt?: number; expiresAt?: number };
type Dependencies = {
  storage: Storage;
  request: (method: "GET" | "POST", body?: object) => Promise<Snapshot>;
  lock: <T>(action: () => Promise<T>) => Promise<T>;
};

// Each document starts blocked. Persistent browser data alone never enables collection.
export class BrowserConsent {
  private allowedRevision: string | null = null;
  private generation = 0;
  private requiresExplicitChoice = false;
  private synchronization: Promise<void> | null = null;
  constructor(private dependencies: Dependencies) {}
  block(requireExplicitChoice = false) {
    this.allowedRevision = null; this.generation++;
    this.requiresExplicitChoice ||= requireExplicitChoice;
  }
  current(): Choice | null {
    try {
      const { storage } = this.dependencies;
      const choice = readChoice(storage);
      return choice?.advertising && choice.revision === this.allowedRevision &&
        Number.isSafeInteger(choice.sessionExpiresAt) && choice.sessionExpiresAt! > Date.now() &&
        !storage.getItem(REVOCATION_PENDING) && choice.denialEpoch === (storage.getItem(DENIAL_EPOCH) ?? "") ? choice : null;
    } catch { this.block(); return null; }
  }
  sync(): Promise<void> {
    if (this.synchronization) return this.synchronization;
    const pending = this.synchronize().finally(() => {
      if (this.synchronization === pending) this.synchronization = null;
    });
    this.synchronization = pending;
    return pending;
  }
  private async synchronize(): Promise<void> {
    this.block();
    const generation = this.generation;
    await this.dependencies.lock(async () => {
      const { storage, request } = this.dependencies;
      if (generation !== this.generation) return;
      const choice = readChoice(storage);
      if (this.requiresExplicitChoice || !choice?.advertising || storage.getItem(REVOCATION_PENDING)) return;
      const state = await request("GET");
      if (generation !== this.generation || readChoice(storage)?.revision !== choice.revision) return;
      if (state.advertising && choice.sessionId === state.sessionId && choice.serverRevision === state.revision &&
        choice.sessionExpiresAt === state.sessionExpiresAt && state.sessionExpiresAt > Date.now() &&
        choice.decidedAt === state.issuedAt && choice.expiresAt === state.expiresAt &&
        choice.denialEpoch === (storage.getItem(DENIAL_EPOCH) ?? "") && !storage.getItem(REVOCATION_PENDING))
        this.allowedRevision = choice.revision;
    });
  }
  async save(advertising: boolean): Promise<Choice> {
    this.block(true);
    const generation = this.generation;
    const { request, lock } = this.dependencies;
    let storage: Storage | undefined;
    const operation = crypto.randomUUID();
    let epoch = "";
    let persisted = false;
    try {
      storage = this.dependencies.storage;
      if (!advertising) storage.setItem(DENIAL_EPOCH, operation);
      epoch = storage.getItem(DENIAL_EPOCH) ?? "";
      storage.setItem(REVOCATION_PENDING, operation);
      persisted = writeChoice(storage, createChoice(false)) && storage.getItem(REVOCATION_PENDING) === operation;
    } catch { /* Revocation must still reach the server if local storage fails. */ }
    if (advertising && !persisted) throw new Error("Preference storage unavailable");
    return lock(async () => {
      const state = await request("GET");
      const stillCurrent = () => generation === this.generation &&
        storage?.getItem(REVOCATION_PENDING) === operation && (storage.getItem(DENIAL_EPOCH) ?? "") === epoch;
      if (advertising && !stillCurrent()) throw new Error("Choice superseded");
      const result = await request("POST", { advertising, version: CONSENT_VERSION,
        sessionToken: state.sessionToken, expectedRevision: state.revision });
      if (result.advertising !== advertising || result.sessionId !== state.sessionId || result.revision < state.revision)
        throw new Error("Invalid consent response");
      const choice = { ...createChoice(advertising), sessionId: result.sessionId,
        serverRevision: result.revision, sessionExpiresAt: result.sessionExpiresAt, denialEpoch: epoch };
      if (advertising) { choice.decidedAt = result.issuedAt!; choice.expiresAt = result.expiresAt!; }
      // The permanent epoch prevents a late grant even if another tab writes between these checks.
      if (!persisted || !storage || !stillCurrent() || !writeChoice(storage, choice)) throw new Error("Choice not saved or superseded");
      if (!stillCurrent()) throw new Error("Choice superseded");
      storage.removeItem(REVOCATION_PENDING);
      if (storage.getItem(REVOCATION_PENDING)) throw new Error("Pending choice cannot be cleared");
      this.requiresExplicitChoice = false;
      if (advertising) this.allowedRevision = choice.revision;
      return choice;
    });
  }
}

let browser: BrowserConsent | undefined;
export function browserConsent(): BrowserConsent {
  return browser ??= new BrowserConsent({
    // Resolve lazily: browsers can throw while accessing the storage property itself.
    get storage() { return window.localStorage; },
    async request(method, body) {
      const response = await fetch("/api/privacy/consent", { method, credentials: "same-origin", cache: "no-store",
        referrerPolicy: "no-referrer", headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("Consent not confirmed");
      const value = await response.json();
      if (value?.success !== true || typeof value.sessionToken !== "string" || typeof value.sessionId !== "string" ||
        !Number.isSafeInteger(value.sessionExpiresAt) || value.sessionExpiresAt <= Date.now() ||
        !Number.isSafeInteger(value.revision) || value.revision < 0 || typeof value.advertising !== "boolean")
        throw new Error("Invalid consent response");
      return value;
    },
    async lock(action) {
      // No unsafe cross-tab fallback. Unsupported browsers remain blocked.
      if (!navigator.locks) throw new Error("Cross-tab coordination unavailable");
      return navigator.locks.request(CONSENT_LOCK, action);
    },
  });
}
