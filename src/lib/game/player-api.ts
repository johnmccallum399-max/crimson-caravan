import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  BLESSING_MS,
  BYPASS_WAGER,
  FORTUNE_COST,
  FORTUNES,
  PLAY_BUDGET_MS,
  SLOT_SYMBOLS,
  WINDOW_MS,
  XP_MULT,
  XP_PER_PLAY,
  diamondsPerHour,
  levelFromXp,
  playLeftMs,
  slotPayout,
  type SlotId,
} from "./rules";
import { GEN_CAP_MS, GEN_TICK_MS } from "./rules";

type PlayerRow = {
  user_id: string;
  diamonds: number;
  xp: number;
  play_ms: number;
  window_started_at: string;
  extra_play_ms: number;
  wagered_towards_bypass: number;
  bypass_tokens: number;
  last_seen_at: string;
  last_gen_at: string;
  blessing_until: string | null;
  age_ok: boolean;
  open_hand: unknown;
};

export type CampState = {
  diamonds: number;
  xp: number;
  level: number;
  xpInto: number;
  xpNeed: number;
  playLeftMs: number;
  windowEndsAt: number;
  bypassTokens: number;
  wageredTowards: number;
  diamondsPerHour: number;
  blessingUntil: number | null;
  ageOk: boolean;
};

function toMs(value: string | Date | number) {
  return new Date(value).getTime();
}

function applyIdle(row: PlayerRow, now: number) {
  let windowStart = toMs(row.window_started_at);
  let playMs = row.play_ms;
  let extra = row.extra_play_ms;
  if (now - windowStart >= WINDOW_MS) {
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
    level: lvl,
  };
}

async function loadPlayer(userId: string) {
  const sql = await getSql();
  const rows = await sql<PlayerRow>`select * from players where user_id = ${userId} limit 1`;
  if (rows[0]) return rows[0];
  await sql`insert into players (user_id) values (${userId}) on conflict (user_id) do nothing`;
  const again = await sql<PlayerRow>`select * from players where user_id = ${userId} limit 1`;
  return again[0]!;
}

