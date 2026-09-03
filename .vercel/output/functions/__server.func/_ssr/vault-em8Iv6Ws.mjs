//#region node_modules/.nitro/vite/services/ssr/assets/vault-em8Iv6Ws.js
var DB = "crimson-caravan";
var STORE = "vault";
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB, 1);
		req.onupgradeneeded = () => {
			if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
async function saveVaultItem(item) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(item);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function listVault() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => {
			resolve(req.result.sort((a, b) => b.savedAt - a.savedAt));
		};
		req.onerror = () => reject(req.error);
	});
}
function downloadLocked(item) {
	const payload = {
		v: 1,
		app: "crimson-caravan",
		title: item.title,
		note: "This file opens only inside Crimson Caravan.",
		sealed: btoa(unescape(encodeURIComponent(JSON.stringify(item))))
	};
	const blob = new Blob([JSON.stringify(payload)], { type: "application/octet-stream" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${item.title.replace(/\s+/g, "-")}.ccv`;
	a.click();
	URL.revokeObjectURL(url);
}
//#endregion
export { listVault as n, saveVaultItem as r, downloadLocked as t };
