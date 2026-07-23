import "server-only";
import { createDecipheriv, pbkdf2Sync, timingSafeEqual } from "crypto";

const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;
const ITERATIONS = 100000;

/**
 * Mirrors the AES-GCM envelope written by app_admincli/security.py so the
 * dashboard can read admin rows the CLI created.
 */
export function decryptWithWrapper(encryptedB64: string, wrapper: string): string {
  if (wrapper.length < 16) throw new Error("Wrapper key must be at least 16 characters");
  if (!encryptedB64) throw new Error("Nothing to decrypt");

  const raw = Buffer.from(encryptedB64, "base64");
  if (raw.length < SALT_LEN + IV_LEN + TAG_LEN) throw new Error("Bad payload");

  const salt = raw.subarray(0, SALT_LEN);
  const iv = raw.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const body = raw.subarray(SALT_LEN + IV_LEN);
  const ciphertext = body.subarray(0, body.length - TAG_LEN);
  const tag = body.subarray(body.length - TAG_LEN);

  const key = pbkdf2Sync(Buffer.from(wrapper, "utf8"), salt, ITERATIONS, KEY_LEN, "sha256");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
