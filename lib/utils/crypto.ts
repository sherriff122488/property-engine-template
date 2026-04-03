/**
 * AES-256-GCM encryption for utility credentials.
 * Key is derived from CREDENTIAL_ENCRYPTION_KEY env var.
 * Only used server-side — never import this in client components.
 */
import crypto from "crypto"

function getKey(): Buffer {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY
  if (!raw || raw === "replace-with-a-strong-random-secret") {
    throw new Error(
      "CREDENTIAL_ENCRYPTION_KEY is not set. Add a strong random string to .env.local."
    )
  }
  // Derive a consistent 32-byte key from the secret
  return crypto.createHash("sha256").update(raw).digest()
}

export function encryptCredential(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12) // 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag() // 16 bytes
  // Pack: iv (12) + authTag (16) + ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString("base64")
}

export function decryptCredential(ciphertext: string): string {
  try {
    const key = getKey()
    const data = Buffer.from(ciphertext, "base64")
    const iv = data.subarray(0, 12)
    const authTag = data.subarray(12, 28)
    const encrypted = data.subarray(28)
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)
    return decipher.update(encrypted).toString("utf8") + decipher.final("utf8")
  } catch {
    return "" // Return empty string if decryption fails
  }
}
