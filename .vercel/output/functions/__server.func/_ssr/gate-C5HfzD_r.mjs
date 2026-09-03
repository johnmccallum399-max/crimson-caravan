import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { a as hasGateSessionMarker } from "./server-COju4gHn.mjs";
import { t as authMiddleware } from "./middleware-D7rmuSk2.mjs";
import { n as cn, r as formatClock, t as Button } from "./button-Ct8TeDQa.mjs";
import { a as Gem, i as Hourglass, r as Sparkles, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gate-C5HfzD_r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/** Render children only when a user is present (real session, or the disabled-auth dev user). */
function SignedIn({ children }) {
	const { user } = useCurrentUserState();
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children }) : null;
}
/**
* Render children only once we KNOW the visitor is signed out (`isPending` has
* cleared and there is no user). Hidden while the session is still loading.
*/
function SignedOut({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending || user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(100%-1.5rem,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-2xl", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-sm text-muted hover:bg-raised hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-lg font-medium tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("mt-1 text-sm text-muted", className),
		...props
	});
}
var NAV = [
	{
		to: "/",
		label: "Camp"
	},
	{
		to: "/slots",
		label: "Reels"
	},
	{
		to: "/blackjack",
		label: "Wagon 21"
	},
	{
		to: "/roulette",
		label: "Wheel"
	},
	{
		to: "/fortune",
		label: "Madame"
	},
	{
		to: "/prizes",
		label: "Chest"
	},
	{
		to: "/vault",
		label: "Vault"
	}
];
function CampShell({ camp, children, onBuyHour, onUseHour }) {
	const path = useRouterState({ select: (s) => s.location.pathname });
	const [shop, setShop] = (0, import_react.useState)(false);
	const [blessingLeft, setBlessingLeft] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!camp?.blessingUntil) {
			setBlessingLeft(0);
			return;
		}
		const tick = () => setBlessingLeft(Math.max(0, camp.blessingUntil - Date.now()));
		tick();
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, [camp?.blessingUntil]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/90 px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.22em] text-muted uppercase",
						children: "Social casino · 18+"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-xl font-semibold tracking-tight text-fg md:text-2xl",
						children: "Crimson Caravan"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [camp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-3.5" }),
							label: `${camp.diamonds} diamonds`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, { label: `Lv ${camp.level}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hourglass, { className: "size-3.5" }),
							label: formatClock(camp.playLeftMs)
						}),
						blessingLeft > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }),
							label: `Blessing ${formatClock(blessingLeft)}`
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "gold",
							size: "sm",
							onClick: () => setShop(true),
							children: "Lantern hour"
						})
					] }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mt-3 flex gap-1 overflow-x-auto rounded-lg bg-raised/80 p-1",
				children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.to,
					className: cn("h-10 shrink-0 rounded-md px-3 text-sm font-medium transition-colors", path === item.to ? "bg-surface text-fg" : "text-muted hover:text-fg"),
					children: item.label
				}, item.to))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mt-4 flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-center text-xs text-subtle",
				children: "Entertainment only. Diamonds have no cash value. Prizes are digital goods and subscriptions. One hour of play every four hours."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: shop,
				onOpenChange: setShop,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Lantern hour" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
						"The camp sleeps after an hour. A lantern buys another hour in this window, or wait until the four-hour mark. Every ",
						100,
						" diamonds played earns one free lantern."
					] }),
					camp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Free lanterns: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: camp.bypassTokens })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted",
								children: [
									"Played toward the next free lantern: ",
									camp.wageredTowards,
									" / ",
									100
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									disabled: camp.bypassTokens < 1,
									onClick: async () => {
										await onUseHour();
										setShop(false);
									},
									children: "Light a free lantern"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "gold",
									onClick: async () => {
										await onBuyHour();
										setShop(false);
									},
									children: "Pay $1 (mock)"
								})]
							})
						]
					}) : null
				] })
			})
		]
	});
}
function Stat({ icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-raised px-2.5 font-mono text-xs text-fg tabular-nums",
		children: [icon, label]
	});
}
var Ctx = (0, import_react.createContext)(null);
function CampProvider({ value, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useCampCtx() {
	const v = (0, import_react.useContext)(Ctx);
	if (!v) throw new Error("Camp missing");
	return v;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getCamp = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("51191d100319273b5c5ffad942636425e3cd5a4e4d7e50e2e0a9d3df93bd1420"));
var setAgeOk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("2bd3f6bddfe19d51535e7186a8b7dca0b94888e55f0fe638f12e51d96ab0901d"));
var addPlayTime = createServerFn({ method: "POST" }).validator(object({ ms: number().int().min(0).max(3e4) })).middleware([authMiddleware]).handler(createSsrRpc("cbcb87a4ba8d63f95dc55f85ad132e261795b132647d090460fda2c48b81e082"));
var buyBypass = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("f653692fb1112edb6894da1a7884feeedee1578d0f8882943341a3bc2258f0ee"));
var useBypass = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("7263a900033e1d481c2c5fbe344ee87d6b3384cefdd76815ec0f99b12e96259f"));
var betSchema = object({ bet: number().int().min(1).max(50) });
var spinSlots = createServerFn({ method: "POST" }).validator(betSchema).middleware([authMiddleware]).handler(createSsrRpc("0c279cdc7934b080c7ed2d40da047d5cc7a17fa5292d1da0cb443d1e3be9e29f"));
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
var spinRoulette = createServerFn({ method: "POST" }).validator(rouletteSchema).middleware([authMiddleware]).handler(createSsrRpc("b24212cce2616ef3bcfe097db45c9b34db382f8bed7878c99dadc22e8c75c21e"));
var dealBlackjack = createServerFn({ method: "POST" }).validator(betSchema).middleware([authMiddleware]).handler(createSsrRpc("2c646926acdc0e4e484032e9b4af187cba3a8a02cb6ecdbd1f911dc3e0724375"));
var playBlackjack = createServerFn({ method: "POST" }).validator(object({ action: _enum(["hit", "stand"]) })).middleware([authMiddleware]).handler(createSsrRpc("efc9ebdd7531dc2bc8e65e79ad1b04e1ac3f772ee876f886bd3c9ec42251f50a"));
var readFortune = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("a204b90043fb35b7b8da260e3d727bdc3556d746d6fd75cbc14069b6f43aa2ec"));
var acceptBlessing = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("69a5ac1f7c07c44e9ca416f7323b833d7b161263980d62fc385d45ac67a6dc0e"));
function useCamp() {
	const [camp, setCamp] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const refresh = (0, import_react.useCallback)(async () => {
		try {
			const next = await getCamp();
			setCamp(next);
			setError(null);
			return next;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Camp is closed.");
			return null;
		}
	}, []);
	(0, import_react.useEffect)(() => {
		refresh();
		const id = window.setInterval(() => {
			refresh();
		}, 3e4);
		return () => window.clearInterval(id);
	}, [refresh]);
	return {
		camp,
		error,
		setCamp,
		refresh,
		tickPlay: (0, import_react.useCallback)(async (ms) => {
			try {
				const next = await addPlayTime({ data: { ms } });
				setCamp(next);
			} catch {}
		}, []),
		confirmAge: async () => {
			const next = await setAgeOk();
			setCamp(next);
		},
		purchaseHour: async () => {
			const next = await buyBypass();
			setCamp(next);
		},
		lightLantern: async () => {
			const next = await useBypass();
			setCamp(next);
		}
	};
}
function CampGate({ children }) {
	const { isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-muted",
			children: "The wagons are pulling in…"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampInner, { children }) })] });
}
function CampInner({ children }) {
	const api = useCamp();
	if (!api.camp) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-muted",
			children: api.error ?? "The wagons are pulling in…"
		})
	});
	if (!api.camp.ageOk) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto grid min-h-dvh max-w-md place-items-center px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xs tracking-[0.2em] text-muted uppercase",
					children: "Age gate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-2xl",
					children: "Eighteen and over"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: "Crimson Caravan is a social casino. Diamonds cannot be cashed out. Prizes are digital content and subscriptions. Confirm you are 18 or older."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "mt-5 w-full",
					onClick: () => void api.confirmAge(),
					children: "I am 18 or older"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampProvider, {
		value: {
			camp: api.camp,
			setCamp: api.setCamp
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CampShell, {
			camp: api.camp,
			onBuyHour: api.purchaseHour,
			onUseHour: api.lightLantern,
			children: [api.camp?.playLeftMs === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 rounded-lg border border-border bg-raised px-4 py-3 text-sm",
				children: "The lanterns are out. Wait for the next four-hour window, or buy a lantern hour."
			}) : null, children]
		})
	});
}
//#endregion
export { createSsrRpc as a, playBlackjack as c, spinSlots as d, useCampCtx as f, acceptBlessing as i, readFortune as l, SignedIn as n, dealBlackjack as o, useCurrentUserState as p, SignedOut as r, getCamp as s, CampGate as t, spinRoulette as u };
