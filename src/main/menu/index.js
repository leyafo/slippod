const mac = require("./mac.js")
const window = require("./windows.js")
const linux = require("./linux.js")
const env = require("../env.js")
const db = require("../db.js")

function menuTemplate(){
    let template = {}
    switch(process.platform){
    case 'linux':
        template = linux.linuxTemplate()
        break;
    case 'win32':
        //linux 和 windows 一些快捷键可以通用。
        template = linux.linuxTemplate()
        break;
    case 'darwin':
        template = mac.macTemplate()
        break;
    default:
        throw new Error("no such platform menu");
    }
    if (env.isDev()){
        let licenseMenu = {
            label: 'Dev',
            submenu: [
                {
                    label: 'Remove License',
                    click: function(){
                        db.removeConfig("license");
                    }
                }
            ]
        }
        template.push(licenseMenu);
    }

    return template
}

module.exports={
    menuTemplate
}