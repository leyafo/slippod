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

    return {
        machineID: uuid.os,
        fingerprint: sha256(info),
        osInfo: `${osInfo.platform}-${osInfo.distro}-${osInfo.release}-${osInfo.kernel}-${osInfo.arch}`,
    };
}

(async function(){
    // si.baseboard().then(el => console.log('=======',el))
    // let baseboard = await si.baseboard()
    // console.log(baseboard)
    // si.chassis().then(data => console.log(data));
    
    let uuid = await si.uuid()
    console.log(uuid);
    let net = await si.networkInterfaces()
    let defaultNet = await si.networkInterfaceDefault()
    console.log(net, defaultNet)
    // let audio = await si.audio()
    // console.log(audio)
    // let cpu = await si.cpu();
    // let osInfo = await si.osInfo()
    // console.log(cpu, osInfo);
    // let info = '';
    // let uuid = await si.uuid();
    // console.log(uuid);
    // let mm = uuid.macs.join(',')
    // info += mm
    // info += cpu.brand;
    // info += cpu.model;
    // info += cpu.family;
    // info += cpu.cores;
    // console.log(info)
    // for(let i = 0; i < 10000; i++){
    //     const second = await si.cpu();
    //     let info1 = ""
    //     info1 += mm
    //     info1 += second.brand;
    //     info1 += second.model;
    //     info1 += second.family;
    //     info1 += second.cores;

    //     if (info != info1){
    //         console.log(info, info1)
    //     }
    // }

})()