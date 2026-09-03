import { createFileRoute } from "@tanstack/react-router";
import { CampGate } from "@/components/camp/gate";
import { useCampCtx } from "@/components/camp/context";
import { RouletteTable } from "@/components/games/roulette";

export const Route = createFileRoute("/roulette")({ component: Page });

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
      <h2 className="font-display text-2xl">Night Wheel</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        Single zero. Colors pay even money. A pocket pays thirty-five to one.
      </p>
      <RouletteTable locked={!camp || camp.playLeftMs <= 0} onCamp={setCamp} />
    </div>
  );
}
