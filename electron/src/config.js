const { BrowserWindow } = require('electron').remote;
const customTitlebar = require('custom-electron-titlebar');
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const jsonEdit = require("edit-json-file");


new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#333333'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

let id;
let interval_time;
let accept_timing;

$(document).ready(function(){
    readConfig();
});

readConfig = () => {
    let file = jsonEdit(__dirname+'/../config.json');
    id=file.data.pushed_id;
    interval_time=file.data.interval;
    accept_timing=file.data.timing;

    $('#pushed-id-field').val(id);
    $('#pushed-id-field-label').addClass('active');
    $('#interval-field').val(interval_time);
    $('#interval-field-label').addClass('active');
    if(accept_timing==='asap'){
        $('#default-option').html('Queue Accept timing (Set to accept ASAP)');
        $('#default-option').attr('value','asap');
        M.AutoInit();
    }
}

cancel = () =>{
    let current = BrowserWindow.getFocusedWindow();
    current.close();
}

save = () => {       //save id to file
    id=$('#pushed-id-field').val();
    interval_time=$('#interval-field').val();
    accept_timing = $('#queue-accept-timing')[0].value;

    let file = jsonEdit(__dirname+'/../config.json')
    if(id){
        file.set("pushed_id",id);
    }
    if(interval_time){
        file.set("interval",interval_time);
    }
    if(accept_timing){
        file.set("timing",accept_timing)
    }
    file.save();
    
    let current = BrowserWindow.getFocusedWindow();
    current.close();
    // console.log(config);
    // BrowserWindow.getFocusedWindow().setSize(500, 265);
}

function adjust_textarea(h) {
    h.style.height = "20px";
    h.style.height = (h.scrollHeight)+"px";
}

// $($)