const {BrowserWindow, app, shell} = require("electron")
const windowMgr = require("../window")

function supportItem(){
    return shell.openExternal("mailto:support@slippod.com?subject=Hello&body=");
}

function openNewCardItem() {
    return BrowserWindow.getFocusedWindow().webContents.send('openNewCard');
}

function startSearchItem(){
    return BrowserWindow.getFocusedWindow().webContents.send('startSearch');
}

function appQuitItem(){
    return app.quit()
}

function minimizeItem(){
    return BrowserWindow.getFocusedWindow().minimize();
}

function showSettingItem(){
    return windowMgr.createSettingsWindow().show()
}


function reloadItem(){
    return BrowserWindow.getFocusedWindow().reload();
}

function toggleDevToolsItem(){
    return BrowserWindow.getFocusedWindow().toggleDevTools();
}
                        
module.exports = {
    supportItem,
    openNewCardItem,
    startSearchItem,
    appQuitItem,
    minimizeItem,
    reloadItem,
    toggleDevToolsItem,
    showSettingItem,
}
