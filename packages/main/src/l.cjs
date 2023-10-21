
const db = require('./db.cjs')
const {post, get} = require('./http.cjs')
const si = require("systeminformation")
const crypto = require('crypto');

const licenseKey = 'license'
const emailKey = 'email'

function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

async function checkLicense(){
    let license = db.getConfig(licenseKey)
    let email = db.getConfig(emailKey)
    let splites = license.split(":")
    let publicKey = splites[0]
    let signature = splites[1] 
    let sysinfo = await fingerprint()

    return verify(publicKey, signature, sysinfo, email)
}

function verify(publicKey, signature, sysinfo, email) {
    const publicKeyData = Buffer.from(publicKey, 'base64');
    const key = Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'), // Static value
        Buffer.from(publicKeyData, 'base64'),
    ])
    const verifyKey = crypto.createPublicKey({
        format: 'der',
        type: 'spki',
        key,
    })
    const signatureData = Buffer.from(signature, 'base64');

    let data = email + ',' + sysinfo.machineID + '.' + sysinfo.fingerprint;
    return crypto.verify(null, Buffer.from(data), verifyKey, signatureData);
}

async function fingerprint() {
    const uuid = await si.uuid();
    const cpu = await si.cpu();
    const osInfo = await si.osInfo();

    let info = "";
    for (let mac of uuid.macs) {
        info += mac;
    }
    info += cpu.brand;
    info += cpu.model;
    info += cpu.family;
    info += cpu.cores;
    for (let k of Object.keys(cpu.cache)) {
        info += cpu.cache[k];
    }

    return {
        machineID: uuid.os,
        fingerprint: sha256(info),
        osInfo: `${osInfo.platform}-${osInfo.distro}-${osInfo.release}-${osInfo.kernel}-${osInfo.arch}`,
    };
}

async function register(key){
    let info = await fingerprint()

    let rawBody = JSON.stringify({
        "machine_id": info.machineID,
        "fingerprint": info.fingerprint,
        "public_key": key,
        "description": info.osInfo
    })
    let response = await post("https://dooku.littletunnel.com/register", {}, rawBody)
    console.log(response)
    if(response.statusCode == 200){
        let body = JSON.parse(response.body)
        let isvaliad = verify(key, body.data.Signature, info, body.data.Email)
        if(isvaliad){
            console.log('200 ok')
            db.setConfig(licenseKey, `${key}:${body.data.Signature}`)
            db.setConfig(emailKey, body.data.Email)
            console.log(db.getConfig(licenseKey))
        }else{
            console.Error("not valid")
        }
    } 
}

module.exports = {
    checkLicense,
    register,
}