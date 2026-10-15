"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ADVERTISING_RELEASE_READY,
  CONSENT_GRANT_CONFIRMED_EVENT,
  GTM_ID,
  PRIVACY_CHOICE_EVENT,
  advertisingWasLoaded,
  confirmAdvertisingGrant,
  startAdvertising,
  stopAdvertising,
} from "../../lib/privacy/advertising";
import { CONSENT_KEY } from "../../lib/privacy/consent";

/** GTM remains unmounted until the release interlock and browser choice allow it. */
export default function ConsentAwareTagManager() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!ADVERTISING_RELEASE_READY) return;
    function sync() {
      if (startAdvertising()) {
        setEnabled(true);
      } else {
        stopAdvertising();
        setEnabled(false);
        // A loaded third-party script cannot be unloaded by removing JSX.
        if (advertisingWasLoaded()) window.location.reload();
      }
    }
    sync();
    window.addEventListener(CONSENT_GRANT_CONFIRMED_EVENT, confirmAdvertisingGrant);
    window.addEventListener(PRIVACY_CHOICE_EVENT, sync);
    function onStorage(event: StorageEvent) {
      if (event.key !== CONSENT_KEY && event.key !== null) return;
      // A choice changed in another tab invalidates the pending confirmation first.
      stopAdvertising();
      if (advertisingWasLoaded()) window.location.reload();
      else sync();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener(CONSENT_GRANT_CONFIRMED_EVENT, confirmAdvertisingGrant);
      window.removeEventListener(PRIVACY_CHOICE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, [pathname]);

  if (!ADVERTISING_RELEASE_READY || !enabled) return null;
  return <GoogleTagManager gtmId={GTM_ID} />;
}
