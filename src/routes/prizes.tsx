import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CampGate } from "@/components/camp/gate";
import { useCampCtx } from "@/components/camp/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { claimPrize, listPrizes, savePrize, type PrizePublic } from "@/lib/game/prizes-api";
import { saveVaultItem } from "@/lib/game/vault";
import { getCamp } from "@/lib/game/player-api";

export const Route = createFileRoute("/prizes")({ component: Page });

function Page() {
  return (
    <CampGate>
      <Inner />
    </CampGate>
  );
}

function Inner() {
  const { camp, setCamp } = useCampCtx();
  const [prizes, setPrizes] = useState<PrizePublic[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => setPrizes(await listPrizes());
  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">The chest</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Fill the slots. Secret keys stay hidden until a winner claims, then they
            are wiped. Digital files open only in the vault.
          </p>
        </div>
        <Button type="button" variant="gold" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide form" : "Stock a slot"}
        </Button>
      </div>
      {open ? (
        <PrizeForm
          onSaved={async () => {
            setOpen(false);
            await load();
          }}
        />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {prizes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted">
            Empty wagon. Stock a slot with a title, cost, and a secret key.
          </p>
        ) : (
          prizes.map((p) => (
            <article key={p.id} className="rounded-xl border border-border bg-surface/90 p-4">
              <p className="text-xs tracking-wide text-muted uppercase">{p.kind}</p>
              <h3 className="mt-1 font-display text-lg">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.description || "No description."}</p>
              <ul className="mt-2 space-y-1 text-xs text-subtle">
                {p.slot_label_1 ? (
                  <li>
                    {p.slot_label_1}: {p.slot_value_1}
                  </li>
                ) : null}
                {p.slot_label_2 ? (
                  <li>
                    {p.slot_label_2}: {p.slot_value_2}
                  </li>
                ) : null}
                {p.slot_label_3 ? (
                  <li>
                    {p.slot_label_3}: {p.slot_value_3}
                  </li>
                ) : null}
              </ul>
              <p className="mt-3 font-mono text-sm">
                {p.cost} diamonds · {p.stock} left · {p.hasSecret ? "key sealed" : "no key"}
              </p>
              <Button
                type="button"
                className="mt-3 w-full"
                disabled={!camp || camp.diamonds < p.cost || p.stock < 1}
                onClick={async () => {
                  try {
                    const delivered = await claimPrize({ data: { id: p.id } });
                    await saveVaultItem({
                      id: delivered.claimId,
                      title: delivered.title,
                      kind: delivered.kind,
                      mime: delivered.mime,
                      body: delivered.content,
                      license: delivered.license,
                      description: delivered.description,
                      slots: delivered.slots,
                      savedAt: Date.now(),
                    });
                    setCamp(await getCamp());
                    await load();
                    toast("Sealed in your vault. The camp has forgotten the key.");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "The lock held.");
                  }
                }}
              >
                Claim
              </Button>
            </article>
          ))
        )}
      </div>
      <p className="text-sm text-muted">
        Open claimed goods in the <Link to="/vault">vault</Link>. A downloaded{" "}
        <span className="font-mono">.ccv</span> file will not open outside this app.
      </p>
    </div>
  );
}

function PrizeForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"content" | "subscription">("subscription");
  const [cost, setCost] = useState(80);
  const [stock, setStock] = useState(1);
  const [secret, setSecret] = useState("");
  const [content, setContent] = useState("");
  const [l1, setL1] = useState("Plan");
  const [v1, setV1] = useState("");
  const [l2, setL2] = useState("Term");
  const [v2, setV2] = useState("");
  const [l3, setL3] = useState("Notes");
  const [v3, setV3] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid gap-3 rounded-xl border border-border bg-surface/90 p-4 md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await savePrize({
            data: {
              title,
              description,
              kind,
              cost,
              stock,
              secret: secret || undefined,
              content: content || undefined,
              contentMime: "text/plain",
              slot_label_1: l1 || undefined,
              slot_value_1: v1 || undefined,
              slot_label_2: l2 || undefined,
              slot_value_2: v2 || undefined,
              slot_label_3: l3 || undefined,
              slot_value_3: v3 || undefined,
            },
          });
          toast("Slot stocked. The key is hidden.");
          onSaved();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not stock.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Title" value={title} onChange={setTitle} required />
      <div>
        <Label>Kind</Label>
        <select
          className="mt-1 h-11 w-full rounded-md border border-border bg-raised px-3 text-sm"
          value={kind}
          onChange={(e) => setKind(e.target.value as "content" | "subscription")}
        >
          <option value="subscription">Subscription</option>
          <option value="content">Digital content</option>
        </select>
      </div>
      <Field label="Description" value={description} onChange={setDescription} />
      <Field
        label="Secret key (write once)"
        value={secret}
        onChange={setSecret}
        type="password"
      />
      <Field label="Diamond cost" value={String(cost)} onChange={(v) => setCost(Number(v) || 1)} />
      <Field label="Stock" value={String(stock)} onChange={(v) => setStock(Number(v) || 0)} />
      <Field label="Slot 1 label" value={l1} onChange={setL1} />
      <Field label="Slot 1 value" value={v1} onChange={setV1} />
      <Field label="Slot 2 label" value={l2} onChange={setL2} />
      <Field label="Slot 2 value" value={v2} onChange={setV2} />
      <Field label="Slot 3 label" value={l3} onChange={setL3} />
      <Field label="Slot 3 value" value={v3} onChange={setV3} />
      <div className="md:col-span-2">
        <Label htmlFor="body">Sealed text (optional)</Label>
        <textarea
          id="body"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 min-h-24 w-full rounded-md border border-border bg-raised p-3 text-sm"
        />
      </div>
      <Button type="submit" className="md:col-span-2" disabled={busy}>
        Seal and stock
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-1"
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
