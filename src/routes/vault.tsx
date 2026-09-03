import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CampGate } from "@/components/camp/gate";
import { Button } from "@/components/ui/button";
import { downloadLocked, listVault, type VaultItem } from "@/lib/game/vault";

export const Route = createFileRoute("/vault")({ component: Page });

function Page() {
  return (
    <CampGate>
      <Inner />
    </CampGate>
  );
}

function Inner() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [open, setOpen] = useState<VaultItem | null>(null);

  useEffect(() => {
    void listVault().then(setItems);
  }, []);

  return (
    <div>
      <h2 className="font-display text-2xl">Vault</h2>
      <p className="mt-1 mb-4 max-w-xl text-sm text-muted">
        Claimed goods live here, on this device, inside the app. A downloaded pack is
        sealed. It will not open in another program.
      </p>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted">
          Nothing sealed yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/90 px-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted">{item.kind}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => setOpen(item)}>
                  View
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => downloadLocked(item)}>
                  Locked file
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <article className="mt-5 rounded-xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">{open.title}</h3>
          <p className="mt-2 text-sm text-muted">{open.description}</p>
          {open.license ? (
            <p className="mt-3 rounded-md bg-raised px-3 py-2 font-mono text-sm">
              Key (shown in-app): {open.license}
            </p>
          ) : (
            <p className="mt-3 text-sm text-subtle">The camp has forgotten the key.</p>
          )}
          {open.body ? (
            <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md bg-raised p-3 text-sm">
              {open.body}
            </pre>
          ) : null}
          <Button type="button" variant="ghost" className="mt-3" onClick={() => setOpen(null)}>
            Close
          </Button>
        </article>
      ) : null}
    </div>
  );
}
