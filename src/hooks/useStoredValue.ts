"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT_NAME = "erm-storage-update";

function dispatchUpdate() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

/**
 * Reads/writes a localStorage string value as an external store, so
 * client-only persisted preferences never need setState-in-effect.
 */
export function useStoredValue(key: string, defaultValue: string) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener(EVENT_NAME, callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener(EVENT_NAME, callback);
    };
  }, []);

  const getSnapshot = useCallback(
    () => window.localStorage.getItem(key) ?? defaultValue,
    [key, defaultValue],
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: string) => {
      window.localStorage.setItem(key, next);
      dispatchUpdate();
    },
    [key],
  );

  return [value, setValue] as const;
}
