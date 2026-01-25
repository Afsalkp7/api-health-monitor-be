import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters long.');
}

export const encrypt = (text: string): string => {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Return format: "IV:EncryptedData"
  // We need the IV to decrypt it later, so we store it with the data.
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt string
export const decrypt = (text: string): string => {
  if (!text) return text;
  
  const textParts = text.split(':');
  
  // Extract the IV (first part) and the Encrypted Content (second part)
  const ivPart = textParts.shift();
  if (!ivPart) return text; 
  
  const iv = Buffer.from(ivPart, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
};