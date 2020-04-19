const LCUConnector = require('lcu-connector');
const https = require('https');
const connector = new LCUConnector();
const Base64 = require('js-base64').Base64;
const request = require('postman-request');
const { BrowserWindow } = require('electron').remote;
const path = require('path');
const fs = require('fs');

var interval;

const customTitlebar = require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#212121'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

$(document).ready(function () {
    $('#stop-btn').addClass('disabled');
    $('#suspend-btn').addClass('disabled');
    updateID();
})

updateID = () =>{
    fs.readFile(__dirname+'/../config.json',(err,data) =>{
        if(err){
            id=0;
            // let html = $('#message').html()+'Please set your pushed ID in the config menu';
            $('#message').html('Please set your pushed ID in the config menu');
        }
        else{
            id=JSON.parse(data).pushed_id;
        }
        console.log(id);
    })
}

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

connector.on('connect', (data) => {
    console.log(data);
    document.getElementById('message').innerHTML = "Successfully attached to game instance. Will now begin to poll for queue prompt.";
    $('#hook-btn').addClass('disabled');
    let pw = Base64.encode("riot:" + data.password);
    console.log(pw);
    var agentOptions;
    var agent;

    agentOptions = {
        rejectUnauthorized: false
    };

    agent = new https.Agent(agentOptions);
    const options = {
        url: 'https://127.0.0.1:' + data.port + '/lol-matchmaking/v1/ready-check',
        headers: {
            'User-Agent': 'postman-request',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + pw,
        },
        agent:agent,
    }
    $('#suspend-btn').removeClass('disabled');
    console.log(options);
    interval = setInterval(function () { request(options, callback); }, 3000);
    // request(options, callback);
});

connector.on('disconnect', (data) => {
    // connector.stop();
    $('#hook-btn').removeClass('disabled');
    console.log("lost connection with LCU");
    $('#stop-btn').addClass('disabled');
    $('#suspend-btn').addClass('disabled');
    $('#config-btn').addClass('disabled');
    document.getElementById('message').innerHTML = "Lost connection with game client.";
})

function callback(error, response, body) {
    console.log(error);
    console.log(response);
    console.log(body);
    const info = JSON.parse(body);
    console.log(info);
    if (info.state === "InProgress") {
        document.getElementById('message').innerHTML = "found a match";
        let fd = new FormData();
        fd.append("id",id);
        fd.append("event","match found");
        $.ajax({
            type:'POST',
            data:fd,
            url:'/',
            success:function(data){
                console.log("success");
            },
            error:function(data){
                console.log("error in http request to firebase");
            }
        })
    }
}

$("#hook-btn").click(function () {
    connector.start();
    $('#hook-btn').addClass('disabled');
    $('#stop-btn').removeClass('disabled');
    $('#config-btn').addClass('disabled');
    document.getElementById('message').innerHTML = "Looking for game instance...";
    BrowserWindow.getFocusedWindow().setSize(500,265);
    // connector.stop();
    
});

$('#config-btn').click(function (){
    BrowserWindow.getFocusedWindow().setSize(500,340);
    $('#message').html('<div class="input-field"><input id="pushed-id-field" type="text"><label for="pushed-id-field">Pushed ID</label><a onclick="confirm()" class="waves-effect red waves-light btn">save</a></div>');
})

confirm = () =>{
    
    let id = $('#pushed-id-field').val();
    let config={'pushed_id':id};

    // $('#pushed-id-field').val();
    // console.log(fs);
    // console.log()
    // fs.readFile(__dirname + '/../foo.bar');
    fs.writeFile(__dirname + '/../config.json',JSON.stringify(config),()=>{
        $('#message').html('Configuration saved');
        updateID();
    })
    console.log(config);
    BrowserWindow.getFocusedWindow().setSize(500,265);
}

$('#stop-btn').click(function () {
    // connector.stop();
    clearInterval(interval);
    document.getElementById('message').innerHTML = "Stopped looking for game instance. (requests)";
    $('#hook-btn').removeClass('disabled');
    $('#stop-btn').addClass('disabled');
    $('#config-btn').removeClass('disabled');
});

// $('#exit-btn').click(function(){
//     let window = remote.getCurrentWindow();
//     window.close();
// })

// console.log(connector);

// var windowTopBar = document.createElement('div')
// windowTopBar.style.width = "100%"
// windowTopBar.style.height = "32px"
// windowTopBar.style.backgroundColor = "#2b61d6"
// windowTopBar.style.position = "relative"
// windowTopBar.style.top = windowTopBar.style.left = 0
// windowTopBar.style.webkitAppRegion = "drag"
// document.body.prepend(windowTopBar);