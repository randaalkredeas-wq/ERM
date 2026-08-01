"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True only after the component has mounted on the client. */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
