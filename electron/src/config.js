const { BrowserWindow } = require('electron').remote;
const customTitlebar = require('custom-electron-titlebar');
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const jsonEdit = require("edit-json-file");


new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#121212'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

let id;
let interval_time;
let accept_timing;

$(document).ready(function(){
    readConfig();
});

setAccept = (event) => {
    // console.log($(event).html());
    let text = $(event).html();
    if(text==='Wait for last second'){
        accept_timing='wait';
        $('#wait-item').addClass('active');
        $('#asap-item').removeClass('active');
    }
    else if(text==='Accept immediately'){
        accept_timing='asap';
        $('#wait-item').removeClass('active');
        $('#asap-item').addClass('active');
    }
}

readConfig = () => {
    let file = jsonEdit(__dirname+'/../config.json');
    id=file.data.pushed_id;
    interval_time=file.data.interval;
    accept_timing=file.data.timing;

    if(id){
        $('#pushed-id-field').val(id);
    }
    if(interval_time){
        $('#interval-field').val(interval_time);
    }
    if(accept_timing==='asap'){
        $('#asap-item').addClass('active');
    }
    else if(accept_timing==='wait'){
        $('$wait-item').addClass('active');
    }
}

cancel = () =>{
    let current = BrowserWindow.getFocusedWindow();
    current.close();
}

save = () => {       //save id to file
    id=$('#pushed-id-field').val();
    interval_time=$('#interval-field').val();
    if(!accept_timing){
        accept_timing='wait';
    }

    let file = jsonEdit(__dirname+'/../config.json')
    
    file.set("pushed_id",id);
    file.set("interval",interval_time);
    file.set("timing",accept_timing)
    
    file.save();
    
    let current = BrowserWindow.getFocusedWindow();
    current.close();
    // console.log(config);
    // BrowserWindow.getFocusedWindow().setSize(500, 265);
}

test = () =>{
    let tempID = $('#pushed-id-field').val();
    $.ajax({
        type: 'POST',
        data: { "id": tempID, "event": "test" },
        url: 'https://us-central1-lol-boosted.cloudfunctions.net/sendNotification',
        success: function (data) {
            $('#message').html('Test notification sent');
        },
        error: function (data) {
            $('#message').html("error in http request to firebase");
        }
    })
}