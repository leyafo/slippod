const crypto = require('crypto')

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519')
const signingKey =
  privateKey.export({ type: 'pkcs8', format: 'der' }).toString('hex')
const verifyKey =
  publicKey.export({ type: 'spki', format: 'der' }).toString('hex')

console.log({ signingKey, verifyKey })
// Some data we're going to embed into the license key
const data = 'leyafo@gmail.com'

// Generate a signature of the data
const signature = crypto.sign(null, Buffer.from(data), privateKey)

// Encode the signature and the dataset using our signing key
const encodedSignature = signature.toString('base64')
const encodedData = Buffer.from(data).toString('base64')

// Combine the encoded data and signature to create a license key
const licenseKey = `${encodedData}.${encodedSignature}`
console.log({ licenseKey })

const valid = crypto.verify(null, Buffer.from(data), publicKey, signature)
console.log({ valid, data })
// => { valid: true, data: 'user@customer.example' }

