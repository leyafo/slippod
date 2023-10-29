const si = require('systeminformation');
const crypto = require('crypto');

// promises style - new since version 3
si.cpu()
  .then(data => console.log('cpu======',data))
  .catch(error => console.error(error));

si.system().then(data => console.log('system=======',data));

si.uuid().then(data => console.log('uuid========',data));

si.osInfo().then(data => console.log('os========',data));

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


function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

const result = sha256('Hello, World!');
console.log(result);   // Will print the SHA-256 hash of the input string

console.log(fingerprint().then(function(id){
    console.log(id);
}))