import { SignedIn, SignedOut, RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { CampShell } from "@/components/camp/shell";
import { CampProvider } from "@/components/camp/context";
import { useCamp } from "@/hooks/use-camp";

export function CampGate({ children }: { children: React.ReactNode }) {
  const { isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="font-display text-muted">The wagons are pulling in…</p>
      </div>
    );
  }
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <CampInner>{children}</CampInner>
      </SignedIn>
    </>
  );
}

function CampInner({ children }: { children: React.ReactNode }) {
  const api = useCamp();
  if (!api.camp) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="font-display text-muted">
          {api.error ?? "The wagons are pulling in…"}
        </p>
      </div>
    );
  }
  if (!api.camp.ageOk) {
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="font-display text-xs tracking-[0.2em] text-muted uppercase">Age gate</p>
          <h1 className="mt-2 font-display text-2xl">Eighteen and over</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Crimson Caravan is a social casino. Diamonds cannot be cashed out. Prizes are
            digital content and subscriptions. Confirm you are 18 or older.
          </p>
          <Button type="button" className="mt-5 w-full" onClick={() => void api.confirmAge()}>
            I am 18 or older
          </Button>
        </div>
      </div>
    );
  }
  return (
    <CampProvider value={{ camp: api.camp, setCamp: api.setCamp }}>
      <CampShell
        camp={api.camp}
        onBuyHour={api.purchaseHour}
        onUseHour={api.lightLantern}
      >
        {api.camp?.playLeftMs === 0 ? (
          <div className="mb-4 rounded-lg border border-border bg-raised px-4 py-3 text-sm">
            The lanterns are out. Wait for the next four-hour window, or buy a lantern hour.
          </div>
        ) : null}
        {children}
      </CampShell>
    </CampProvider>
  );
}
