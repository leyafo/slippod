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

    return {
        m: uuid.os, //MachineID
        c: macAddress,      //MacAddress
        u: cpuStr,
        f: sha256(info),  //Fingerprint
        d: `${osInfo.platform}-${osInfo.distro}-${osInfo.release}-${osInfo.kernel}-${osInfo.arch}`, // description
        bb: baseboard.model,
        p: osInfo.platform,
    };
}

(async function(){
    let info = await fingerprint()
    for(let i = 0; i < 10000; i++){
        let info1 = await fingerprint()
        if(info.f != info1.f){
            console.log(info.f, info1.f)
        }
    }

})()