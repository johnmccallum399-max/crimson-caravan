function b64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptText(plain: string) {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const enc = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain),
  );
  return { wrapKey: b64(keyBytes), iv: b64(iv), cipher: b64(enc) };
}

export async function decryptText(cipherB64: string, ivB64: string, wrapKey: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    fromB64(wrapKey),
    "AES-GCM",
    false,
    ["decrypt"],
  );
  const dec = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(ivB64) },
    key,
    fromB64(cipherB64),
  );
  return new TextDecoder().decode(dec);
}

export type SecretBundle = {
  license: string;
  wrapKey: string;
};

export function packSecret(license: string, wrapKey: string | null) {
  const bundle: SecretBundle = { license, wrapKey: wrapKey ?? "" };
  return JSON.stringify(bundle);
}

export function unpackSecret(raw: string | null): SecretBundle | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SecretBundle;
    if (typeof parsed.license !== "string") return null;
    return parsed;
  } catch {
    return { license: raw, wrapKey: "" };
  }
}
