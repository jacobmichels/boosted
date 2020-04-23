const { BrowserWindow } = require('electron').remote;
const customTitlebar = require('custom-electron-titlebar');
const ipc = require('electron').ipcRenderer;

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#333333'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

$(document).ready(function(){
    $('select').formSelect();
  });

cancel = () =>{
    let current = BrowserWindow.getFocusedWindow();
    current.close();
}

save = () => {       //save id to file
    let pushed_id = $('#pushed-id-field').val();
    let polling = $('#interval-field').val();
    let acceptTiming = $('#queue-accept-timing')[0].value;

    console.log(acceptTiming);

    let config = { 'pushed_id': pushed_id };
    // fs.writeFile(__dirname + '/../config.json', JSON.stringify(config), () => {
        // $('#message').html('Configuration saved');
        // readConfig();
    // })
    // console.log(config);
    // BrowserWindow.getFocusedWindow().setSize(500, 265);
}

function adjust_textarea(h) {
    h.style.height = "20px";
    h.style.height = (h.scrollHeight)+"px";
}

// $($)