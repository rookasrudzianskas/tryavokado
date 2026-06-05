import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";

/**
 * Authenticated symmetric encryption for third-party tokens at rest.
 *
 * Format (all base64): `v1.<iv>.<ciphertext>.<authTag>`.
 * Algorithm: AES-256-GCM. The key is taken from ENCRYPTION_KEY; if it does not
 * decode to exactly 32 bytes it is derived deterministically with scrypt so any
 * sufficiently-long secret works while still yielding a 256-bit key.
 *
 * Never log the key, plaintext, or ciphertext. Never expose to the browser.
 */

const VERSION = "v1";
const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const SCRYPT_SALT = "avokado.token.kdf.v1";

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = env.ENCRYPTION_KEY;
  let key: Buffer;
  try {
    const decoded = Buffer.from(raw, "base64");
    key =
      decoded.length === 32
        ? decoded
        : scryptSync(raw, SCRYPT_SALT, 32);
  } catch {
    key = scryptSync(raw, SCRYPT_SALT, 32);
  }
  cachedKey = key;
  return key;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64"),
    ciphertext.toString("base64"),
    authTag.toString("base64"),
  ].join(".");
}

export function decryptSecret(payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Malformed encrypted payload");
  }
  const [, ivB64, dataB64, tagB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(dataB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

export function encryptJson(value: unknown): string {
  return encryptSecret(JSON.stringify(value));
}

export function decryptJson<T = unknown>(payload: string): T {
  return JSON.parse(decryptSecret(payload)) as T;
}

/** Constant-time comparison for secrets / signatures. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Mask a secret for safe display (keeps last 4 chars). */
export function maskSecret(secret: string, visible = 4): string {
  if (!secret) return "";
  if (secret.length <= visible) return "•".repeat(secret.length);
  return "•".repeat(Math.min(secret.length - visible, 12)) + secret.slice(-visible);
}
