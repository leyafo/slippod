const {sendEncryptionRequest} = require('./http.js')
const util = require("util")
const si = require("systeminformation")
const crypto = require('crypto');

function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

async function checkLicense(license, lastCreatedTime) {
    let result = false
    if (license.Type == undefined) {
        result = false
    } else if (license.Type == 'trial') {
        result = await checkTrialLicense(license, lastCreatedTime)
    } else if (license.Type == 'long') {
        result = await checkLongLicense(license)
    }
    return result
}

async function checkTrialLicense(license, lastCreateTime){
    //防止篡改系统时间
    let timeNow = Date.now()
    if (timeNow < lastCreateTime){
        return false
    }
    let startTime  = new Date(license.Start);
    let endTime = new Date(license.End);
    startTime.setUTCHours(0,0,0,0);
    endTime.setUTCHours(23,59,59,999);
    if (timeNow < startTime || timeNow > endTime){
        return false;
    }
	let signatureMessage = util.format("%s-%s,%s.%s",
		license.Start,
		license.End,
		license.Fingerprint,
		license.Type,
	)

    return verify(license.License, license.Signature, signatureMessage)
}

async function checkLongLicense(license){
    let info = await fingerprint()
	let signatureMessage = util.format("%s,%s.%s.%s.%s",
		license.Email,
		info.m,
		info.f,
		info.c,
		license.Type,
	)
    return verify(license.License, license.Signature, signatureMessage)
}

function verify(publicKey, signature, data) {
    const publicKeyData = Buffer.from(publicKey, 'base64');
    const key = Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'), 
        Buffer.from(publicKeyData, 'base64'),
    ])
    const verifyKey = crypto.createPublicKey({
        format: 'der',
        type: 'spki',
        key,
    })
    const signatureData = Buffer.from(signature, 'base64');

    return crypto.verify(null, Buffer.from(data), verifyKey, signatureData);
}


let fingerprintCache = undefined
//初始化模块的时候调用一次，防止后续拿到undefined的值。

fingerprint()
async function fingerprint() {
    if(fingerprintCache != undefined){
        return fingerprintCache
    }
    const uuid = await si.uuid();
    const cpu = await si.cpu();
    const osInfo = await si.osInfo();
    const baseboard = await si.baseboard()
    let interfaces = await si.networkInterfaces()
    let macAddress = ""
    for(let i of  interfaces){
        if(i.default){
            macAddress = i.mac
        }
    }
    let cpuStr = cpu.brand+cpu.model+cpu.family+cpu.cores

    let info = '';
    info += uuid.os
    info += osInfo.platform
    info += cpuStr
    info += baseboard.model

    fingerprintCache = {
        m: uuid.os, //MachineID
        c: macAddress,      //MacAddress
        f: sha256(info),  //Fingerprint
        d: `${osInfo.platform}-${osInfo.distro}-${osInfo.release}-${osInfo.kernel}-${osInfo.arch}`, // description
        bb: baseboard.model,
        p: osInfo.platform,
        u: cpuStr,
    };
}

async function register(key){
    let info = await fingerprint()
    info.p = key

    return sendEncryptionRequest("post", "/register", {}, info)
}

async function register_trial(){
    let info = await fingerprint()
    return sendEncryptionRequest("post", "/register_trial", {}, info)
}


module.exports = {
    register,
    register_trial,
    checkTrialLicense,
    checkLongLicense,
    checkLicense,
}