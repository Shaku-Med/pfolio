import crypto from 'crypto';

export function encrypt(data: string, key: string) {
  try {
    const salt = crypto.randomBytes(16);
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
    const encryptedData = Buffer.concat([
      cipher.update(Buffer.from(data, 'utf8')),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      encryptedData
    ]).toString('base64');
    return result;
  } catch {
    return null;
  }
}

export function decrypt(encryptedText: string, key: string) {
  try {
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    const salt = encryptedBuffer.subarray(0, 16);
    const iv = encryptedBuffer.subarray(16, 32);
    const authTag = encryptedBuffer.subarray(32, 48);
    const encryptedData = encryptedBuffer.subarray(48);
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512');
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}