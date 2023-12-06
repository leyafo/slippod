const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(process.env.CLOUDFLARE_ACCOUNT_ID);
  return await notarize({
    appBundleId: 'com.anywherearctest.slippodtest',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "iosmediadev@gmail.com",
    appleIdPassword: "puga-uooy-ujwg-pdsh",
    teamId: 'F2W7ZZD6VR',
  });
};
