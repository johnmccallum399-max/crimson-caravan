import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { spinRoulette } from "@/lib/game/player-api";
import { cn } from "@/lib/utils";

type Kind = "red" | "black" | "green" | "number";

export function RouletteTable({
  locked,
  onCamp,
}: {
  locked: boolean;
  onCamp: (camp: Awaited<ReturnType<typeof spinRoulette>>["camp"]) => void;
}) {
  const [bet, setBet] = useState(2);
  const [kind, setKind] = useState<Kind>("red");
  const [number, setNumber] = useState(17);
  const [busy, setBusy] = useState(false);
  const [pocket, setPocket] = useState<number | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [win, setWin] = useState<number | null>(null);

  const spin = async () => {
    if (locked || busy) return;
    setBusy(true);
    try {
      const result = await spinRoulette({
        data: { bet, kind, number: kind === "number" ? number : undefined },
      });
      setPocket(result.pocket);
      setColor(result.color);
      setWin(result.win);
      onCamp(result.camp);
      if (result.multiplied) toast("The cards doubled your experience.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The wheel stuck.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface/90 p-5">
      <div
        className={cn(
          "mx-auto grid size-40 place-items-center rounded-full border-4 border-gold font-display text-3xl",
          color === "red"
            ? "bg-accent"
            : color === "black"
              ? "bg-bg"
              : color === "green"
                ? "bg-raised"
                : "bg-raised",
        )}
      >
        {pocket === null ? "—" : pocket}
      </div>
      <p className="mt-3 text-center font-mono text-lg tabular-nums">
        {win === null ? "Place a chip" : win > 0 ? `+${win}` : "Lost"}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(["red", "black", "green", "number"] as const).map((k) => (
          <Button
            key={k}
            type="button"
            size="sm"
            variant={kind === k ? "gold" : "outline"}
            onClick={() => setKind(k)}
          >
            {k}
          </Button>
        ))}
      </div>
      {kind === "number" ? (
        <Input
          type="number"
          min={0}
          max={36}
          className="mx-auto mt-3 max-w-32"
          value={number}
          onChange={(e) => setNumber(Number(e.target.value))}
        />
      ) : null}
      <div className="mt-4 flex justify-center gap-2">
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
      <Button className="mt-4 w-full" disabled={locked || busy} onClick={() => void spin()}>
        {busy ? "The wheel turns…" : `Bet ${bet}`}
      </Button>
    </div>
  );
}
