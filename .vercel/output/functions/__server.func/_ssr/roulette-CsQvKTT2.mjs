import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn, t as Button } from "./button-Ct8TeDQa.mjs";
import { f as useCampCtx, t as CampGate, u as spinRoulette } from "./gate-C5HfzD_r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-gtd_PNU9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roulette-CsQvKTT2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RouletteTable({ locked, onCamp }) {
	const [bet, setBet] = (0, import_react.useState)(2);
	const [kind, setKind] = (0, import_react.useState)("red");
	const [number, setNumber] = (0, import_react.useState)(17);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [pocket, setPocket] = (0, import_react.useState)(null);
	const [color, setColor] = (0, import_react.useState)(null);
	const [win, setWin] = (0, import_react.useState)(null);
	const spin = async () => {
		if (locked || busy) return;
		setBusy(true);
		try {
			const result = await spinRoulette({ data: {
				bet,
				kind,
				number: kind === "number" ? number : void 0
			} });
			setPocket(result.pocket);
			setColor(result.color);
			setWin(result.win);
			onCamp(result.camp);
			if (result.multiplied) toast("The cards doubled your experience.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "The wheel stuck.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface/90 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mx-auto grid size-40 place-items-center rounded-full border-4 border-gold font-display text-3xl", color === "red" ? "bg-accent" : color === "black" ? "bg-bg" : color === "green" ? "bg-raised" : "bg-raised"),
				children: pocket === null ? "—" : pocket
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center font-mono text-lg tabular-nums",
				children: win === null ? "Place a chip" : win > 0 ? `+${win}` : "Lost"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap justify-center gap-2",
				children: [
					"red",
					"black",
					"green",
					"number"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: kind === k ? "gold" : "outline",
					onClick: () => setKind(k),
					children: k
				}, k))
			}),
			kind === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				min: 0,
				max: 36,
				className: "mx-auto mt-3 max-w-32",
				value: number,
				onChange: (e) => setNumber(Number(e.target.value))
			}) : null,
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
					onClick: () => setBet(n),
					children: n
				}, n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 w-full",
				disabled: locked || busy,
				onClick: () => void spin(),
				children: busy ? "The wheel turns…" : `Bet ${bet}`
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
				children: "Night Wheel"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 mb-4 text-sm text-muted",
				children: "Single zero. Colors pay even money. A pocket pays thirty-five to one."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouletteTable, {
				locked: !camp || camp.playLeftMs <= 0,
				onCamp: setCamp
			})
		]
	});
}
//#endregion
export { Page as component };
