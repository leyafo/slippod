const si = require("systeminformation")
const crypto = require('crypto');

function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

async function fingerprint() {
    const uuid = await si.uuid();
    const cpu = await si.cpu();
    const osInfo = await si.osInfo();

    let info = uuid.os;
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

fingerprint().then(function(fingerprint){
    console.log(fingerprint)
})