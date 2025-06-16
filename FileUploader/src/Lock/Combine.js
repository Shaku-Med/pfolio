const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('./Enc');

const EncryptCombine = (data, keys, options) => {
    try {
        let encryptedData = typeof data === 'object' ? JSON.stringify(data) : data;
        
        if (!keys || keys.length === 0) {
            return null;
        }
        
        for (let i = 0; i < keys.length - 1; i++) {
            if(typeof keys[i] === 'string') {
                encryptedData = encrypt(encryptedData, keys[i]);
            }
            else {
                encryptedData = null
            }
        }

        if(!encryptedData) return null;
        const finalKey = keys[keys.length - 1];
        const jwtToken = jwt.sign({ data: encryptedData }, finalKey, options || {
            algorithm: 'HS512'
        });
        
        return jwtToken;
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
};

const DecryptCombine = (data, keys) => {
    try {
        let encryptedData = typeof data === 'object' ? JSON.stringify(data) : data;
        
        if (!keys || keys.length === 0) {
            return null;
        }
        
        const finalKey = keys[keys.length - 1];
        const decoded = jwt.verify(encryptedData, finalKey);
        
        let decryptedData = decoded && decoded.data;
        
        for (let i = keys.length - 2; i >= 0; i--) {
            if(typeof keys[i] === 'string') {
                decryptedData = decrypt(decryptedData, keys[i]);
            }
            else {
                decryptedData = null
            }
        }

        if(!decryptedData) return null;
        
        try {
            return JSON.parse(decryptedData);
        } catch {
            return decryptedData;
        }
    } catch (e) {
        return e && e.toString().includes('expired') ? undefined : null;
    }
};

module.exports = {
    EncryptCombine,
    DecryptCombine
};