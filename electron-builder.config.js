module.exports = async function () {
    let env = process.env.NODE_ENV

    let fileSet = "icons/"
    if(env != undefined){
        fileSet = {
            "from": "icons/",
            "to": "icons/",
            "filter": ["**white**"]
        }
    }

    return {
        directories: {
            output: 'out',
            buildResources: 'buildResources',
        },
        artifactName: "slippod.${ext}",
        files: [
            {
                "from": "dist",
                "to": "src",
            },
            "package.json",
            "**/node_modules/**/*"
        ],
        extraResources: [
            "libsimple/",
            fileSet,
        ],
        extraMetadata: {
            version: process.env.npm_package_version,
        },

        // Specify linux target just for disabling snap compilation
        linux: {
            target: "AppImage",
            icon: (env === undefined)? "icons/icon.png":"icons/icon_white.png",
        },
        mac: {
            target: "dmg",
            icon: (env === undefined)? "icons/icon.icns":"icons/icon_white.icns",
        },
        win: {
            target: "nsis",
            icon: (env === undefined)? "icons/icon.ico":"icons/icon_white.ico",
        },
    };
};
