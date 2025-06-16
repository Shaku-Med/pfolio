interface VerifyProps {
    email?: {
        required?: boolean;
        text?: string;
    };
    password?: {
        required?: boolean;
        text?: string;
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
    };
    confirmPassword?: {
        required?: boolean;
        text?: string;
        matchWith?: string;
    };
    code?: {
        required?: boolean;
        text?: string;
        length?: number;
        alphanumeric?: boolean;
    };
    username?: {
        required?: boolean;
        text?: string;
        minLength?: number;
        maxLength?: number;
        allowSpecialChars?: boolean;
    };
    phone?: {
        required?: boolean;
        text?: string;
        countryCode?: string;
    };
    date?: {
        required?: boolean;
        text?: string;
        format?: string;
        minDate?: Date;
        maxDate?: Date;
    };
    url?: {
        required?: boolean;
        text?: string;
        requireHttps?: boolean;
    };
    zipCode?: {
        required?: boolean;
        text?: string;
        country?: string;
    };
    creditCard?: {
        required?: boolean;
        text?: string;
        types?: string[];
    };
    ipAddress?: {
        required?: boolean;
        text?: string;
        version?: "v4" | "v6" | "both";
    };
    returnBoolean?: boolean;
}

const Verification = (data: VerifyProps): boolean | string => {
    try {
        if (data.email?.required) {
            if (!data.email.text) 
                return data.returnBoolean ? false : "Email is required";
            
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(data.email.text)) 
                return data.returnBoolean ? false : "Please enter a valid email address";
        }

        if (data.password?.required) {
            if (!data.password.text) 
                return data.returnBoolean ? false : "Password is required";
            
            const minLength = data.password.minLength || 8;
            if (data.password.text.length < minLength)
                return data.returnBoolean ? false : `Password must be at least ${minLength} characters long`;
            
            if (data.password.requireUppercase && !/[A-Z]/.test(data.password.text)) 
                return data.returnBoolean ? false : "Password must contain at least one uppercase letter";
            
            if (data.password.requireLowercase && !/[a-z]/.test(data.password.text)) 
                return data.returnBoolean ? false : "Password must contain at least one lowercase letter";
            
            if (data.password.requireNumbers && !/\d/.test(data.password.text)) 
                return data.returnBoolean ? false : "Password must contain at least one number";
            
            if (data.password.requireSpecialChars && !/[!@#?$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password.text)) 
                return data.returnBoolean ? false : "Password must contain at least one special character";
            
            if (!data.password.requireUppercase && !data.password.requireLowercase && 
                !data.password.requireNumbers && !data.password.requireSpecialChars) {
                const defaultPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
                if (!defaultPasswordRegex.test(data.password.text)) 
                    return data.returnBoolean ? false : "Password must contain at least one letter and one number";
            }
        }

        if (data.confirmPassword?.required) {
            if (!data.confirmPassword.text)
                return data.returnBoolean ? false : "Please confirm your password";
            
            if (data.confirmPassword.matchWith && data.confirmPassword.text !== data.confirmPassword.matchWith)
                return data.returnBoolean ? false : "Passwords do not match";
        }

        if (data.code?.required) {
            if (!data.code.text) 
                return data.returnBoolean ? false : "Code is required";
            
            const codeLength = data.code.length || 6;
            
            if (data.code.alphanumeric) {
                const alphanumericRegex = new RegExp(`^[a-zA-Z0-9]{${codeLength}}$`);
                if (!alphanumericRegex.test(data.code.text)) 
                    return data.returnBoolean ? false : `Code must be ${codeLength} alphanumeric characters`;
            } else {
                const numericRegex = new RegExp(`^\\d{${codeLength}}$`);
                if (!numericRegex.test(data.code.text)) 
                    return data.returnBoolean ? false : `Code must be ${codeLength} digits`;
            }
        }

        if (data.username?.required) {
            if (!data.username.text) 
                return data.returnBoolean ? false : "Username is required";
            
            const minLength = data.username.minLength || 3;
            const maxLength = data.username.maxLength || 20;
            
            if (data.username.text.length < minLength || data.username.text.length > maxLength) 
                return data.returnBoolean ? false : `Username must be between ${minLength} and ${maxLength} characters`;
            
            let usernameRegex;
            if (data.username.allowSpecialChars) {
                usernameRegex = new RegExp(`^[a-zA-Z0-9._-]{${minLength},${maxLength}}$`);
            } else {
                usernameRegex = new RegExp(`^[a-zA-Z0-9]{${minLength},${maxLength}}$`);
            }
            
            if (!usernameRegex.test(data.username.text)) 
                return data.returnBoolean ? false : data.username.allowSpecialChars ? 
                    "Username can only contain letters, numbers, periods, underscores, and hyphens" : 
                    "Username can only contain letters and numbers";
        }

        if (data.phone?.required) {
            if (!data.phone.text) 
                return data.returnBoolean ? false : "Phone number is required";
            
            if (data.phone.countryCode === "US") {
                const usPhoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                if (!usPhoneRegex.test(data.phone.text)) 
                    return data.returnBoolean ? false : "Please enter a valid US phone number";
            } else if (data.phone.countryCode === "UK") {
                const ukPhoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
                if (!ukPhoneRegex.test(data.phone.text)) 
                    return data.returnBoolean ? false : "Please enter a valid UK phone number";
            } else {
                const generalPhoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
                if (!generalPhoneRegex.test(data.phone.text)) 
                    return data.returnBoolean ? false : "Please enter a valid phone number";
            }
        }

        if (data.date?.required) {
            if (!data.date.text) 
                return data.returnBoolean ? false : "Date is required";
            
            let dateObj: Date;
            
            if (data.date.format === "YYYY-MM-DD") {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(data.date.text)) 
                    return data.returnBoolean ? false : "Date must be in YYYY-MM-DD format";
                dateObj = new Date(data.date.text);
            } else if (data.date.format === "MM/DD/YYYY") {
                const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
                if (!dateRegex.test(data.date.text)) 
                    return data.returnBoolean ? false : "Date must be in MM/DD/YYYY format";
                const [month, day, year] = data.date.text.split('/');
                dateObj = new Date(`${year}-${month}-${day}`);
            } else {
                dateObj = new Date(data.date.text);
            }
            
            if (isNaN(dateObj.getTime())) 
                return data.returnBoolean ? false : "Please enter a valid date";
            
            if (data.date.minDate && dateObj < data.date.minDate) 
                return data.returnBoolean ? false : `Date must be after ${data.date.minDate.toLocaleDateString()}`;
            
            if (data.date.maxDate && dateObj > data.date.maxDate) 
                return data.returnBoolean ? false : `Date must be before ${data.date.maxDate.toLocaleDateString()}`;
        }

        if (data.url?.required) {
            if (!data.url.text) 
                return data.returnBoolean ? false : "URL is required";
            
            let urlRegex;
            if (data.url.requireHttps) {
                urlRegex = /^https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
            } else {
                urlRegex = /^(http|https):\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
            }
            
            if (!urlRegex.test(data.url.text)) 
                return data.returnBoolean ? false : data.url.requireHttps ? 
                    "Please enter a valid HTTPS URL" : "Please enter a valid URL";
        }

        if (data.zipCode?.required) {
            if (!data.zipCode.text) 
                return data.returnBoolean ? false : "Zip code is required";
            
            if (data.zipCode.country === "US") {
                const usZipRegex = /^\d{5}(-\d{4})?$/;
                if (!usZipRegex.test(data.zipCode.text)) 
                    return data.returnBoolean ? false : "Please enter a valid US zip code";
            } else if (data.zipCode.country === "UK") {
                const ukZipRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
                if (!ukZipRegex.test(data.zipCode.text)) 
                    return data.returnBoolean ? false : "Please enter a valid UK postal code";
            } else if (data.zipCode.country === "CA") {
                const caZipRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
                if (!caZipRegex.test(data.zipCode.text)) 
                    return data.returnBoolean ? false : "Please enter a valid Canadian postal code";
            } else {
                const generalZipRegex = /^[0-9A-Z]{3,10}$/i;
                if (!generalZipRegex.test(data.zipCode.text)) 
                    return data.returnBoolean ? false : "Please enter a valid postal/zip code";
            }
        }

        if (data.creditCard?.required) {
            if (!data.creditCard.text) 
                return data.returnBoolean ? false : "Credit card number is required";
            
            const sanitizedCardNumber = data.creditCard.text.replace(/\D/g, '');
            
            if (!/^\d{13,19}$/.test(sanitizedCardNumber)) 
                return data.returnBoolean ? false : "Please enter a valid credit card number";
            
            const isLuhnValid = (number: string): boolean => {
                let sum = 0;
                let shouldDouble = false;
                
                for (let i = number.length - 1; i >= 0; i--) {
                    let digit = parseInt(number.charAt(i));
                    
                    if (shouldDouble) {
                        digit *= 2;
                        if (digit > 9) digit -= 9;
                    }
                    
                    sum += digit;
                    shouldDouble = !shouldDouble;
                }
                
                return sum % 10 === 0;
            };
            
            if (!isLuhnValid(sanitizedCardNumber)) 
                return data.returnBoolean ? false : "Invalid credit card number";
            
            if (data.creditCard.types && data.creditCard.types.length > 0) {
                const cardRegexes: {[key: string]: RegExp} = {
                    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
                    mastercard: /^5[1-5][0-9]{14}$/,
                    amex: /^3[47][0-9]{13}$/,
                    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
                };
                
                const isValidCardType = data.creditCard.types.some(type => {
                    const regex = cardRegexes[type];
                    return regex && regex.test(sanitizedCardNumber);
                });
                
                if (!isValidCardType) 
                    return data.returnBoolean ? false : `Card type must be: ${data.creditCard.types.join(', ')}`;
            }
        }

        if (data.ipAddress?.required) {
            if (!data.ipAddress.text) 
                return data.returnBoolean ? false : "IP address is required";
            
            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
            
            if (data.ipAddress.version === "v4") {
                if (!ipv4Regex.test(data.ipAddress.text)) 
                    return data.returnBoolean ? false : "Please enter a valid IPv4 address";
            } else if (data.ipAddress.version === "v6") {
                if (!ipv6Regex.test(data.ipAddress.text)) 
                    return data.returnBoolean ? false : "Please enter a valid IPv6 address";
            } else {
                if (!ipv4Regex.test(data.ipAddress.text) && !ipv6Regex.test(data.ipAddress.text)) 
                    return data.returnBoolean ? false : "Please enter a valid IP address";
            }
        }

        return data.returnBoolean ? true : "";
    }
    catch (error) {
        return data.returnBoolean ? false : "Validation error occurred";
    }
}

export default Verification;