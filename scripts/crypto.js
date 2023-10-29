const crypto = require('crypto')

function genKey(){
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
    const publicKeyDer = publicKey.export({ type: 'spki', format: 'der' });
    console.log(publicKeyDer.toString('base64'));
}

function verifySignature() {
    const publicKeyBase64 = 'NIziXC5F+9yRYq78dGR7imyLdJ/4z7LL/unVNrX9Pmg='
    const signatureBase64 = 'wQ48ufSSXzL8zt2OMPs4HNVQZZ5NJ6j0/QrBGx8JlRcZbuu+aHPxPujowX5Uuuky4ONIsvm//Tt4WWrU8yY1AQ=='
    const message = 'Hello, world!';

    const key = Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'), // Static value
        Buffer.from(publicKeyBase64, 'base64'),
    ])
 
    const verifyKey = crypto.createPublicKey({
        format: 'der',
        type: 'spki',
        key,
    })

    // const publicKey = Buffer.from(publicKeyBase64, 'base64');
    const signatureData = Buffer.from(signatureBase64, 'base64');
    
    return crypto.verify(null, Buffer.from(message), verifyKey, signatureData);
}

console.log(verifySignature());  // This should print either true (if signature is valid) or false