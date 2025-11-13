const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 12 bytes for GCM

// Helper: Convert hex string to Uint8Array (without Buffer)
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Helper: Convert base64 string to Uint8Array (without atob in Node)
function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binaryString = atob(base64);
  const buffer = new ArrayBuffer(binaryString.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Convert Uint8Array to base64 string (without btoa issues)
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000; // Process in chunks to avoid stack overflow
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

// Derive a 32-byte key from environment variable or provided key string
function deriveKey(keyString: string): Uint8Array<ArrayBuffer> {
  if (!keyString || keyString.length < 8) {
    throw new Error("ENCRYPTION_KEY must be at least 8 characters long");
  }

  // Check if it's a hex string
  const isHex = /^[0-9a-fA-F]+$/.test(keyString) && keyString.length % 2 === 0;

  let baseKeyBuffer: Uint8Array<ArrayBuffer>;
  if (isHex && keyString.length === 64) {
    // Perfect 32-byte hex key
    baseKeyBuffer = hexToBytes(keyString);
  } else if (isHex) {
    // Other hex format
    baseKeyBuffer = hexToBytes(keyString);
  } else {
    // Treat as UTF-8 string - create with proper ArrayBuffer
    const encoder = new TextEncoder();
    const encoded = encoder.encode(keyString);
    const buffer = new ArrayBuffer(encoded.length);
    const view = new Uint8Array(buffer);
    view.set(encoded);
    baseKeyBuffer = view;
  }

  if (baseKeyBuffer.length === 0) {
    throw new Error("Decoded key is empty");
  }

  // Expand/truncate to exactly 32 bytes with proper ArrayBuffer type
  const keyArrayBuffer = new ArrayBuffer(KEY_LENGTH);
  const keyBuffer = new Uint8Array(keyArrayBuffer);
  for (let i = 0; i < KEY_LENGTH; i++) {
    const idx = i % baseKeyBuffer.length;
    keyBuffer[i] = baseKeyBuffer[idx] ?? 0;
  }

  return keyBuffer;
}

// Import the crypto key (cached)
let cryptoKeyCache: CryptoKey | null = null;

async function getCryptoKey(keyString: string): Promise<CryptoKey> {
  if (!cryptoKeyCache) {
    const keyBuffer = deriveKey(keyString);
    cryptoKeyCache = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: ALGORITHM, length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  return cryptoKeyCache;
}

/**
 * Encrypt a plaintext string using AES-GCM
 * @param plaintext - The string to encrypt
 * @param encryptionKey - The encryption key (from env vars in Convex functions)
 * @returns Base64-encoded encrypted data (IV + ciphertext)
 */
export async function encryptKey(
  plaintext: string,
  encryptionKey: string
): Promise<string> {
  const ivBuffer = new ArrayBuffer(IV_LENGTH);
  const iv = new Uint8Array(ivBuffer);
  crypto.getRandomValues(iv);

  const key = await getCryptoKey(encryptionKey);
  const plaintextBytes = new TextEncoder().encode(plaintext);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintextBytes
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  const combinedBuffer = new ArrayBuffer(iv.length + encryptedArray.length);
  const combined = new Uint8Array(combinedBuffer);
  combined.set(iv, 0);
  combined.set(encryptedArray, iv.length);

  return bytesToBase64(combined);
}

/**
 * Decrypt an encrypted string using AES-GCM
 * @param encryptedData - Base64-encoded encrypted data (IV + ciphertext)
 * @param encryptionKey - The encryption key (from env vars in Convex functions)
 * @returns The decrypted plaintext string
 */
export async function decryptKey(
  encryptedData: string,
  encryptionKey: string
): Promise<string> {
  const combined = base64ToBytes(encryptedData);

  const iv = combined.slice(0, IV_LENGTH);
  const encrypted = combined.slice(IV_LENGTH);

  const key = await getCryptoKey(encryptionKey);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Mask an API key for display purposes
 * @param key - The key to mask
 * @returns A masked version showing only first and last 4 characters
 */
export function maskKey(key: string): string {
  if (key.length <= 8) {
    return "*".repeat(key.length);
  }
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
}
