const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(process.env.APPLE_ID_PASSWORD);
  return await notarize({
    appBundleId: 'com.anywherearctest.slippodtest',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "iosmediadev@gmail.com",
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: 'F2W7ZZD6VR',
  });
};
