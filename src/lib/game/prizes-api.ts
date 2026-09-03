import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { encryptText, decryptText, packSecret, unpackSecret } from "./crypto";

export type PrizePublic = {
  id: string;
  title: string;
  description: string;
  kind: "content" | "subscription";
  cost: number;
  stock: number;
  hasSecret: boolean;
  hasContent: boolean;
  slot_label_1: string | null;
  slot_value_1: string | null;
  slot_label_2: string | null;
  slot_value_2: string | null;
  slot_label_3: string | null;
  slot_value_3: string | null;
};

type PrizeRow = PrizePublic & {
  secret_key: string | null;
  content_cipher: string | null;
  content_iv: string | null;
  content_mime: string | null;
  created_by: string;
};

const prizeInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(80),
  description: z.string().max(400),
  kind: z.enum(["content", "subscription"]),
  cost: z.number().int().min(1).max(5000),
  stock: z.number().int().min(0).max(99),
  secret: z.string().max(400).optional(),
  content: z.string().max(80_000).optional(),
  contentMime: z.string().max(80).optional(),
  slot_label_1: z.string().max(40).optional(),
  slot_value_1: z.string().max(120).optional(),
  slot_label_2: z.string().max(40).optional(),
  slot_value_2: z.string().max(120).optional(),
  slot_label_3: z.string().max(40).optional(),
  slot_value_3: z.string().max(120).optional(),
});

function pub(row: PrizeRow): PrizePublic {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    kind: row.kind,
    cost: row.cost,
    stock: row.stock,
    hasSecret: Boolean(row.secret_key),
    hasContent: Boolean(row.content_cipher),
    slot_label_1: row.slot_label_1,
    slot_value_1: row.slot_value_1,
    slot_label_2: row.slot_label_2,
    slot_value_2: row.slot_value_2,
    slot_label_3: row.slot_label_3,
    slot_value_3: row.slot_value_3,
  };
}

export const listPrizes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<PrizeRow>`
      select id, title, description, kind, cost, stock,
        slot_label_1, slot_value_1, slot_label_2, slot_value_2, slot_label_3, slot_value_3,
        secret_key, content_cipher, content_iv, content_mime, created_by
      from prizes order by created_at desc
    `;
    return rows.map(pub);
  });

export const savePrize = createServerFn({ method: "POST" })
  .validator(prizeInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = data.id && data.id.length > 4 ? data.id : crypto.randomUUID();
    let cipher: string | null = null;
    let iv: string | null = null;
    let wrap: string | null = null;
    let mime: string | null = data.contentMime ?? null;
    if (data.content && data.content.length > 0) {
      const enc = await encryptText(data.content);
      cipher = enc.cipher;
      iv = enc.iv;
      wrap = enc.wrapKey;
    }
    const existing = await sql<{ secret_key: string | null; content_cipher: string | null; content_iv: string | null; content_mime: string | null }>`
      select secret_key, content_cipher, content_iv, content_mime from prizes where id = ${id} limit 1
    `;
    const prev = existing[0];
    if (!cipher && prev) {
      cipher = prev.content_cipher;
      iv = prev.content_iv;
      mime = prev.content_mime;
    }
    let secretStore: string | null = prev?.secret_key ?? null;
    if (data.secret && data.secret.length > 0) {
      const old = unpackSecret(prev?.secret_key ?? null);
      secretStore = packSecret(data.secret, wrap ?? old?.wrapKey ?? null);
    } else if (wrap) {
      const old = unpackSecret(prev?.secret_key ?? null);
      secretStore = packSecret(old?.license ?? "", wrap);
    }
    await sql`
      insert into prizes (
        id, title, description, kind, cost, stock,
        slot_label_1, slot_value_1, slot_label_2, slot_value_2, slot_label_3, slot_value_3,
        secret_key, content_cipher, content_iv, content_mime, created_by
      ) values (
        ${id}, ${data.title}, ${data.description}, ${data.kind}, ${data.cost}, ${data.stock},
        ${data.slot_label_1 ?? null}, ${data.slot_value_1 ?? null},
        ${data.slot_label_2 ?? null}, ${data.slot_value_2 ?? null},
        ${data.slot_label_3 ?? null}, ${data.slot_value_3 ?? null},
        ${secretStore}, ${cipher}, ${iv}, ${mime}, ${context.userId}
      )
      on conflict (id) do update set
        title = excluded.title,
        description = excluded.description,
        kind = excluded.kind,
        cost = excluded.cost,
        stock = excluded.stock,
        slot_label_1 = excluded.slot_label_1,
        slot_value_1 = excluded.slot_value_1,
        slot_label_2 = excluded.slot_label_2,
        slot_value_2 = excluded.slot_value_2,
        slot_label_3 = excluded.slot_label_3,
        slot_value_3 = excluded.slot_value_3,
        secret_key = excluded.secret_key,
        content_cipher = excluded.content_cipher,
        content_iv = excluded.content_iv,
        content_mime = excluded.content_mime
    `;
    return listPrizes();
  });

export const claimPrize = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<PrizeRow>`select * from prizes where id = ${data.id} limit 1`;
    const prize = rows[0];
    if (!prize) throw new Error("That chest is empty.");
    if (prize.stock < 1) throw new Error("Gone. The wagon moved on.");
    const purse = await sql<{ diamonds: number }>`
      select diamonds from players where user_id = ${context.userId} limit 1
    `;
    const diamonds = purse[0]?.diamonds ?? 0;
    if (diamonds < prize.cost) throw new Error("Not enough diamonds.");
    const bundle = unpackSecret(prize.secret_key);
    let content: string | null = null;
    if (prize.content_cipher && prize.content_iv && bundle?.wrapKey) {
      try {
        content = await decryptText(prize.content_cipher, prize.content_iv, bundle.wrapKey);
      } catch {
        content = null;
      }
    }
    const claimId = crypto.randomUUID();
    await sql`update prizes set
      stock = stock - 1,
      secret_key = null,
      content_cipher = null,
      content_iv = null
      where id = ${prize.id} and stock > 0`;
    await sql`insert into claims (id, user_id, prize_id, prize_title, kind)
      values (${claimId}, ${context.userId}, ${prize.id}, ${prize.title}, ${prize.kind})`;
    await sql`update players set diamonds = diamonds - ${prize.cost} where user_id = ${context.userId}`;
    return {
      claimId,
      title: prize.title,
      kind: prize.kind,
      license: bundle?.license || null,
      content,
      mime: prize.content_mime,
      description: prize.description,
      slots: [
        { label: prize.slot_label_1, value: prize.slot_value_1 },
        { label: prize.slot_label_2, value: prize.slot_value_2 },
        { label: prize.slot_label_3, value: prize.slot_value_3 },
      ].filter((s) => s.label),
    };
  });

export const listClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: string; prize_title: string; kind: string; delivered_at: string }>`
      select id, prize_title, kind, delivered_at from claims
      where user_id = ${context.userId}
      order by delivered_at desc
    `;
  });
