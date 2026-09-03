import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Button } from "./button-Ct8TeDQa.mjs";
import { f as useCampCtx, i as acceptBlessing, l as readFortune, t as CampGate } from "./gate-C5HfzD_r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fortune-eG6kj40w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {}) });
}
function Inner() {
	const { camp, setCamp } = useCampCtx();
	const [text, setText] = (0, import_react.useState)(null);
	const [offer, setOffer] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-3xl gap-5 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/art/madame.jpg",
			alt: "Madame, the camp fortune teller",
			className: "h-80 w-full rounded-xl border border-border object-cover object-top md:h-full"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-surface/90 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Madame"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "Five diamonds for a reading. One night in ten she offers Good Fortune — payouts doubled for twenty minutes."
				}),
				text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
					className: "mt-4 border-l-2 border-gold pl-3 text-sm leading-relaxed",
					children: text
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-subtle",
					children: "Sit. Place the coins. Do not ask twice."
				}),
				offer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "gold",
					className: "mt-4 w-full",
					onClick: async () => {
						const next = await acceptBlessing();
						setCamp(next);
						setOffer(false);
						toast("Payouts are doubled for twenty minutes.");
					},
					children: "Accept the blessing"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					className: "mt-4 w-full",
					disabled: busy || !camp || camp.diamonds < 5,
					onClick: async () => {
						setBusy(true);
						try {
							const res = await readFortune();
							setCamp(res.camp);
							setText(res.text);
							setOffer(res.offerBlessing);
							if (res.offerBlessing) toast("She is offering a blessing.");
						} catch (err) {
							toast.error(err instanceof Error ? err.message : "The tent is dark.");
						} finally {
							setBusy(false);
						}
					},
					children: [
						"Pay ",
						5,
						" diamonds"
					]
				})
			]
		})]
	});
}
//#endregion
export { Page as component };
