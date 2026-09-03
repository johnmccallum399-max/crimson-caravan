const DB = "crimson-caravan";
const STORE = "vault";

export type VaultItem = {
  id: string;
  title: string;
  kind: string;
  mime: string | null;
  body: string | null;
  license: string | null;
  description: string;
  slots: { label: string | null; value: string | null }[];
  savedAt: number;
};

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVaultItem(item: VaultItem) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listVault(): Promise<VaultItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as VaultItem[]).sort((a, b) => b.savedAt - a.savedAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export function downloadLocked(item: VaultItem) {
  const payload = {
    v: 1,
    app: "crimson-caravan",
    title: item.title,
    note: "This file opens only inside Crimson Caravan.",
    sealed: btoa(unescape(encodeURIComponent(JSON.stringify(item)))),
  };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.title.replace(/\s+/g, "-")}.ccv`;
  a.click();
  URL.revokeObjectURL(url);
}
