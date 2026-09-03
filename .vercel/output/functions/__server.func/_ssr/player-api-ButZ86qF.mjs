import { r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-BMwTarJb.mjs";
import { t as authMiddleware } from "./middleware-D7rmuSk2.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { a as PLAY_BUDGET_MS, c as diamondsPerHour, d as slotPayout, i as GEN_TICK_MS, l as levelFromXp, n as FORTUNES, o as SLOT_SYMBOLS, r as GEN_CAP_MS, s as WINDOW_MS, t as BLESSING_MS, u as playLeftMs } from "./rules-BOdCYJBK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-api-ButZ86qF.js
function toMs(value) {
	return new Date(value).getTime();
}
function applyIdle(row, now) {
	let windowStart = toMs(row.window_started_at);
	let playMs = row.play_ms;
	let extra = row.extra_play_ms;
	if (now - windowStart >= 144e5) {
		windowStart = now;
		playMs = 0;
		extra = 0;
	}
	const lastGen = toMs(row.last_gen_at);
	const capped = Math.min(now - lastGen, GEN_CAP_MS);
	const ticks = Math.floor(Math.max(0, capped) / GEN_TICK_MS);
	const lvl = levelFromXp(row.xp).level;
	const perTick = diamondsPerHour(lvl) / 10;
	const gained = Math.floor(ticks * perTick);
	const nextGen = lastGen + ticks * GEN_TICK_MS;
	return {
		windowStart,
		playMs,
		extra,
		diamonds: row.diamonds + gained,
		lastGen: ticks > 0 ? nextGen : lastGen,
		gained,
		level: lvl
	};
}
async function loadPlayer(userId) {
	const sql = await getSql();
	const rows = await sql`select * from players where user_id = ${userId} limit 1`;
	if (rows[0]) return rows[0];
	await sql`insert into players (user_id) values (${userId}) on conflict (user_id) do nothing`;
	return (await sql`select * from players where user_id = ${userId} limit 1`)[0];
}
async function persistIdle(userId, idle, now) {
	await (await getSql())`
    update players set
      diamonds = ${idle.diamonds},
      play_ms = ${idle.playMs},
      extra_play_ms = ${idle.extra},
      window_started_at = ${new Date(idle.windowStart).toISOString()},
      last_gen_at = ${new Date(idle.lastGen).toISOString()},
      last_seen_at = ${now.toISOString()}
    where user_id = ${userId}
  `;
}
function snapshot(row, idle, now) {
	const { level, into, need } = levelFromXp(row.xp);
	const blessing = row.blessing_until ? toMs(row.blessing_until) : null;
	return {
		diamonds: idle.diamonds,
		xp: row.xp,
		level,
		xpInto: into,
		xpNeed: need,
		playLeftMs: playLeftMs({
			playMs: idle.playMs,
			extraPlayMs: idle.extra,
			windowStartedAt: idle.windowStart,
			now
		}),
		windowEndsAt: idle.windowStart + WINDOW_MS,
		bypassTokens: row.bypass_tokens,
		wageredTowards: row.wagered_towards_bypass,
		diamondsPerHour: diamondsPerHour(level),
		blessingUntil: blessing && blessing > now ? blessing : null,
		ageOk: row.age_ok
	};
}
function payoutMult(row, now) {
	return (row.blessing_until ? toMs(row.blessing_until) : 0) > now ? 2 : 1;
}
function xpForPlay() {
	const hit = Math.random() < 1 / 20;
	return {
		xp: 12 * (hit ? 5 : 1),
		multiplied: hit
	};
}
async function spendAndAward(opts) {
	const sql = await getSql();
	const { xp, multiplied } = xpForPlay();
	const wagered = opts.idle.diamonds >= 0 ? opts.row.wagered_towards_bypass + opts.bet : opts.row.wagered_towards_bypass;
	const extraBypass = Math.floor(wagered / 100);
	const remainWager = wagered % 100;
	const diamonds = opts.idle.diamonds - opts.bet + opts.win;
	const playMs = opts.idle.playMs + opts.playMs;
	await sql`
    update players set
      diamonds = ${diamonds},
      xp = ${opts.row.xp + xp},
      play_ms = ${playMs},
      extra_play_ms = ${opts.idle.extra},
      window_started_at = ${new Date(opts.idle.windowStart).toISOString()},
      last_gen_at = ${new Date(opts.idle.lastGen).toISOString()},
      last_seen_at = ${opts.now.toISOString()},
      wagered_towards_bypass = ${remainWager},
      bypass_tokens = ${opts.row.bypass_tokens + extraBypass}
    where user_id = ${opts.userId}
  `;
	const next = await loadPlayer(opts.userId);
	return {
		camp: snapshot(next, applyIdle(next, opts.now.getTime()), opts.now.getTime()),
		multiplied,
		bypassEarned: extraBypass
	};
}
var getCamp_createServerFn_handler = createServerRpc({
	id: "51191d100319273b5c5ffad942636425e3cd5a4e4d7e50e2e0a9d3df93bd1420",
	name: "getCamp",
	filename: "src/lib/game/player-api.ts"
}, (opts) => getCamp.__executeServer(opts));
var getCamp = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getCamp_createServerFn_handler, async ({ context }) => {
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	const idle = applyIdle(row, now);
	await persistIdle(context.userId, idle, new Date(now));
	return snapshot({
		...row,
		diamonds: idle.diamonds
	}, idle, now);
});
var setAgeOk_createServerFn_handler = createServerRpc({
	id: "2bd3f6bddfe19d51535e7186a8b7dca0b94888e55f0fe638f12e51d96ab0901d",
	name: "setAgeOk",
	filename: "src/lib/game/player-api.ts"
}, (opts) => setAgeOk.__executeServer(opts));
var setAgeOk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(setAgeOk_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadPlayer(context.userId);
	await sql`update players set age_ok = true where user_id = ${context.userId}`;
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	return snapshot(row, applyIdle(row, now), now);
});
var addPlayTime_createServerFn_handler = createServerRpc({
	id: "cbcb87a4ba8d63f95dc55f85ad132e261795b132647d090460fda2c48b81e082",
	name: "addPlayTime",
	filename: "src/lib/game/player-api.ts"
}, (opts) => addPlayTime.__executeServer(opts));
var addPlayTime = createServerFn({ method: "POST" }).validator(object({ ms: number().int().min(0).max(3e4) })).middleware([authMiddleware]).handler(addPlayTime_createServerFn_handler, async ({ context, data }) => {
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	const idle = applyIdle(row, now);
	const left = playLeftMs({
		playMs: idle.playMs,
		extraPlayMs: idle.extra,
		windowStartedAt: idle.windowStart,
		now
	});
	const add = Math.min(data.ms, left);
	idle.playMs += add;
	await persistIdle(context.userId, idle, new Date(now));
	const next = await loadPlayer(context.userId);
	return snapshot(next, applyIdle(next, now), now);
});
var buyBypass_createServerFn_handler = createServerRpc({
	id: "f653692fb1112edb6894da1a7884feeedee1578d0f8882943341a3bc2258f0ee",
	name: "buyBypass",
	filename: "src/lib/game/player-api.ts"
}, (opts) => buyBypass.__executeServer(opts));
var buyBypass = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(buyBypass_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	applyIdle(row, now);
	await sql`
      update players set
        bypass_tokens = ${row.bypass_tokens + 1},
        last_seen_at = ${new Date(now).toISOString()}
      where user_id = ${context.userId}
    `;
	const next = await loadPlayer(context.userId);
	return snapshot(next, applyIdle(next, now), now);
});
var useBypass_createServerFn_handler = createServerRpc({
	id: "7263a900033e1d481c2c5fbe344ee87d6b3384cefdd76815ec0f99b12e96259f",
	name: "useBypass",
	filename: "src/lib/game/player-api.ts"
}, (opts) => useBypass.__executeServer(opts));
var useBypass = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(useBypass_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const row = await loadPlayer(context.userId);
	if (row.bypass_tokens < 1) throw new Error("No lantern hours left.");
	const now = Date.now();
	const idle = applyIdle(row, now);
	await sql`
      update players set
        bypass_tokens = ${row.bypass_tokens - 1},
        extra_play_ms = ${idle.extra + PLAY_BUDGET_MS},
        last_seen_at = ${new Date(now).toISOString()}
      where user_id = ${context.userId}
    `;
	const next = await loadPlayer(context.userId);
	return snapshot(next, applyIdle(next, now), now);
});
var betSchema = object({ bet: number().int().min(1).max(50) });
var spinSlots_createServerFn_handler = createServerRpc({
	id: "0c279cdc7934b080c7ed2d40da047d5cc7a17fa5292d1da0cb443d1e3be9e29f",
	name: "spinSlots",
	filename: "src/lib/game/player-api.ts"
}, (opts) => spinSlots.__executeServer(opts));
var spinSlots = createServerFn({ method: "POST" }).validator(betSchema).middleware([authMiddleware]).handler(spinSlots_createServerFn_handler, async ({ context, data }) => {
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	const idle = applyIdle(row, now);
	if (playLeftMs({
		playMs: idle.playMs,
		extraPlayMs: idle.extra,
		windowStartedAt: idle.windowStart,
		now
	}) <= 0) throw new Error("The camp is sleeping. Buy a lantern hour, or wait.");
	if (idle.diamonds < data.bet) throw new Error("Not enough diamonds.");
	const pick = () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id;
	const reels = [
		pick(),
		pick(),
		pick()
	];
	const win = slotPayout(...reels, data.bet) * payoutMult(row, now);
	return {
		reels,
		win,
		...await spendAndAward({
			userId: context.userId,
			row,
			idle,
			bet: data.bet,
			win,
			playMs: 4e3,
			now: new Date(now)
		})
	};
});
var rouletteSchema = object({
	bet: number().int().min(1).max(50),
	kind: _enum([
		"red",
		"black",
		"green",
		"number"
	]),
	number: number().int().min(0).max(36).optional()
});
var RED = /* @__PURE__ */ new Set([
	1,
	3,
	5,
	7,
	9,
	12,
	14,
	16,
	18,
	19,
	21,
	23,
	25,
	27,
	30,
	32,
	34,
	36
]);
var spinRoulette_createServerFn_handler = createServerRpc({
	id: "b24212cce2616ef3bcfe097db45c9b34db382f8bed7878c99dadc22e8c75c21e",
	name: "spinRoulette",
	filename: "src/lib/game/player-api.ts"
}, (opts) => spinRoulette.__executeServer(opts));
var spinRoulette = createServerFn({ method: "POST" }).validator(rouletteSchema).middleware([authMiddleware]).handler(spinRoulette_createServerFn_handler, async ({ context, data }) => {
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	const idle = applyIdle(row, now);
	if (playLeftMs({
		playMs: idle.playMs,
		extraPlayMs: idle.extra,
		windowStartedAt: idle.windowStart,
		now
	}) <= 0) throw new Error("The camp is sleeping. Buy a lantern hour, or wait.");
	if (idle.diamonds < data.bet) throw new Error("Not enough diamonds.");
	const pocket = Math.floor(Math.random() * 37);
	const color = pocket === 0 ? "green" : RED.has(pocket) ? "red" : "black";
	let win = 0;
	if (data.kind === "number" && data.number === pocket) win = data.bet * 35;
	else if (data.kind === "green" && pocket === 0) win = data.bet * 35;
	else if (data.kind === "red" && color === "red") win = data.bet * 2;
	else if (data.kind === "black" && color === "black") win = data.bet * 2;
	win *= payoutMult(row, now);
	const awarded = await spendAndAward({
		userId: context.userId,
		row,
		idle,
		bet: data.bet,
		win,
		playMs: 5e3,
		now: new Date(now)
	});
	return {
		pocket,
		color,
		win,
		...awarded
	};
});
function drawCard() {
	return {
		r: 1 + Math.floor(Math.random() * 13),
		s: Math.floor(Math.random() * 4)
	};
}
function handTotal(cards) {
	let t = 0;
	let aces = 0;
	for (const c of cards) if (c.r === 1) {
		aces += 1;
		t += 11;
	} else t += Math.min(10, c.r);
	while (t > 21 && aces > 0) {
		t -= 10;
		aces -= 1;
	}
	return t;
}
var dealBlackjack_createServerFn_handler = createServerRpc({
	id: "2c646926acdc0e4e484032e9b4af187cba3a8a02cb6ecdbd1f911dc3e0724375",
	name: "dealBlackjack",
	filename: "src/lib/game/player-api.ts"
}, (opts) => dealBlackjack.__executeServer(opts));
var dealBlackjack = createServerFn({ method: "POST" }).validator(betSchema).middleware([authMiddleware]).handler(dealBlackjack_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	const idle = applyIdle(row, now);
	if (playLeftMs({
		playMs: idle.playMs,
		extraPlayMs: idle.extra,
		windowStartedAt: idle.windowStart,
		now
	}) <= 0) throw new Error("The camp is sleeping. Buy a lantern hour, or wait.");
	if (idle.diamonds < data.bet) throw new Error("Not enough diamonds.");
	const player = [drawCard(), drawCard()];
	const dealer = [drawCard(), drawCard()];
	const hand = {
		bet: data.bet,
		player,
		dealer,
		done: false
	};
	const pTot = handTotal(player);
	const dTot = handTotal(dealer);
	let win = 0;
	let result = "playing";
	let done = false;
	if (pTot === 21) {
		done = true;
		win = dTot === 21 ? data.bet : Math.floor(data.bet * 2.5);
		hand.done = true;
		result = dTot === 21 ? "push" : "blackjack";
	}
	await sql`
      update players set
        diamonds = ${idle.diamonds - data.bet},
        open_hand = ${JSON.stringify(hand)}::jsonb,
        last_seen_at = ${new Date(now).toISOString()}
      where user_id = ${context.userId}
    `;
	if (done) {
		const after = await loadPlayer(context.userId);
		const idle2 = applyIdle(after, now);
		idle2.diamonds = after.diamonds + win;
		const awarded = await spendAndAward({
			userId: context.userId,
			row: {
				...after,
				diamonds: after.diamonds
			},
			idle: {
				...idle2,
				diamonds: after.diamonds
			},
			bet: 0,
			win,
			playMs: 6e3,
			now: new Date(now)
		});
		await sql`update players set open_hand = null where user_id = ${context.userId}`;
		return {
			player,
			dealer,
			done: true,
			result,
			total: pTot,
			dealerTotal: dTot,
			win,
			...awarded
		};
	}
	const next = await loadPlayer(context.userId);
	return {
		player,
		dealer: [dealer[0]],
		done: false,
		result: "playing",
		total: pTot,
		dealerTotal: dealer[0].r === 1 ? 11 : Math.min(10, dealer[0].r),
		win: 0,
		camp: snapshot(next, applyIdle(next, now), now),
		multiplied: false,
		bypassEarned: 0
	};
});
var playBlackjack_createServerFn_handler = createServerRpc({
	id: "efc9ebdd7531dc2bc8e65e79ad1b04e1ac3f772ee876f886bd3c9ec42251f50a",
	name: "playBlackjack",
	filename: "src/lib/game/player-api.ts"
}, (opts) => playBlackjack.__executeServer(opts));
var playBlackjack = createServerFn({ method: "POST" }).validator(object({ action: _enum(["hit", "stand"]) })).middleware([authMiddleware]).handler(playBlackjack_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	const idle = applyIdle(row, now);
	const hand = row.open_hand;
	if (!hand || hand.done) throw new Error("No hand on the table.");
	if (data.action === "hit") {
		hand.player.push(drawCard());
		const total = handTotal(hand.player);
		if (total > 21) {
			hand.done = true;
			const awarded = await spendAndAward({
				userId: context.userId,
				row,
				idle,
				bet: 0,
				win: 0,
				playMs: 4e3,
				now: new Date(now)
			});
			await sql`update players set open_hand = null where user_id = ${context.userId}`;
			return {
				player: hand.player,
				dealer: hand.dealer,
				done: true,
				result: "bust",
				total,
				dealerTotal: handTotal(hand.dealer),
				win: 0,
				...awarded
			};
		}
		await sql`update players set open_hand = ${JSON.stringify(hand)}::jsonb where user_id = ${context.userId}`;
		const next = await loadPlayer(context.userId);
		return {
			player: hand.player,
			dealer: [hand.dealer[0]],
			done: false,
			result: "playing",
			total,
			dealerTotal: hand.dealer[0].r === 1 ? 11 : Math.min(10, hand.dealer[0].r),
			win: 0,
			camp: snapshot(next, applyIdle(next, now), now),
			multiplied: false,
			bypassEarned: 0
		};
	}
	while (handTotal(hand.dealer) < 17) hand.dealer.push(drawCard());
	const p = handTotal(hand.player);
	const d = handTotal(hand.dealer);
	let win = 0;
	let result = "lose";
	if (d > 21 || p > d) {
		win = hand.bet * 2 * payoutMult(row, now);
		result = "win";
	} else if (p === d) {
		win = hand.bet;
		result = "push";
	}
	const awarded = await spendAndAward({
		userId: context.userId,
		row,
		idle,
		bet: 0,
		win,
		playMs: 6e3,
		now: new Date(now)
	});
	await sql`update players set open_hand = null where user_id = ${context.userId}`;
	return {
		player: hand.player,
		dealer: hand.dealer,
		done: true,
		result,
		total: p,
		dealerTotal: d,
		win,
		...awarded
	};
});
var readFortune_createServerFn_handler = createServerRpc({
	id: "a204b90043fb35b7b8da260e3d727bdc3556d746d6fd75cbc14069b6f43aa2ec",
	name: "readFortune",
	filename: "src/lib/game/player-api.ts"
}, (opts) => readFortune.__executeServer(opts));
var readFortune = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(readFortune_createServerFn_handler, async ({ context }) => {
	await getSql();
	const row = await loadPlayer(context.userId);
	const now = Date.now();
	const idle = applyIdle(row, now);
	if (idle.diamonds < 5) throw new Error("The tent wants five diamonds.");
	const text = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
	const offerBlessing = Math.random() < .1;
	idle.diamonds -= 5;
	await persistIdle(context.userId, idle, new Date(now));
	const next = await loadPlayer(context.userId);
	return {
		text,
		offerBlessing,
		camp: snapshot(next, applyIdle(next, now), now)
	};
});
var acceptBlessing_createServerFn_handler = createServerRpc({
	id: "69a5ac1f7c07c44e9ca416f7323b833d7b161263980d62fc385d45ac67a6dc0e",
	name: "acceptBlessing",
	filename: "src/lib/game/player-api.ts"
}, (opts) => acceptBlessing.__executeServer(opts));
var acceptBlessing = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(acceptBlessing_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await loadPlayer(context.userId);
	const now = Date.now();
	await sql`update players set blessing_until = ${new Date(now + BLESSING_MS).toISOString()} where user_id = ${context.userId}`;
	const next = await loadPlayer(context.userId);
	return snapshot(next, applyIdle(next, now), now);
});
//#endregion
export { acceptBlessing_createServerFn_handler, addPlayTime_createServerFn_handler, buyBypass_createServerFn_handler, dealBlackjack_createServerFn_handler, getCamp_createServerFn_handler, playBlackjack_createServerFn_handler, readFortune_createServerFn_handler, setAgeOk_createServerFn_handler, spinRoulette_createServerFn_handler, spinSlots_createServerFn_handler, useBypass_createServerFn_handler };
