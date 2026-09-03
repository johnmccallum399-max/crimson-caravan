import { createFileRoute } from "@tanstack/react-router";
import { CampGate } from "@/components/camp/gate";
import { useCampCtx } from "@/components/camp/context";
import { SlotsTable } from "@/components/games/slots";

export const Route = createFileRoute("/slots")({ component: Page });

function Page() {
  return (
    <CampGate>
      <SlotsPage />
    </CampGate>
  );
}

function SlotsPage() {
  const { camp, setCamp } = useCampCtx();
  return (
    <div className="mx-auto max-w-md">
      <h2 className="font-display text-2xl">Lantern Reels</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        Three of a kind pay the table. A pair returns double. One play in twenty
        multiplies experience.
      </p>
      <SlotsTable locked={!camp || camp.playLeftMs <= 0} onCamp={setCamp} />
    </div>
  );
}
