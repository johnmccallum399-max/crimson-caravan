import { useCallback, useEffect, useState } from "react";
import {
  addPlayTime,
  buyBypass,
  getCamp,
  setAgeOk,
  useBypass,
  type CampState,
} from "@/lib/game/player-api";

export function useCamp() {
  const [camp, setCamp] = useState<CampState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getCamp();
      setCamp(next);
      setError(null);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camp is closed.");
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const tickPlay = useCallback(async (ms: number) => {
    try {
      const next = await addPlayTime({ data: { ms } });
      setCamp(next);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    camp,
    error,
    setCamp,
    refresh,
    tickPlay,
    confirmAge: async () => {
      const next = await setAgeOk();
      setCamp(next);
    },
    purchaseHour: async () => {
      const next = await buyBypass();
      setCamp(next);
    },
    lightLantern: async () => {
      const next = await useBypass();
      setCamp(next);
    },
  };
}
