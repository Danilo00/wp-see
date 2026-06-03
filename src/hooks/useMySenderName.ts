"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wp-see-my-sender";

export function useMySenderName(participants: string[], chatId: string | null) {
  const [myName, setMyName] = useState<string>("");

  useEffect(() => {
    if (!chatId) return;
    const key = `${STORAGE_KEY}:${chatId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setMyName(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    if (participants.length >= 2) {
      setMyName(participants[1]);
    } else if (participants.length === 1) {
      setMyName(participants[0]);
    }
  }, [chatId, participants]);

  const saveMyName = useCallback(
    (name: string) => {
      setMyName(name);
      if (!chatId) return;
      try {
        localStorage.setItem(`${STORAGE_KEY}:${chatId}`, name);
      } catch {
        /* ignore */
      }
    },
    [chatId],
  );

  return { myName, setMyName: saveMyName };
}
