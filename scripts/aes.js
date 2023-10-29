const crypto = require('crypto');

// AES-256-CBC 参数
const algorithm = 'aes-256-cbc'; 
const key = crypto.randomBytes(32); // 密钥长度为 32 字节
const iv = crypto.randomBytes(16);  // 初始向量长度为 16 字节

// 加密函数
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('base64'), encryptedData: encrypted.toString('base64') };
}

// 解密函数
function decrypt(text) {
    let iv = Buffer.from(text.iv, 'base64');
    let encryptedText = Buffer.from(text.encryptedData, 'base64');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// 示例使用
const myText = "Hello, world!";
const encrypted = encrypt(myText);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
