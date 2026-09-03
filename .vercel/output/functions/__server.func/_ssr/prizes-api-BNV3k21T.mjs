import { r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-BMwTarJb.mjs";
import { t as authMiddleware } from "./middleware-D7rmuSk2.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prizes-api-BNV3k21T.js
function b64(buf) {
	const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
	let s = "";
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s);
}
function fromB64(s) {
	const bin = atob(s);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
async function encryptText(plain) {
	const keyBytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(32));
	const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
	const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
	const enc = await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv
	}, key, new TextEncoder().encode(plain));
	return {
		wrapKey: b64(keyBytes),
		iv: b64(iv),
		cipher: b64(enc)
	};
}
async function decryptText(cipherB64, ivB64, wrapKey) {
	const key = await crypto.subtle.importKey("raw", fromB64(wrapKey), "AES-GCM", false, ["decrypt"]);
	const dec = await crypto.subtle.decrypt({
		name: "AES-GCM",
		iv: fromB64(ivB64)
	}, key, fromB64(cipherB64));
	return new TextDecoder().decode(dec);
}
function packSecret(license, wrapKey) {
	return JSON.stringify({
		license,
		wrapKey: wrapKey ?? ""
	});
}
function unpackSecret(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed.license !== "string") return null;
		return parsed;
	} catch {
		return {
			license: raw,
			wrapKey: ""
		};
	}
}
var prizeInput = object({
	id: string().optional(),
	title: string().min(1).max(80),
	description: string().max(400),
	kind: _enum(["content", "subscription"]),
	cost: number().int().min(1).max(5e3),
	stock: number().int().min(0).max(99),
	secret: string().max(400).optional(),
	content: string().max(8e4).optional(),
	contentMime: string().max(80).optional(),
	slot_label_1: string().max(40).optional(),
	slot_value_1: string().max(120).optional(),
	slot_label_2: string().max(40).optional(),
	slot_value_2: string().max(120).optional(),
	slot_label_3: string().max(40).optional(),
	slot_value_3: string().max(120).optional()
});
function pub(row) {
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
		slot_value_3: row.slot_value_3
	};
}
var listPrizes_createServerFn_handler = createServerRpc({
	id: "4f9dde3988918c25ec980be47b8ac6fb4aac04af9adc339a784fe5c0474dbf30",
	name: "listPrizes",
	filename: "src/lib/game/prizes-api.ts"
}, (opts) => listPrizes.__executeServer(opts));
var listPrizes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPrizes_createServerFn_handler, async () => {
	return (await (await getSql())`
      select id, title, description, kind, cost, stock,
        slot_label_1, slot_value_1, slot_label_2, slot_value_2, slot_label_3, slot_value_3,
        secret_key, content_cipher, content_iv, content_mime, created_by
      from prizes order by created_at desc
    `).map(pub);
});
var savePrize_createServerFn_handler = createServerRpc({
	id: "43b4cc4635cae723b5de8e63d690096e1c2cf7248ddd5c067a0f4c727004a766",
	name: "savePrize",
	filename: "src/lib/game/prizes-api.ts"
}, (opts) => savePrize.__executeServer(opts));
var savePrize = createServerFn({ method: "POST" }).validator(prizeInput).middleware([authMiddleware]).handler(savePrize_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const id = data.id && data.id.length > 4 ? data.id : crypto.randomUUID();
	let cipher = null;
	let iv = null;
	let wrap = null;
	let mime = data.contentMime ?? null;
	if (data.content && data.content.length > 0) {
		const enc = await encryptText(data.content);
		cipher = enc.cipher;
		iv = enc.iv;
		wrap = enc.wrapKey;
	}
	const prev = (await sql`
      select secret_key, content_cipher, content_iv, content_mime from prizes where id = ${id} limit 1
    `)[0];
	if (!cipher && prev) {
		cipher = prev.content_cipher;
		iv = prev.content_iv;
		mime = prev.content_mime;
	}
	let secretStore = prev?.secret_key ?? null;
	if (data.secret && data.secret.length > 0) {
		const old = unpackSecret(prev?.secret_key ?? null);
		secretStore = packSecret(data.secret, wrap ?? old?.wrapKey ?? null);
	} else if (wrap) secretStore = packSecret(unpackSecret(prev?.secret_key ?? null)?.license ?? "", wrap);
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
var claimPrize_createServerFn_handler = createServerRpc({
	id: "31c9d62d6e63e28439cab481d90150c273bfea13829c42064a67ca9f98161ca2",
	name: "claimPrize",
	filename: "src/lib/game/prizes-api.ts"
}, (opts) => claimPrize.__executeServer(opts));
var claimPrize = createServerFn({ method: "POST" }).validator(object({ id: string() })).middleware([authMiddleware]).handler(claimPrize_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const prize = (await sql`select * from prizes where id = ${data.id} limit 1`)[0];
	if (!prize) throw new Error("That chest is empty.");
	if (prize.stock < 1) throw new Error("Gone. The wagon moved on.");
	if (((await sql`
      select diamonds from players where user_id = ${context.userId} limit 1
    `)[0]?.diamonds ?? 0) < prize.cost) throw new Error("Not enough diamonds.");
	const bundle = unpackSecret(prize.secret_key);
	let content = null;
	if (prize.content_cipher && prize.content_iv && bundle?.wrapKey) try {
		content = await decryptText(prize.content_cipher, prize.content_iv, bundle.wrapKey);
	} catch {
		content = null;
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
			{
				label: prize.slot_label_1,
				value: prize.slot_value_1
			},
			{
				label: prize.slot_label_2,
				value: prize.slot_value_2
			},
			{
				label: prize.slot_label_3,
				value: prize.slot_value_3
			}
		].filter((s) => s.label)
	};
});
var listClaims_createServerFn_handler = createServerRpc({
	id: "a91aeb9dcfcd7612ede13fed8d32ba8f035d23971ff378f22dd92d7f55a1bd0a",
	name: "listClaims",
	filename: "src/lib/game/prizes-api.ts"
}, (opts) => listClaims.__executeServer(opts));
var listClaims = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listClaims_createServerFn_handler, async ({ context }) => {
	return (await getSql())`
      select id, prize_title, kind, delivered_at from claims
      where user_id = ${context.userId}
      order by delivered_at desc
    `;
});
//#endregion
export { claimPrize_createServerFn_handler, listClaims_createServerFn_handler, listPrizes_createServerFn_handler, savePrize_createServerFn_handler };
