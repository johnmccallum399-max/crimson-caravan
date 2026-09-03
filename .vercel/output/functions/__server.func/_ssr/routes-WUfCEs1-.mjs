import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Button } from "./button-Ct8TeDQa.mjs";
import { f as useCampCtx, n as SignedIn, p as useCurrentUserState, r as SignedOut, t as CampGate } from "./gate-C5HfzD_r.mjs";
import { c as diamondsPerHour } from "./rules-BOdCYJBK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-WUfCEs1-.js
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-5xl flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xs tracking-[0.22em] text-muted uppercase",
				children: "Social casino · 18+"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl",
				children: "Crimson Caravan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-base leading-relaxed text-muted",
				children: "Three old tables, a fortune tent, and a locked chest of digital prizes. Diamonds have no cash value. Keys are shown once, then forgotten."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/art/hostess.jpg",
					alt: "Illustrated caravan woman by a wagon wheel",
					className: "h-80 w-full rounded-xl border border-border object-cover object-top md:h-[28rem]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-end gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/art/madame.jpg",
							alt: "Madame the fortune teller",
							className: "hidden h-48 w-full rounded-xl border border-border object-cover object-top md:block"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "h-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Enter the camp"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-relaxed text-subtle",
							children: "One hour of play every four hours. Free diamonds drip in while you are away. A lantern hour is one dollar, or earned every hundred diamonds played."
						})
					]
				})]
			})
		]
	});
}
function Home() {
	const { isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lobby, {}) }) })] });
}
function Lobby() {
	const { camp } = useCampCtx();
	const rate = camp ? diamondsPerHour(camp.level) : 10;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "overflow-hidden rounded-xl border border-border bg-surface/90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/hostess.jpg",
				alt: "Caravan hostess beside a wagon wheel",
				className: "h-56 w-full object-cover object-top"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl",
					children: "The camp"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: [
						"Three tables, a fortune tent, and a locked chest. Free diamonds arrive one every six minutes — ",
						rate,
						" an hour at your level, for up to a day after you last sat down. Each new level adds one diamond to that hour."
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tent, {
					to: "/slots",
					title: "Lantern Reels",
					body: "The most-played social table. Three drums, old symbols, a quiet paytable."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tent, {
					to: "/blackjack",
					title: "Wagon 21",
					body: "Hit or stand against the dealer. Blackjack pays three to two."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tent, {
					to: "/roulette",
					title: "Night Wheel",
					body: "European wheel. Red, black, green, or a single pocket."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tent, {
					to: "/fortune",
					title: "Madame’s tent",
					body: "Pay five diamonds for a reading. One in ten nights she offers a blessing."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tent, {
					to: "/prizes",
					title: "The chest",
					body: "Digital goods and subscriptions. Keys are shown once, then forgotten."
				})
			]
		})]
	});
}
function Tent({ to, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "rounded-xl border border-border bg-surface/90 px-4 py-3 transition-colors hover:bg-raised",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-lg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: body
		})]
	});
}
//#endregion
export { Home as component };
