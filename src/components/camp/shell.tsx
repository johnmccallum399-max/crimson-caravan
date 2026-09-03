import { Link, useRouterState } from "@tanstack/react-router";
import { Gem, Hourglass, Sparkles } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import type { CampState } from "@/lib/game/player-api";
import { BYPASS_WAGER } from "@/lib/game/rules";
import { cn, formatClock } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/", label: "Camp" },
  { to: "/slots", label: "Reels" },
  { to: "/blackjack", label: "Wagon 21" },
  { to: "/roulette", label: "Wheel" },
  { to: "/fortune", label: "Madame" },
  { to: "/prizes", label: "Chest" },
  { to: "/vault", label: "Vault" },
] as const;

type ShellProps = {
  camp: CampState | null;
  children: React.ReactNode;
  onBuyHour: () => Promise<void>;
  onUseHour: () => Promise<void>;
};

export function CampShell({ camp, children, onBuyHour, onUseHour }: ShellProps) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [shop, setShop] = useState(false);
  const [blessingLeft, setBlessingLeft] = useState(0);

  useEffect(() => {
    if (!camp?.blessingUntil) {
      setBlessingLeft(0);
      return;
    }
    const tick = () => setBlessingLeft(Math.max(0, camp.blessingUntil! - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [camp?.blessingUntil]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/90 px-3 py-3">
        <Link to="/" className="min-w-0">
          <p className="font-display text-xs tracking-[0.22em] text-muted uppercase">
            Social casino · 18+
          </p>
          <h1 className="font-display text-xl font-semibold tracking-tight text-fg md:text-2xl">
            Crimson Caravan
          </h1>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {camp ? (
            <>
              <Stat icon={<Gem className="size-3.5" />} label={`${camp.diamonds} diamonds`} />
              <Stat label={`Lv ${camp.level}`} />
              <Stat
                icon={<Hourglass className="size-3.5" />}
                label={formatClock(camp.playLeftMs)}
              />
              {blessingLeft > 0 ? (
                <Stat
                  icon={<Sparkles className="size-3.5" />}
                  label={`Blessing ${formatClock(blessingLeft)}`}
                />
              ) : null}
              <Button type="button" variant="gold" size="sm" onClick={() => setShop(true)}>
                Lantern hour
              </Button>
            </>
          ) : null}
          <UserButton />
        </div>
      </header>

      <nav className="mt-3 flex gap-1 overflow-x-auto rounded-lg bg-raised/80 p-1">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "h-10 shrink-0 rounded-md px-3 text-sm font-medium transition-colors",
              path === item.to ? "bg-surface text-fg" : "text-muted hover:text-fg",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="mt-4 flex-1">{children}</main>

      <p className="mt-6 text-center text-xs text-subtle">
        Entertainment only. Diamonds have no cash value. Prizes are digital goods and
        subscriptions. One hour of play every four hours.
      </p>

      <Dialog open={shop} onOpenChange={setShop}>
        <DialogContent>
          <DialogTitle>Lantern hour</DialogTitle>
          <DialogDescription>
            The camp sleeps after an hour. A lantern buys another hour in this window, or
            wait until the four-hour mark. Every {BYPASS_WAGER} diamonds played earns one
            free lantern.
          </DialogDescription>
          {camp ? (
            <div className="mt-4 space-y-3 text-sm">
              <p>
                Free lanterns: <strong>{camp.bypassTokens}</strong>
              </p>
              <p className="text-muted">
                Played toward the next free lantern: {camp.wageredTowards} / {BYPASS_WAGER}
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  disabled={camp.bypassTokens < 1}
                  onClick={async () => {
                    await onUseHour();
                    setShop(false);
                  }}
                >
                  Light a free lantern
                </Button>
                <Button
                  type="button"
                  variant="gold"
                  onClick={async () => {
                    await onBuyHour();
                    setShop(false);
                  }}
                >
                  Pay $1 (mock)
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-raised px-2.5 font-mono text-xs text-fg tabular-nums">
      {icon}
      {label}
    </span>
  );
}
