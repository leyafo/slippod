const {BrowserWindow, app} = require('electron');
const db = require('./db.js');
const env = require('./env.js')
const windowMgr = require('./window.js')

// Create the Application's main menu
function menuTemplate() {
    let menuItems = [
        {
            label: 'Slippod',
            submenu: [
                {
                    label: 'About Slippod',
                    selector: 'orderFrontStandardAboutPanel:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Settings...',
                    click: function()  {
                        windowMgr.createSettingsWindow().show()
                    },
                },
                {
                    type: 'separator'
                },
                {
                    label: 'License...',
                    click: function()  {
                        windowMgr.createRegisterWindow().show()
                    },
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide',
                    accelerator: 'Command+H',
                    selector: 'hide:'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:'
                },
                {
                    label: 'Show All',
                    selector: 'unhideAllApplications:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function () { app.quit(); }
                },
            ]
        },
        {
            label: 'File',
            submenu: [
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'Command+Z',
                    selector: 'undo:'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+Command+Z',
                    selector: 'redo:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'Command+X',
                    selector: 'cut:'
                },
                {
                    label: 'Copy',
                    accelerator: 'Command+C',
                    selector: 'copy:'
                },
                {
                    label: 'Paste',
                    accelerator: 'Command+V',
                    selector: 'paste:'
                },
                {
                    label: 'Select All',
                    accelerator: 'Command+A',
                    selector: 'selectAll:'
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'Command+R',
                    click: function () { BrowserWindow.getFocusedWindow().reload(); }
                },
                {
                    label: 'Toggle DevTools',
                    accelerator: 'Alt+Command+I',
                    click: function () { BrowserWindow.getFocusedWindow().toggleDevTools(); }
                },
            ]
        },
        {
            label: 'Find',
            submenu: []
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    selector: 'performMiniaturize:'
                },
                {
                    label: 'Close',
                    accelerator: 'Command+W',
                    selector: 'performClose:'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Bring All to Front',
                    selector: 'arrangeInFront:'
                },
            ]
        },
        {
            label: 'Help',
            submenu: []
        },
    ];
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
        menuItems.push(licenseMenu);
    }
    return menuItems
}

module.exports={
    menuTemplate
}