import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { spinSlots } from "@/lib/game/player-api";
import { SLOT_SYMBOLS, type SlotId } from "@/lib/game/rules";
import { cn } from "@/lib/utils";

const FACE: Record<SlotId, string> = {
  lantern: "Lantern",
  rose: "Rose",
  coin: "Coin",
  horseshoe: "Shoe",
  wagon: "Wagon",
  gem: "Gem",
};

export function SlotsTable({
  locked,
  onCamp,
}: {
  locked: boolean;
  onCamp: (camp: Awaited<ReturnType<typeof spinSlots>>["camp"]) => void;
}) {
  const [bet, setBet] = useState(2);
  const [reels, setReels] = useState<SlotId[]>(["lantern", "rose", "coin"]);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const spin = async () => {
    if (locked || spinning) return;
    setSpinning(true);
    setLastWin(null);
    try {
      const result = await spinSlots({ data: { bet } });
      setReels(result.reels);
      setLastWin(result.win);
      onCamp(result.camp);
      if (result.multiplied) toast("The cards doubled your experience.");
      if (result.bypassEarned) toast("A free lantern hour was earned.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The reels jammed.");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface/90 p-5">
      <div className="grid grid-cols-3 gap-2">
        {reels.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className={cn(
              "grid aspect-square place-items-center rounded-lg border border-border bg-raised font-display text-sm font-semibold",
              spinning && "opacity-70",
            )}
          >
            {FACE[id]}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-lg tabular-nums">
        {lastWin === null ? "—" : lastWin > 0 ? `+${lastWin}` : "—"}
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        {[1, 2, 5, 10].map((n) => (
          <Button
            key={n}
            type="button"
            size="sm"
            variant={bet === n ? "gold" : "outline"}
            onClick={() => setBet(n)}
          >
            {n}
          </Button>
        ))}
      </div>
      <Button
        type="button"
        className="mt-4 w-full"
        disabled={locked || spinning}
        onClick={() => void spin()}
      >
        {spinning ? "Spinning…" : `Spin for ${bet}`}
      </Button>
      <ul className="mt-4 grid grid-cols-2 gap-1 text-xs text-subtle">
        {SLOT_SYMBOLS.map((s) => (
          <li key={s.id}>
            Three {s.label.toLowerCase()}s · {s.pay}×
          </li>
        ))}
      </ul>
    </div>
  );
}
