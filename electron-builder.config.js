
module.exports = async function () {

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
          "icons/",
    ],
    extraMetadata: {
      version: process.env.npm_package_version,
    },

    // Specify linux target just for disabling snap compilation
    linux: {
      target: "AppImage",
      icon: "icons/icon.png",
    },    
    mac: {
      target: "dmg",
      icon: "icons/icon.icns",
    },
    win: {
      target: "nsis",
      icon: "icons/icon.ico",
    },
  };
};
