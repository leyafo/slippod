const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  console.log(process.env.APPLE_ID_PASSWORD);
  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: "com.anywherearc.slippod",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "support@anywherearc.com",
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: "DN5KWP78X9",
  });
};
