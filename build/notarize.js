const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(process.env.MACOS_CERTIFICATE);
  return await notarize({
    appBundleId: 'com.anywherearctest.slippodtest',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "iosmediadev@gmail.com",
    appleIdPassword: "SlippodDevDemo",
  });
};
