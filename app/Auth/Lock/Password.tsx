import * as bcrypt from 'bcryptjs'
import CryptoJS from 'crypto-js';
import SetToken, { getClientIP } from '../IsAuth/Token/SetToken';
import { cookies, headers } from 'next/headers';
import { DecryptCombine, EncryptCombine } from './Combine';
import {v4 as uuid} from 'uuid'
// 
export const BcryptPass = async (password: string) =>  {
    try {
        if(!password) return null;
        // 
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);
        return hash
    }
    catch {
        return null
    }
}

export const CH = (password: string, isVerify?: boolean, storedHash?: string) => {
    try {
      if (!password) return null;
      
      if (isVerify) {
        if (!storedHash) return false;
        
        const passwordHash = CryptoJS.HmacSHA512(password, `${process.env.VERIFYCODEPASS}`).toString();
        return passwordHash === storedHash;
      } else {
        const passwordHash = CryptoJS.HmacSHA512(password, `${process.env.VERIFYCODEPASS}`).toString();
        return passwordHash;
      }
    } catch (error) {
      console.error("Error in CH function:", error);
      return null;
    }
  }

export const CreatePassword = async (password: string) => {
    try {
        let h = await headers()
        if(!password) return null;
        // 
        let pass = await BcryptPass(password)
        if(!pass) return null
        //
        let p = password.split('')
        let psmall = password.slice(p.length / 4, p.length / 2)
        // New Password
        let obj = {
            ip: await getClientIP(h),
            device: h.get('user-agent'),
            time: new Date().getTime(),
            password: pass,
        }
        let pass2 = CryptoJS.AES.encrypt(JSON.stringify(obj), `${psmall}+${process.env.PASS2}`).toString()
        //
        let keys = [
            `${psmall.slice(0, 1)}`,
            `${process.env.PASS1}`,
            `${process.env.PASS4}`,
            `${process.env.PASS3}`
        ]
        // 
        let pass3 = EncryptCombine(pass2, keys)
        return pass3
    }
    catch {
        return null
    }
}

export const VerifyPassword = async (inputPassword: string, storedEncryptedPassword: string) => {
    try {
        let h = await headers()
        if(!inputPassword || !storedEncryptedPassword) return false;
        
        let p = inputPassword.split('')
        let psmall = inputPassword.slice(p.length / 4, p.length / 2)
        
        let keys = [
            `${psmall.slice(0, 1)}`,
            `${process.env.PASS1}`,
            `${process.env.PASS4}`,
            `${process.env.PASS3}`
        ]
        
        let decryptedPass2 = DecryptCombine(storedEncryptedPassword, keys)
        if(!decryptedPass2) return false;
        
        let bytes = CryptoJS.AES.decrypt(decryptedPass2, `${psmall}+${process.env.PASS2}`);
        let decryptedObj = JSON.parse(bytes?.toString(CryptoJS.enc.Utf8));
        
        const storedHash = decryptedObj.password;
        
        const isMatch = await bcrypt.compare(inputPassword, storedHash);
        return isMatch;
    }
    catch(error) {
        // console.error("Password verification error:", error);
        return false;
    }
}



// Generate UID for the user

  
  export const GTUSER = (l?: number): string | null => {
    try {
      let ui = uuid().split('-').join('').toUpperCase();
      ui = l ? ui.slice(0, l) : ui;
      
      const encodedValue = btoa(ui);
      const clientId = encodedValue
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      return clientId;
    }
    catch (e) {
      return null;
    }
  };
  
  interface CHeckWhere {
    name?: string;
    length?: number;
  }
  
  export const GenerateId = async (table?: string, cWhere?: CHeckWhere[], Supabase?: any): Promise<Record<string, string> | null> => {
    try {
      if (!table || !cWhere || cWhere.length === 0 || !Supabase) {
        return null;
      }

      // 
      // Generate IDs for each field specified in cWhere
      const generatedIds: Record<string, string> = {};
      
      for (const field of cWhere) {
        if (field.name) {
          const generatedId = GTUSER(field.length);
          if (generatedId) {
            generatedIds[field.name] = generatedId;
          }
        }
      }
      // 
      // Check if any of the generated IDs already exist in the database
      let idExists = false;
      
      for (const [fieldName, fieldValue] of Object.entries(generatedIds)) {
        const { data } = await Supabase
          .from(table)
          .select('*')
          .eq(fieldName, fieldValue)
          .limit(1);
          
        if (data && data.length > 0) {
          idExists = true;
          break;
        }
      }
      // 
      // If any ID exists, recursively try again
      if (idExists) {
        return GenerateId(table, cWhere, Supabase);
      }
      
      return generatedIds;
      
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  export async function generateOtp(
    length: number = 6,
    options: {
      includeNumbers?: boolean;
      includeUppercase?: boolean;
      includeLowercase?: boolean;
      includeSymbols?: boolean;
    } = {}
  ): Promise<string | null> {
    try {
      const config = {
        includeNumbers: options.includeNumbers ?? true,
        includeUppercase: options.includeUppercase ?? false,
        includeLowercase: options.includeLowercase ?? false,
        includeSymbols: options.includeSymbols ?? false,
      };
  
      const numbers = '0123456789';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
      let charPool = '';
      if (config.includeNumbers) charPool += numbers;
      if (config.includeUppercase) charPool += uppercase;
      if (config.includeLowercase) charPool += lowercase;
      if (config.includeSymbols) charPool += symbols;
  
      if (charPool === '') charPool = numbers;
  
      let otp = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charPool.length);
        otp += charPool[randomIndex];
      }
  
      return otp;
    } catch (e) {
      return null;
    }
  }

  interface SIGNOPTIONS {
    secure?: boolean;
}

interface SIGNIN {
    name?: string;
    value?: string;
    shouldEncrypt?: boolean;
    keys?: string[];
    options?: SIGNOPTIONS;

}

export const SetLoginCookie = async (data?: SIGNIN[]): Promise<boolean> => {
    try {
        let c = await cookies();
        let h = await headers();
        let au = h.get(`user-agent`)?.split(/\s+/).join('')
        if(!data) return false;
        
        for (const item of data) {
            if (item.name && item.value) {
                if(item?.shouldEncrypt){
                    let ky = [`${au}`, `${await getClientIP(h)}`]
                    if(item?.keys){
                        ky = [...ky, ...item?.keys]
                    }
                    // 
                    let session = await SetToken({
                      expiresIn: '60d',
                      algorithm: 'HS512'
                    }, ky, {
                      data: item?.value
                    })
                    // 
                    c.set(`${item?.name}`, `${session}`, item?.options)
                }
                else {
                    c.set(`${item?.name}`, `${item?.value}`, item?.options)
                }

            }
        }
        
        return true;
    }
    catch {
        return false;
    }
}