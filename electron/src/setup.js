const customTitlebar = require('custom-electron-titlebar');
const { BrowserWindow } = require('electron').remote;
const shell = require('electron').shell;

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#333333'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

$('#close-btn').click(()=>{
    let current = BrowserWindow.getFocusedWindow();
    current.close();
})

$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
  });