const https = require('https');
const http = require('http');
const crypto = require('crypto')

const serverHost = `dooku.littletunnel.com`
const serverPubKey = `sv3uorYgIHIQSQwoKx0SdoclI2mNHN0+eOav4SCVnT8=`;

async function httpRequest(method, path, headers, body = null) {
    let options = { }
    let protocol = https
    if (import.meta.env.DEV){
        protocol = http
        options = {
            hostname: "127.0.0.1",
            port: 9527,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    }else{
        options = {
            hostname: serverHost,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    }
    return new Promise((resolve, reject) => { 
        for(let k of Object.keys(headers)){
            options.headers[k] = headers[k]
        }

        if (body) {
            options.headers['Content-Length'] = Buffer.from(body).length;
        }

        const req = protocol.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: responseData,
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

function post(path, headers, body = null) {
    return httpRequest("post", path, headers, body)
}

function get(path, headers, body = null) {
    return httpRequest("get", path, headers, body)
}

function encrypt(text, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('base64'), encryptedData: encrypted.toString('base64') };
}

function decrypt(text, key){
    const splittedText = text.split(':')
    const iv = Buffer.from(splittedText[0], "base64")
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decryptedText = decipher.update(Buffer.from(splittedText[1], "base64"), null, 'utf8');
    decryptedText += decipher.final('utf8');
    return decryptedText
}

function generateSharedKey(remotePubKey){
    const kp = crypto.generateKeyPairSync('x25519');
    const spkiHeader = Buffer.from('302a300506032b656e032100', 'hex')
    const remotePubKeyArray = Buffer.concat([
        spkiHeader, // Static value
        Buffer.from(remotePubKey, 'base64'),
    ])
    const spkiRemotePubKey = crypto.createPublicKey({
        format: 'der',
        type: 'spki',
        key: remotePubKeyArray,
    })
    const sharedKey = crypto.diffieHellman({
        privateKey: kp.privateKey,
        publicKey: spkiRemotePubKey,
    });
    const currentPubKey = kp.publicKey.export({ type: 'spki', format: 'der' }).subarray(spkiHeader.length).toString('base64')
    return {sharedKey: sharedKey, pubKey: currentPubKey}
}

function hmac(content, key){
    const hmac      = crypto.createHmac('sha256', key);
    const digest    = hmac.update(content).digest('hex')
    return digest
}

async function sendEncryptionRequest(method, path, header, data){
    const timestamp = `${Date.now()}`
    const sk = generateSharedKey(serverPubKey)
    const rawBody = JSON.stringify(data)
    const iv = crypto.randomBytes(16)
    const cypherText = encrypt(rawBody, sk.sharedKey, iv)
    const cypherBody = cypherText.iv+':'+cypherText.encryptedData
    const sendHeader = {
        "timestamp":`${timestamp}`,
        "hmac": hmac(rawBody, sk.sharedKey),
        "pubkey": sk.pubKey,
    }
    for(let k of Object.keys(header)){
        sendHeader[k] = header[k]
    }

    const response = await httpRequest(method, path, sendHeader, cypherBody)
    if(response.statusCode == 200){
        const body = decrypt(response.body, sk.sharedKey)
        return {
            headers: response.headers,
            statusCode: response.statusCode,
            body: body
        }
    }else{
        return response
    }
}

module.exports = {
    post,
    get,
    encrypt,
    decrypt,
    generateSharedKey,
    hmac,
    sendEncryptionRequest
}