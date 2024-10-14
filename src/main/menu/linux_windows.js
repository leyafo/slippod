const common = require("./common.js")

function template() {
    let menuItems = [
        {
            label: 'Slippod',
            submenu: [
                {
                    label: 'About Slippod',
                    role: 'about'
                },
                {
                    label: 'Settings...',
                    click: common.showSettingItem, 
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide',
                    click: common.minimizeItem,
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Ctrl+Q',
                    click: common.appQuitItem,
                },
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: "New Card",
                    accelerator: 'Ctrl+O',
                    click: common.openNewCardItem,
                },
                {
                    label: "Search",
                    accelerator: 'Ctrl+K',
                    click: common.startSearchItem,
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'Ctrl+Z',
                    selector: 'undo:',
                    role: "undo",
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+Ctrl+Z',
                    selector: 'redo:',
                    role: "redo",
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'Ctrl+X',
                    selector: 'cut:',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'Ctrl+C',
                    selector: 'copy:',
                    role: 'copy',
                },
                {
                    label: 'Paste',
                    accelerator: 'Ctrl+V',
                    selector: 'paste:',
                    role:"paste",
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    click: common.reloadItem,
                },
                {
                    label: 'Toggle DevTools',
                    click: common.toggleDevToolsItem,
                },
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Support',
                    click: common.supportItem,
                }
            ]
        },
    ];
    return menuItems
}

module.exports={
    template
}
