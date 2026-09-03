import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <p className="font-display text-xs tracking-[0.22em] text-muted uppercase">
        Social casino · 18+
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        Crimson Caravan
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
        Three old tables, a fortune tent, and a locked chest of digital prizes.
        Diamonds have no cash value. Keys are shown once, then forgotten.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <img
          src="/art/hostess.jpg"
          alt="Illustrated caravan woman by a wagon wheel"
          className="h-80 w-full rounded-xl border border-border object-cover object-top md:h-[28rem]"
        />
        <div className="flex flex-col justify-end gap-3">
          <img
            src="/art/madame.jpg"
            alt="Madame the fortune teller"
            className="hidden h-48 w-full rounded-xl border border-border object-cover object-top md:block"
          />
          <Button asChild className="h-12">
            <Link to="/login">Enter the camp</Link>
          </Button>
          <p className="text-xs leading-relaxed text-subtle">
            One hour of play every four hours. Free diamonds drip in while you are
            away. A lantern hour is one dollar, or earned every hundred diamonds
            played.
          </p>
        </div>
      </div>
    </main>
  );
}
