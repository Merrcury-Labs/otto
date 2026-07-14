"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface YjsProviderValue {
  doc: Y.Doc | null;
  provider: WebsocketProvider | null;
  connected: boolean;
}

const YjsContext = createContext<YjsProviderValue>({
  doc: null,
  provider: null,
  connected: false,
});

interface YjsProviderProps {
  documentId: string;
  user?: { name: string; color: string };
  children: ReactNode;
}

/**
 * YjsProvider — wraps editor components to provide Yjs document sync.
 * Connects to the Hocuspocus collaboration server via WebSocket.
 */
export function YjsProvider({
  documentId,
  user,
  children,
}: YjsProviderProps) {
  const [value, setValue] = useState<YjsProviderValue>({
    doc: null,
    provider: null,
    connected: false,
  });

  useEffect(() => {
    const collabUrl =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_COLLAB_URL ?? "ws://localhost:1234"
        : "ws://localhost:1234";

    const token = process.env.NEXT_PUBLIC_COLLAB_SECRET ?? "";

    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      collabUrl,
      documentId,
      doc,
      {
        params: token ? { token } : undefined,
        connect: true,
      }
    );

    // Set user awareness for collaboration cursors
    if (user) {
      provider.awareness.setLocalStateField("user", {
        name: user.name,
        color: user.color,
        colorLight: user.color + "33",
      });
    }

    // Track connection status
    const onStatus = ({ status }: { status: string }) => {
      setValue((prev) => ({
        ...prev,
        connected: status === "connected",
      }));
    };

    provider.on("status", onStatus);

    setValue({ doc, provider, connected: false });

    return () => {
      provider.off("status", onStatus);
      provider.destroy();
      doc.destroy();
    };
  }, [documentId, user?.name, user?.color]);

  return <YjsContext.Provider value={value}>{children}</YjsContext.Provider>;
}

export function useYjsProvider() {
  return useContext(YjsContext);
}
