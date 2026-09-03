import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn, t as Button } from "./button-Ct8TeDQa.mjs";
import { c as playBlackjack, f as useCampCtx, o as dealBlackjack, t as CampGate } from "./gate-C5HfzD_r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blackjack-wu-Vp6LN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SUITS = [
	"♠",
	"♥",
	"♦",
	"♣"
];
var RANKS = [
	"A",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"J",
	"Q",
	"K"
];
function CardFace({ card }) {
	const red = card.s === 1 || card.s === 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex h-16 w-12 items-center justify-center rounded-md border border-border bg-cream font-mono text-sm font-medium", red ? "text-accent" : "text-gold-fg"),
		children: [RANKS[card.r - 1], SUITS[card.s]]
	});
}
function BlackjackTable({ locked, onCamp }) {
	const [bet, setBet] = (0, import_react.useState)(2);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [player, setPlayer] = (0, import_react.useState)([]);
	const [dealer, setDealer] = (0, import_react.useState)([]);
	const [done, setDone] = (0, import_react.useState)(true);
	const [result, setResult] = (0, import_react.useState)("Deal to sit.");
	const [totals, setTotals] = (0, import_react.useState)({
		p: 0,
		d: 0
	});
	const apply = (res) => {
		setPlayer(res.player);
		setDealer(res.dealer);
		setDone(res.done);
		setResult(res.result);
		setTotals({
			p: res.total,
			d: res.dealerTotal
		});
		onCamp(res.camp);
		if (res.multiplied) toast("The cards doubled your experience.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface/90 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: ["Dealer · ", totals.d || "—"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: dealer.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, { card: c }, `d-${i}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-xs tracking-wide text-muted uppercase",
				children: ["You · ", totals.p || "—"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: player.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFace, { card: c }, `p-${i}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-display text-lg capitalize",
				children: result
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-center gap-2",
				children: [
					1,
					2,
					5,
					10
				].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: bet === n ? "gold" : "outline",
					disabled: !done,
					onClick: () => setBet(n),
					children: n
				}, n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-2",
				children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "flex-1",
					disabled: locked || busy,
					onClick: async () => {
						setBusy(true);
						try {
							apply(await dealBlackjack({ data: { bet } }));
						} catch (err) {
							toast.error(err instanceof Error ? err.message : "No seat.");
						} finally {
							setBusy(false);
						}
					},
					children: ["Deal ", bet]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						try {
							apply(await playBlackjack({ data: { action: "hit" } }));
						} catch (err) {
							toast.error(err instanceof Error ? err.message : "No hit.");
						} finally {
							setBusy(false);
						}
					},
					children: "Hit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					variant: "gold",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						try {
							apply(await playBlackjack({ data: { action: "stand" } }));
						} catch (err) {
							toast.error(err instanceof Error ? err.message : "No stand.");
						} finally {
							setBusy(false);
						}
					},
					children: "Stand"
				})] })
			})
		]
	});
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {}) });
}
function Inner() {
	const { camp, setCamp } = useCampCtx();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Wagon 21"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-4 text-sm text-muted",
				children: "Dealer stands on 17. Natural twenty-one pays three to two."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlackjackTable, {
				locked: !camp || camp.playLeftMs <= 0,
				onCamp: setCamp
			})
		]
	});
}
//#endregion
export { Page as component };
