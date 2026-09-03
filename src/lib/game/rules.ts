export const PLAY_BUDGET_MS = 60 * 60 * 1000;
export const WINDOW_MS = 4 * 60 * 60 * 1000;
export const GEN_TICK_MS = 6 * 60 * 1000;
export const GEN_CAP_MS = 24 * 60 * 60 * 1000;
export const BASE_PER_HOUR = 10;
export const BYPASS_WAGER = 100;
export const STARTING_DIAMONDS = 48;
export const BLESSING_MS = 20 * 60 * 1000;
export const FORTUNE_COST = 5;
export const XP_PER_PLAY = 12;
export const XP_MULT = 5;

export function diamondsPerHour(level: number) {
  return BASE_PER_HOUR + Math.max(0, level - 1);
}

export function levelFromXp(xp: number) {
  let level = 1;
  let need = 180;
  let remain = Math.max(0, xp);
  while (remain >= need && level < 99) {
    remain -= need;
    level += 1;
    need = Math.floor(180 * Math.pow(1.22, level - 1));
  }
  return { level, into: remain, need };
}

export function playLeftMs(p: {
  playMs: number;
  extraPlayMs: number;
  windowStartedAt: number;
  now?: number;
}) {
  const now = p.now ?? Date.now();
  const elapsed = now - p.windowStartedAt;
  if (elapsed >= WINDOW_MS) {
    return PLAY_BUDGET_MS;
  }
  return Math.max(0, PLAY_BUDGET_MS + p.extraPlayMs - p.playMs);
}

export const SLOT_SYMBOLS = [
  { id: "lantern", label: "Lantern", pay: 4 },
  { id: "rose", label: "Rose", pay: 5 },
  { id: "coin", label: "Coin", pay: 6 },
  { id: "horseshoe", label: "Horseshoe", pay: 8 },
  { id: "wagon", label: "Wagon", pay: 12 },
  { id: "gem", label: "Diamond", pay: 20 },
] as const;

export type SlotId = (typeof SLOT_SYMBOLS)[number]["id"];

export function slotPayout(a: SlotId, b: SlotId, c: SlotId, bet: number) {
  if (a === b && b === c) {
    const pay = SLOT_SYMBOLS.find((s) => s.id === a)?.pay ?? 4;
    return bet * pay;
  }
  if (a === b || b === c || a === c) return bet * 2;
  return 0;
}

export const FORTUNES = [
  "A lantern in the next wagon is lit for you. Walk toward the warmest door.",
  "Coins will find the hem of your coat before dawn. Do not count them twice.",
  "The wheel remembers your name. Bet small, then once with the whole chest.",
  "Someone you have not met will speak a true thing. Listen before you answer.",
  "Dust on the road means a visitor. Keep a cup ready.",
  "Your luck is a red thread. Do not cut it for a stranger's story.",
  "The old cards prefer patience. Sit out one hand, then take the next.",
  "A lost key is under the third step. You already knew.",
  "Night is a good accountant. Add nothing until the sun is honest.",
  "A blessing wants a quiet mouth. Take it, then play as if you had none.",
  "The horse that will not drink is wiser than the man who shouts.",
  "Gold likes company. Split a win and it will return doubled.",
  "A lie told at the fire will visit you at the table.",
  "Three knocks, then a gift. Open only after the third.",
  "Your shadow is longer than your debt. Walk into the light anyway.",
  "The queen of coins is not a woman. She is a door.",
  "Do not follow the brightest lantern. Follow the one that does not swing.",
  "Rain on the canvas means a full purse by week's end.",
  "You will be asked to wait. The wait is the prize.",
  "The caravan turns east. Pack the red scarf, leave the rest.",
];
