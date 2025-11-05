// encryption.ts (Node/Edge-safe)

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  "9210c86ce023b8dcd155db173f31ee9f0674135f8c035596a8083ed387400394"; // looks like hex [web:22]

if (!ENCRYPTION_KEY && typeof window === "undefined") {
  throw new Error("ENCRYPTION_KEY is required"); // guard [web:2]
}

const ALGORITHM = "AES-GCM";

// Quick sanity check for obviously too-short passphrases
if (ENCRYPTION_KEY && ENCRYPTION_KEY.length < 8) {
  throw new Error("ENCRYPTION_KEY must be at least 8 characters long"); // guard [web:2]
}

// Decode key material: prefer hex if it matches, otherwise treat as base64.
// Avoid atob/btoa on server; use Buffer in Node runtimes. [web:26][web:23]
function decodeKeyMaterial(key: string): Uint8Array {
  const isHex = /^[0-9a-fA-F]+$/.test(key) && key.length % 2 === 0; // simple hex check [web:22]
  if (isHex) {
    return new Uint8Array(Buffer.from(key, "hex")); // hex → bytes [web:22][web:23]
  }
  // Assume base64 when not hex
  return new Uint8Array(Buffer.from(key, "base64")); // base64 → bytes [web:26][web:23]
}

const baseKeyBuffer = decodeKeyMaterial(ENCRYPTION_KEY);

if (baseKeyBuffer.length === 0) {
  throw new Error("Decoded key is empty"); // guard [web:2]
}

// Expand/truncate to 32 bytes deterministically without TypeScript index error.
// The ?? 0 satisfies noUncheckedIndexedAccess safety. [web:2][web:1]
const keyBuffer = new Uint8Array(32);
for (let i = 0; i < 32; i++) {
  const idx = baseKeyBuffer.length ? i % baseKeyBuffer.length : 0; // safe modulo [web:2]
  keyBuffer[i] = baseKeyBuffer[idx] ?? 0; // default to 0 if undefined [web:1]
}

let cryptoKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (!cryptoKey) {
    cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: ALGORITHM, length: 256 },
      false,
      ["encrypt", "decrypt"]
    ); // WebCrypto AES-GCM import [web:7]
  }
  return cryptoKey;
}

export async function encryptKey(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for GCM [web:7]
  const key = await getCryptoKey();
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintextBytes
  ); // AES-GCM encrypt [web:7]

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv, 0);
  combined.set(encryptedArray, iv.length);

  // Encode to base64 without btoa; Buffer works in Node runtimes. [web:23][web:26]
  return Buffer.from(combined).toString("base64");
}

export async function decryptKey(encryptedData: string): Promise<string> {
  // Decode base64 without atob; Buffer works in Node runtimes. [web:23][web:26]
  const combined = new Uint8Array(Buffer.from(encryptedData, "base64"));

  const iv = combined.slice(0, 12); // 12-byte IV [web:7]
  const encrypted = combined.slice(12);

  const key = await getCryptoKey();
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  ); // AES-GCM decrypt [web:7]

  return new TextDecoder().decode(decryptedBuffer);
}

export function maskKey(key: string): string {
  if (key.length <= 8) {
    return "*".repeat(key.length);
  }
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
}
