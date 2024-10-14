const mac = require("./mac.js")
const linuxWindows = require("./linux_windows.js")

function menuTemplate(){
    let template = {}
    switch(process.platform){
    case 'linux':
        template = linuxWindows.template()
        break;
    case 'win32':
        //linux 和 windows 一些快捷键可以通用。
        template = linuxWindows.template()
        break;
    case 'darwin':
        template = mac.macTemplate()
        break;
    default:
        throw new Error("no such platform menu");
    }

    return template
}

module.exports={
    menuTemplate
}
