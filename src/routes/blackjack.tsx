import { createFileRoute } from "@tanstack/react-router";
import { CampGate } from "@/components/camp/gate";
import { useCampCtx } from "@/components/camp/context";
import { BlackjackTable } from "@/components/games/blackjack";

export const Route = createFileRoute("/blackjack")({ component: Page });

function Page() {
  return (
    <CampGate>
      <Inner />
    </CampGate>
  );
}

function Inner() {
  const { camp, setCamp } = useCampCtx();
  return (
    <div className="mx-auto max-w-md">
      <h2 className="font-display text-2xl">Wagon 21</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        Dealer stands on 17. Natural twenty-one pays three to two.
      </p>
      <BlackjackTable locked={!camp || camp.playLeftMs <= 0} onCamp={setCamp} />
    </div>
  );
}
