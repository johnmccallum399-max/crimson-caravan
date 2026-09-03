import { createFileRoute, Link } from "@tanstack/react-router";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CampGate } from "@/components/camp/gate";
import { Landing } from "@/components/camp/landing";
import { useCampCtx } from "@/components/camp/context";
import { diamondsPerHour } from "@/lib/game/rules";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { isPending } = useCurrentUserState();
  if (isPending) return <Landing />;
  return (
    <>
      <SignedOut>
        <Landing />
      </SignedOut>
      <SignedIn>
        <CampGate>
          <Lobby />
        </CampGate>
      </SignedIn>
    </>
  );
}

function Lobby() {
  const { camp } = useCampCtx();
  const rate = camp ? diamondsPerHour(camp.level) : 10;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="overflow-hidden rounded-xl border border-border bg-surface/90">
        <img
          src="/art/hostess.jpg"
          alt="Caravan hostess beside a wagon wheel"
          className="h-56 w-full object-cover object-top"
        />
        <div className="p-4">
          <h2 className="font-display text-xl">The camp</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Three tables, a fortune tent, and a locked chest. Free diamonds arrive one
            every six minutes — {rate} an hour at your level, for up to a day after you
            last sat down. Each new level adds one diamond to that hour.
          </p>
        </div>
      </article>
      <div className="grid gap-3">
        <Tent to="/slots" title="Lantern Reels" body="The most-played social table. Three drums, old symbols, a quiet paytable." />
        <Tent to="/blackjack" title="Wagon 21" body="Hit or stand against the dealer. Blackjack pays three to two." />
        <Tent to="/roulette" title="Night Wheel" body="European wheel. Red, black, green, or a single pocket." />
        <Tent to="/fortune" title="Madame’s tent" body="Pay five diamonds for a reading. One in ten nights she offers a blessing." />
        <Tent to="/prizes" title="The chest" body="Digital goods and subscriptions. Keys are shown once, then forgotten." />
      </div>
    </div>
  );
}

function Tent({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-surface/90 px-4 py-3 transition-colors hover:bg-raised"
    >
      <p className="font-display text-lg">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </Link>
  );
}
