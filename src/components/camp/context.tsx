import { createContext, useContext } from "react";
import type { CampState } from "@/lib/game/player-api";

type CampCtx = {
  camp: CampState | null;
  setCamp: (c: CampState) => void;
};

const Ctx = createContext<CampCtx | null>(null);

export function CampProvider({
  value,
  children,
}: {
  value: CampCtx;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCampCtx() {
  const v = useContext(Ctx);
  if (!v) throw new Error("Camp missing");
  return v;
}
