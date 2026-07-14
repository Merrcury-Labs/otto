"use client";

import { useState, useEffect } from "react";

interface YjsStatus {
  connected: boolean;
  syncing: boolean;
}

/**
 * Hook to track Yjs WebSocket provider connection status.
 * Returns { connected, syncing } — used to show a status indicator
 * in the editor when collaboration is active.
 *
 * Phase 2: Will be wired to the actual WebSocket provider events.
 */
export function useYjsStatus(): YjsStatus {
  const [status, setStatus] = useState<YjsStatus>({
    connected: false,
    syncing: false,
  });

  useEffect(() => {
    // Placeholder — will be replaced in Phase 2 with real provider events
    setStatus({ connected: false, syncing: false });
  }, []);

  return status;
}
