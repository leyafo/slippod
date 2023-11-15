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

(async function(){

    const first = await si.cpu();
    let info = ""
    info += first.brand;
    info += first.model;
    info += first.family;
    info += first.cores;
    // for(let i = 0; i < 10000; i++){
    //     const second = await si.cpu();
    //     let info1 = ""
    //     info1 += second.brand;
    //     info1 += second.model;
    //     info1 += second.family;
    //     info1 += second.cores;
    //     for(let k of Object.keys(first)){
    //         if (info != info1){
    //             console.log(info, info1)
    //         }
    //     }
    // }

    let uuid = await si.uuid();
    let macs = ""
    for (let mac of uuid.macs) {
        macs += mac;
    }
    for (let i = 0; i < 10000; i++) {
        let uuid1 = await si.uuid();
        let macs1 = ""
        for (let mac of uuid1.macs) {
            macs1 += mac;
        }
        if (macs != macs1){
            console.log(macs, macs1)
        }
    }

})()