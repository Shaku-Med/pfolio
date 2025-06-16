const crypto = require('crypto');

function encrypt(data, key) {
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
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

function decrypt(encryptedText, key) {
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
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt
};