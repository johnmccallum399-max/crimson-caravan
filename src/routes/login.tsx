import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GROK_PROVIDERS,
  authClient,
  authEnabled,
  signIn,
} from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0] || "Traveler",
        });
        if (res.error) throw new Error(res.error.message || "Could not join.");
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || "Could not enter.");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "The tent flap stuck.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
      <div className="w-full rounded-xl border border-border bg-surface/95 p-6">
        <p className="font-display text-xs tracking-[0.22em] text-muted uppercase">
          Social casino · 18+
        </p>
        <h1 className="mt-2 font-display text-3xl">Crimson Caravan</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to keep your diamonds, lantern hours, and sealed prizes.
        </p>
        {authEnabled ? (
          <div className="mt-5 space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Sign-in is disabled.</p>
        )}
        <div className="mt-6 space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              className="mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              className="mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-accent">{error}</p> : null}
          <Button type="button" className="w-full" disabled={busy} onClick={() => void submit()}>
            {mode === "in" ? "Enter the camp" : "Join the caravan"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "Need a place? Join." : "Already with us? Enter."}
          </button>
        </div>
      </div>
    </main>
  );
}
