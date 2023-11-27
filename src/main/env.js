const path = require('path')

function getResourceURL(...pathes) {
    if (isDev()){
        const urlPath = new URL(path.join(...pathes), "http://localhost:3000");
        return urlPath.toString();
    }

    const filePath = path.join(__dirname, "..", ...pathes);
    return filePath
}  

function nodeEnv(){
    if(process.env.NODE_ENV == undefined){
        return 'production'
    }
    return process.env.NODE_ENV
}

function isDev(){
    return nodeEnv() == 'dev'
}

function isProduction(){
    return !isDev()
}


module.exports = {
    nodeEnv,
    isDev,
    isProduction,
    getResourceURL,
}