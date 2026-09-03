//#region node_modules/.nitro/vite/services/ssr/assets/rules-BOdCYJBK.js
var PLAY_BUDGET_MS = 36e5;
var WINDOW_MS = 144e5;
var GEN_TICK_MS = 36e4;
var GEN_CAP_MS = 864e5;
var BLESSING_MS = 12e5;
function diamondsPerHour(level) {
	return 10 + Math.max(0, level - 1);
}
function levelFromXp(xp) {
	let level = 1;
	let need = 180;
	let remain = Math.max(0, xp);
	while (remain >= need && level < 99) {
		remain -= need;
		level += 1;
		need = Math.floor(180 * Math.pow(1.22, level - 1));
	}
	return {
		level,
		into: remain,
		need
	};
}
function playLeftMs(p) {
	if ((p.now ?? Date.now()) - p.windowStartedAt >= 144e5) return PLAY_BUDGET_MS;
	return Math.max(0, PLAY_BUDGET_MS + p.extraPlayMs - p.playMs);
}
var SLOT_SYMBOLS = [
	{
		id: "lantern",
		label: "Lantern",
		pay: 4
	},
	{
		id: "rose",
		label: "Rose",
		pay: 5
	},
	{
		id: "coin",
		label: "Coin",
		pay: 6
	},
	{
		id: "horseshoe",
		label: "Horseshoe",
		pay: 8
	},
	{
		id: "wagon",
		label: "Wagon",
		pay: 12
	},
	{
		id: "gem",
		label: "Diamond",
		pay: 20
	}
];
function slotPayout(a, b, c, bet) {
	if (a === b && b === c) return bet * (SLOT_SYMBOLS.find((s) => s.id === a)?.pay ?? 4);
	if (a === b || b === c || a === c) return bet * 2;
	return 0;
}
var FORTUNES = [
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
	"The caravan turns east. Pack the red scarf, leave the rest."
];
//#endregion
export { PLAY_BUDGET_MS as a, diamondsPerHour as c, slotPayout as d, GEN_TICK_MS as i, levelFromXp as l, FORTUNES as n, SLOT_SYMBOLS as o, GEN_CAP_MS as r, WINDOW_MS as s, BLESSING_MS as t, playLeftMs as u };
