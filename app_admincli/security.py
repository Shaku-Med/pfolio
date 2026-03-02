import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

PBKDF2_ITERATIONS = 100000
SALT_LEN = 16
IV_LEN = 12
KEY_LEN = 32


def _derive_key(password: str, salt: bytes) -> bytes:
    if not password or len(password) < 16:
        raise ValueError("Private key must be at least 16 characters long")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_LEN,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
        backend=default_backend(),
    )
    return kdf.derive(password.encode("utf-8"))


def encrypt(plaintext: str, private_key: str) -> str:
    if not private_key or len(private_key) < 16:
        raise ValueError("Private key must be at least 16 characters long")
    salt = os.urandom(SALT_LEN)
    key = _derive_key(private_key, salt)
    iv = os.urandom(IV_LEN)
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(iv, plaintext.encode("utf-8"), None)
    result = salt + iv + ciphertext
    return base64.b64encode(result).decode("ascii")


def decrypt(encrypted_b64: str, private_key: str) -> str:
    if not private_key or len(private_key) < 16:
        raise ValueError("Private key must be at least 16 characters long")
    if not encrypted_b64:
        raise ValueError("Encrypted string cannot be empty")
    try:
        raw = base64.b64decode(encrypted_b64)
    except Exception:
        raise ValueError("Invalid encrypted data format")
    if len(raw) < SALT_LEN + IV_LEN + 16:
        raise ValueError("Invalid encrypted data format")
    salt = raw[:SALT_LEN]
    iv = raw[SALT_LEN : SALT_LEN + IV_LEN]
    ciphertext = raw[SALT_LEN + IV_LEN :]
    key = _derive_key(private_key, salt)
    aesgcm = AESGCM(key)
    try:
        plaintext = aesgcm.decrypt(iv, ciphertext, None)
        return plaintext.decode("utf-8")
    except Exception as e:
        if "decryption failed" in str(e).lower() or "tag" in str(e).lower():
            raise ValueError("Decryption failed: incorrect key or corrupted data")
        raise
