import React from 'react';
import * as jwt from 'jsonwebtoken';
import { encrypt, decrypt } from './Enc';

export const EncryptCombine = (data: any, keys: any[], options?: object) => {
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

export const DecryptCombine = (data: any, keys: any[]) => {
    try {
        if(!data) return null;
        let encryptedData = typeof data === 'object' ? JSON.stringify(data) : data;
        
        if (!keys || keys.length === 0) {
            return null;
        }
        
        const finalKey = keys[keys.length - 1];
        const decoded: any = jwt.verify(encryptedData, finalKey);
        
        let decryptedData = decoded?.data;
        
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
        console.error("Decryption failed:", e);
        return e?.toString()?.includes('expired') ? undefined : null;
    }
};