async function persistIdle(userId: string, idle: ReturnType<typeof applyIdle>, now: Date) {
  const sql = await getSql();
  await sql`
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

function snapshot(row: PlayerRow, idle: ReturnType<typeof applyIdle>, now: number): CampState {
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
      now,
    }),
    windowEndsAt: idle.windowStart + WINDOW_MS,
    bypassTokens: row.bypass_tokens,
    wageredTowards: row.wagered_towards_bypass,
    diamondsPerHour: diamondsPerHour(level),
    blessingUntil: blessing && blessing > now ? blessing : null,
    ageOk: row.age_ok,
  };
}

function payoutMult(row: PlayerRow, now: number) {
  const until = row.blessing_until ? toMs(row.blessing_until) : 0;
  return until > now ? 2 : 1;
}

function xpForPlay() {
  const hit = Math.random() < 1 / 20;
  return { xp: XP_PER_PLAY * (hit ? XP_MULT : 1), multiplied: hit };
}

async function spendAndAward(opts: {
  userId: string;
  row: PlayerRow;
  idle: ReturnType<typeof applyIdle>;
  bet: number;
  win: number;
  playMs: number;
  now: Date;
}) {
  const sql = await getSql();
  const { xp, multiplied } = xpForPlay();
  const wagered = opts.idle.diamonds >= 0
    ? opts.row.wagered_towards_bypass + opts.bet
    : opts.row.wagered_towards_bypass;
  const extraBypass = Math.floor(wagered / BYPASS_WAGER);
  const remainWager = wagered % BYPASS_WAGER;
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
  const idle2 = applyIdle(next, opts.now.getTime());
  return {
    camp: snapshot(next, idle2, opts.now.getTime()),
    multiplied,
    bypassEarned: extraBypass,
  };
}

export const getCamp = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    await persistIdle(context.userId, idle, new Date(now));
    return snapshot({ ...row, diamonds: idle.diamonds }, idle, now);
  });

export const setAgeOk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await loadPlayer(context.userId);
    await sql`update players set age_ok = true where user_id = ${context.userId}`;
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    return snapshot(row, idle, now);
  });

export const addPlayTime = createServerFn({ method: "POST" })
  .validator(z.object({ ms: z.number().int().min(0).max(30_000) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    const left = playLeftMs({
      playMs: idle.playMs,
      extraPlayMs: idle.extra,
      windowStartedAt: idle.windowStart,
      now,
    });
    const add = Math.min(data.ms, left);
    idle.playMs += add;
    await persistIdle(context.userId, idle, new Date(now));
    const next = await loadPlayer(context.userId);
    return snapshot(next, applyIdle(next, now), now);
  });

export const buyBypass = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    await sql`
      update players set
        bypass_tokens = ${row.bypass_tokens + 1},
        last_seen_at = ${new Date(now).toISOString()}
      where user_id = ${context.userId}
    `;
    const next = await loadPlayer(context.userId);
    return snapshot(next, applyIdle(next, now), now);
  });

export const useBypass = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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

const betSchema = z.object({
  bet: z.number().int().min(1).max(50),
});

export const spinSlots = createServerFn({ method: "POST" })
  .validator(betSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    const left = playLeftMs({
      playMs: idle.playMs,
      extraPlayMs: idle.extra,
      windowStartedAt: idle.windowStart,
      now,
    });
    if (left <= 0) throw new Error("The camp is sleeping. Buy a lantern hour, or wait.");
    if (idle.diamonds < data.bet) throw new Error("Not enough diamonds.");
    const pick = () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]!.id;
    const reels = [pick(), pick(), pick()] as [SlotId, SlotId, SlotId];
    const win = slotPayout(...reels, data.bet) * payoutMult(row, now);
    const awarded = await spendAndAward({
      userId: context.userId,
      row,
      idle,
      bet: data.bet,
      win,
      playMs: 4000,
      now: new Date(now),
    });
    return { reels, win, ...awarded };
  });

const rouletteSchema = z.object({
  bet: z.number().int().min(1).max(50),
  kind: z.enum(["red", "black", "green", "number"]),
  number: z.number().int().min(0).max(36).optional(),
});

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const spinRoulette = createServerFn({ method: "POST" })
  .validator(rouletteSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    const left = playLeftMs({
      playMs: idle.playMs,
      extraPlayMs: idle.extra,
      windowStartedAt: idle.windowStart,
      now,
    });
    if (left <= 0) throw new Error("The camp is sleeping. Buy a lantern hour, or wait.");
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
      playMs: 5000,
      now: new Date(now),
    });
    return { pocket, color, win, ...awarded };
  });

type Rank = number;
type Card = { r: Rank; s: number };

function drawCard(): Card {
  return { r: 1 + Math.floor(Math.random() * 13), s: Math.floor(Math.random() * 4) };
}

function handTotal(cards: Card[]) {
  let t = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.r === 1) {
      aces += 1;
      t += 11;
    } else t += Math.min(10, c.r);
  }
  while (t > 21 && aces > 0) {
    t -= 10;
    aces -= 1;
  }
  return t;
}

type HandState = { bet: number; player: Card[]; dealer: Card[]; done: boolean };

export const dealBlackjack = createServerFn({ method: "POST" })
  .validator(betSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    const left = playLeftMs({
      playMs: idle.playMs,
      extraPlayMs: idle.extra,
      windowStartedAt: idle.windowStart,
      now,
    });
    if (left <= 0) throw new Error("The camp is sleeping. Buy a lantern hour, or wait.");
    if (idle.diamonds < data.bet) throw new Error("Not enough diamonds.");
    const player = [drawCard(), drawCard()];
    const dealer = [drawCard(), drawCard()];
    const hand: HandState = { bet: data.bet, player, dealer, done: false };
    const pTot = handTotal(player);
    const dTot = handTotal(dealer);
    let win = 0;
    let result: "blackjack" | "push" | "playing" | "bust" | "win" | "lose" = "playing";
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
        row: { ...after, diamonds: after.diamonds },
        idle: { ...idle2, diamonds: after.diamonds },
        bet: 0,
        win,
        playMs: 6000,
        now: new Date(now),
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
        ...awarded,
      };
    }
    const next = await loadPlayer(context.userId);
    return {
      player,
      dealer: [dealer[0]!],
      done: false,
      result: "playing",
      total: pTot,
      dealerTotal: dealer[0]!.r === 1 ? 11 : Math.min(10, dealer[0]!.r),
      win: 0,
      camp: snapshot(next, applyIdle(next, now), now),
      multiplied: false,
      bypassEarned: 0,
    };
  });

export const playBlackjack = createServerFn({ method: "POST" })
  .validator(z.object({ action: z.enum(["hit", "stand"]) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    const hand = row.open_hand as HandState | null;
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
          playMs: 4000,
          now: new Date(now),
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
          ...awarded,
        };
      }
      await sql`update players set open_hand = ${JSON.stringify(hand)}::jsonb where user_id = ${context.userId}`;
      const next = await loadPlayer(context.userId);
      return {
        player: hand.player,
        dealer: [hand.dealer[0]!],
        done: false,
        result: "playing",
        total,
        dealerTotal: hand.dealer[0]!.r === 1 ? 11 : Math.min(10, hand.dealer[0]!.r),
        win: 0,
        camp: snapshot(next, applyIdle(next, now), now),
        multiplied: false,
        bypassEarned: 0,
      };
    }
    while (handTotal(hand.dealer) < 17) hand.dealer.push(drawCard());
    const p = handTotal(hand.player);
    const d = handTotal(hand.dealer);
    let win = 0;
    let result: "blackjack" | "push" | "playing" | "bust" | "win" | "lose" = "lose";
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
      playMs: 6000,
      now: new Date(now),
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
      ...awarded,
    };
  });

export const readFortune = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const idle = applyIdle(row, now);
    if (idle.diamonds < FORTUNE_COST) throw new Error("The tent wants five diamonds.");
    const text = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]!;
    const offerBlessing = Math.random() < 0.1;
    idle.diamonds -= FORTUNE_COST;
    await persistIdle(context.userId, idle, new Date(now));
    const next = await loadPlayer(context.userId);
    return {
      text,
      offerBlessing,
      camp: snapshot(next, applyIdle(next, now), now),
    };
  });

export const acceptBlessing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const row = await loadPlayer(context.userId);
    const now = Date.now();
    const until = new Date(now + BLESSING_MS).toISOString();
    await sql`update players set blessing_until = ${until} where user_id = ${context.userId}`;
    const next = await loadPlayer(context.userId);
    return snapshot(next, applyIdle(next, now), now);
  });
