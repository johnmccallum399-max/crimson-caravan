import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dealBlackjack, playBlackjack } from "@/lib/game/player-api";
import { cn } from "@/lib/utils";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

type Card = { r: number; s: number };

function CardFace({ card }: { card: Card }) {
  const red = card.s === 1 || card.s === 2;
  return (
    <span
      className={cn(
        "inline-flex h-16 w-12 items-center justify-center rounded-md border border-border bg-cream font-mono text-sm font-medium",
        red ? "text-accent" : "text-gold-fg",
      )}
    >
      {RANKS[card.r - 1]}
      {SUITS[card.s]}
    </span>
  );
}

export function BlackjackTable({
  locked,
  onCamp,
}: {
  locked: boolean;
  onCamp: (camp: Awaited<ReturnType<typeof dealBlackjack>>["camp"]) => void;
}) {
  const [bet, setBet] = useState(2);
  const [busy, setBusy] = useState(false);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [done, setDone] = useState(true);
  const [result, setResult] = useState("Deal to sit.");
  const [totals, setTotals] = useState({ p: 0, d: 0 });

  const apply = (res: {
    player: Card[];
    dealer: Card[];
    done: boolean;
    result: string;
    total: number;
    dealerTotal: number;
    win: number;
    camp: Awaited<ReturnType<typeof dealBlackjack>>["camp"];
    multiplied: boolean;
  }) => {
    setPlayer(res.player);
    setDealer(res.dealer);
    setDone(res.done);
    setResult(res.result);
    setTotals({ p: res.total, d: res.dealerTotal });
    onCamp(res.camp);
    if (res.multiplied) toast("The cards doubled your experience.");
  };

  return (
    <div className="rounded-xl border border-border bg-surface/90 p-5">
      <p className="text-xs tracking-wide text-muted uppercase">Dealer · {totals.d || "—"}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {dealer.map((c, i) => (
          <CardFace key={`d-${i}`} card={c} />
        ))}
      </div>
      <p className="mt-5 text-xs tracking-wide text-muted uppercase">You · {totals.p || "—"}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {player.map((c, i) => (
          <CardFace key={`p-${i}`} card={c} />
        ))}
      </div>
      <p className="mt-4 font-display text-lg capitalize">{result}</p>
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 5, 10].map((n) => (
          <Button
            key={n}
            type="button"
            size="sm"
            variant={bet === n ? "gold" : "outline"}
            disabled={!done}
            onClick={() => setBet(n)}
          >
            {n}
          </Button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {done ? (
          <Button
            className="flex-1"
            disabled={locked || busy}
            onClick={async () => {
              setBusy(true);
              try {
                apply(await dealBlackjack({ data: { bet } }));
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "No seat.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Deal {bet}
          </Button>
        ) : (
          <>
            <Button
              className="flex-1"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  apply(await playBlackjack({ data: { action: "hit" } }));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "No hit.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Hit
            </Button>
            <Button
              className="flex-1"
              variant="gold"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  apply(await playBlackjack({ data: { action: "stand" } }));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "No stand.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Stand
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
