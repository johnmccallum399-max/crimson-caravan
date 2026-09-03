import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-D7rmuSk2.mjs";
import { t as Button } from "./button-Ct8TeDQa.mjs";
import { a as createSsrRpc, f as useCampCtx, s as getCamp, t as CampGate } from "./gate-C5HfzD_r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-gtd_PNU9.mjs";
import { t as Label } from "./label-B5Z9CQ1t.mjs";
import { r as saveVaultItem } from "./vault-em8Iv6Ws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prizes-BsD4QPsf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var prizeInput = object({
	id: string().optional(),
	title: string().min(1).max(80),
	description: string().max(400),
	kind: _enum(["content", "subscription"]),
	cost: number().int().min(1).max(5e3),
	stock: number().int().min(0).max(99),
	secret: string().max(400).optional(),
	content: string().max(8e4).optional(),
	contentMime: string().max(80).optional(),
	slot_label_1: string().max(40).optional(),
	slot_value_1: string().max(120).optional(),
	slot_label_2: string().max(40).optional(),
	slot_value_2: string().max(120).optional(),
	slot_label_3: string().max(40).optional(),
	slot_value_3: string().max(120).optional()
});
var listPrizes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4f9dde3988918c25ec980be47b8ac6fb4aac04af9adc339a784fe5c0474dbf30"));
var savePrize = createServerFn({ method: "POST" }).validator(prizeInput).middleware([authMiddleware]).handler(createSsrRpc("43b4cc4635cae723b5de8e63d690096e1c2cf7248ddd5c067a0f4c727004a766"));
var claimPrize = createServerFn({ method: "POST" }).validator(object({ id: string() })).middleware([authMiddleware]).handler(createSsrRpc("31c9d62d6e63e28439cab481d90150c273bfea13829c42064a67ca9f98161ca2"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a91aeb9dcfcd7612ede13fed8d32ba8f035d23971ff378f22dd92d7f55a1bd0a"));
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {}) });
}
function Inner() {
	const { camp, setCamp } = useCampCtx();
	const [prizes, setPrizes] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const load = async () => setPrizes(await listPrizes());
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "The chest"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Fill the slots. Secret keys stay hidden until a winner claims, then they are wiped. Digital files open only in the vault."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "gold",
					onClick: () => setOpen((v) => !v),
					children: open ? "Hide form" : "Stock a slot"
				})]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrizeForm, { onSaved: async () => {
				setOpen(false);
				await load();
			} }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: prizes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted",
					children: "Empty wagon. Stock a slot with a title, cost, and a secret key."
				}) : prizes.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-border bg-surface/90 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-muted uppercase",
							children: p.kind
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-1 font-display text-lg",
							children: p.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: p.description || "No description."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-2 space-y-1 text-xs text-subtle",
							children: [
								p.slot_label_1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									p.slot_label_1,
									": ",
									p.slot_value_1
								] }) : null,
								p.slot_label_2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									p.slot_label_2,
									": ",
									p.slot_value_2
								] }) : null,
								p.slot_label_3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									p.slot_label_3,
									": ",
									p.slot_value_3
								] }) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-mono text-sm",
							children: [
								p.cost,
								" diamonds · ",
								p.stock,
								" left · ",
								p.hasSecret ? "key sealed" : "no key"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							className: "mt-3 w-full",
							disabled: !camp || camp.diamonds < p.cost || p.stock < 1,
							onClick: async () => {
								try {
									const delivered = await claimPrize({ data: { id: p.id } });
									await saveVaultItem({
										id: delivered.claimId,
										title: delivered.title,
										kind: delivered.kind,
										mime: delivered.mime,
										body: delivered.content,
										license: delivered.license,
										description: delivered.description,
										slots: delivered.slots,
										savedAt: Date.now()
									});
									setCamp(await getCamp());
									await load();
									toast("Sealed in your vault. The camp has forgotten the key.");
								} catch (err) {
									toast.error(err instanceof Error ? err.message : "The lock held.");
								}
							},
							children: "Claim"
						})
					]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Open claimed goods in the ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/vault",
						children: "vault"
					}),
					". A downloaded",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: ".ccv"
					}),
					" file will not open outside this app."
				]
			})
		]
	});
}
function PrizeForm({ onSaved }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("subscription");
	const [cost, setCost] = (0, import_react.useState)(80);
	const [stock, setStock] = (0, import_react.useState)(1);
	const [secret, setSecret] = (0, import_react.useState)("");
	const [content, setContent] = (0, import_react.useState)("");
	const [l1, setL1] = (0, import_react.useState)("Plan");
	const [v1, setV1] = (0, import_react.useState)("");
	const [l2, setL2] = (0, import_react.useState)("Term");
	const [v2, setV2] = (0, import_react.useState)("");
	const [l3, setL3] = (0, import_react.useState)("Notes");
	const [v3, setV3] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3 rounded-xl border border-border bg-surface/90 p-4 md:grid-cols-2",
		onSubmit: async (e) => {
			e.preventDefault();
			setBusy(true);
			try {
				await savePrize({ data: {
					title,
					description,
					kind,
					cost,
					stock,
					secret: secret || void 0,
					content: content || void 0,
					contentMime: "text/plain",
					slot_label_1: l1 || void 0,
					slot_value_1: v1 || void 0,
					slot_label_2: l2 || void 0,
					slot_value_2: v2 || void 0,
					slot_label_3: l3 || void 0,
					slot_value_3: v3 || void 0
				} });
				toast("Slot stocked. The key is hidden.");
				onSaved();
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Could not stock.");
			} finally {
				setBusy(false);
			}
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Title",
				value: title,
				onChange: setTitle,
				required: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Kind" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: "mt-1 h-11 w-full rounded-md border border-border bg-raised px-3 text-sm",
				value: kind,
				onChange: (e) => setKind(e.target.value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "subscription",
					children: "Subscription"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "content",
					children: "Digital content"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Description",
				value: description,
				onChange: setDescription
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Secret key (write once)",
				value: secret,
				onChange: setSecret,
				type: "password"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Diamond cost",
				value: String(cost),
				onChange: (v) => setCost(Number(v) || 1)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Stock",
				value: String(stock),
				onChange: (v) => setStock(Number(v) || 0)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Slot 1 label",
				value: l1,
				onChange: setL1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Slot 1 value",
				value: v1,
				onChange: setV1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Slot 2 label",
				value: l2,
				onChange: setL2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Slot 2 value",
				value: v2,
				onChange: setV2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Slot 3 label",
				value: l3,
				onChange: setL3
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Slot 3 value",
				value: v3,
				onChange: setV3
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "body",
					children: "Sealed text (optional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "body",
					value: content,
					onChange: (e) => setContent(e.target.value),
					className: "mt-1 min-h-24 w-full rounded-md border border-border bg-raised p-3 text-sm"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "md:col-span-2",
				disabled: busy,
				children: "Seal and stock"
			})
		]
	});
}
function Field({ label, value, onChange, type = "text", required }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		className: "mt-1",
		type,
		required,
		value,
		onChange: (e) => onChange(e.target.value)
	})] });
}
//#endregion
export { Page as component };
