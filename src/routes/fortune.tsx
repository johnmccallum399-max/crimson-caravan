import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CampGate } from "@/components/camp/gate";
import { useCampCtx } from "@/components/camp/context";
import { Button } from "@/components/ui/button";
import { acceptBlessing, readFortune } from "@/lib/game/player-api";
import { FORTUNE_COST } from "@/lib/game/rules";

export const Route = createFileRoute("/fortune")({ component: Page });

function Page() {
  return (
    <CampGate>
      <Inner />
    </CampGate>
  );
}

function Inner() {
  const { camp, setCamp } = useCampCtx();
  const [text, setText] = useState<string | null>(null);
  const [offer, setOffer] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
      <img
        src="/art/madame.jpg"
        alt="Madame, the camp fortune teller"
        className="h-80 w-full rounded-xl border border-border object-cover object-top md:h-full"
      />
      <div className="rounded-xl border border-border bg-surface/90 p-5">
        <h2 className="font-display text-2xl">Madame</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Five diamonds for a reading. One night in ten she offers Good Fortune —
          payouts doubled for twenty minutes.
        </p>
        {text ? (
          <blockquote className="mt-4 border-l-2 border-gold pl-3 text-sm leading-relaxed">
            {text}
          </blockquote>
        ) : (
          <p className="mt-4 text-sm text-subtle">Sit. Place the coins. Do not ask twice.</p>
        )}
        {offer ? (
          <Button
            type="button"
            variant="gold"
            className="mt-4 w-full"
            onClick={async () => {
              const next = await acceptBlessing();
              setCamp(next);
              setOffer(false);
              toast("Payouts are doubled for twenty minutes.");
            }}
          >
            Accept the blessing
          </Button>
        ) : null}
        <Button
          type="button"
          className="mt-4 w-full"
          disabled={busy || !camp || camp.diamonds < FORTUNE_COST}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await readFortune();
              setCamp(res.camp);
              setText(res.text);
              setOffer(res.offerBlessing);
              if (res.offerBlessing) toast("She is offering a blessing.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "The tent is dark.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Pay {FORTUNE_COST} diamonds
        </Button>
      </div>
    </div>
  );
}
