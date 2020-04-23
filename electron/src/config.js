const customTitlebar = require('custom-electron-titlebar');
const ipc = require('electron').ipcRenderer;

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#333333'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

confirm = () => {
    alert("noooo");
}

function adjust_textarea(h) {
    h.style.height = "20px";
    h.style.height = (h.scrollHeight)+"px";
}

// $($)