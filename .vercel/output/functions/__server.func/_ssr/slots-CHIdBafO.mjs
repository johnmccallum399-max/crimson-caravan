import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn, t as Button } from "./button-Ct8TeDQa.mjs";
import { d as spinSlots, f as useCampCtx, t as CampGate } from "./gate-C5HfzD_r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as SLOT_SYMBOLS } from "./rules-BOdCYJBK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/slots-CHIdBafO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FACE = {
	lantern: "Lantern",
	rose: "Rose",
	coin: "Coin",
	horseshoe: "Shoe",
	wagon: "Wagon",
	gem: "Gem"
};
function SlotsTable({ locked, onCamp }) {
	const [bet, setBet] = (0, import_react.useState)(2);
	const [reels, setReels] = (0, import_react.useState)([
		"lantern",
		"rose",
		"coin"
	]);
	const [spinning, setSpinning] = (0, import_react.useState)(false);
	const [lastWin, setLastWin] = (0, import_react.useState)(null);
	const spin = async () => {
		if (locked || spinning) return;
		setSpinning(true);
		setLastWin(null);
		try {
			const result = await spinSlots({ data: { bet } });
			setReels(result.reels);
			setLastWin(result.win);
			onCamp(result.camp);
			if (result.multiplied) toast("The cards doubled your experience.");
			if (result.bypassEarned) toast("A free lantern hour was earned.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "The reels jammed.");
		} finally {
			setSpinning(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface/90 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: reels.map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("grid aspect-square place-items-center rounded-lg border border-border bg-raised font-display text-sm font-semibold", spinning && "opacity-70"),
					children: FACE[id]
				}, `${id}-${i}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center font-mono text-lg tabular-nums",
				children: lastWin === null ? "—" : lastWin > 0 ? `+${lastWin}` : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex items-center justify-center gap-2",
				children: [
					1,
					2,
					5,
					10
				].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: bet === n ? "gold" : "outline",
					onClick: () => setBet(n),
					children: n
				}, n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				className: "mt-4 w-full",
				disabled: locked || spinning,
				onClick: () => void spin(),
				children: spinning ? "Spinning…" : `Spin for ${bet}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid grid-cols-2 gap-1 text-xs text-subtle",
				children: SLOT_SYMBOLS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Three ",
					s.label.toLowerCase(),
					"s · ",
					s.pay,
					"×"
				] }, s.id))
			})
		]
	});
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotsPage, {}) });
}
function SlotsPage() {
	const { camp, setCamp } = useCampCtx();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Lantern Reels"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-4 text-sm text-muted",
				children: "Three of a kind pay the table. A pair returns double. One play in twenty multiplies experience."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlotsTable, {
				locked: !camp || camp.playLeftMs <= 0,
				onCamp: setCamp
			})
		]
	});
}
//#endregion
export { Page as component };
