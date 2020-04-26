const Base64 = require('js-base64').Base64;
const { BrowserWindow } = require('electron').remote;
const customTitlebar = require('custom-electron-titlebar');
const https = require('https');
const LCUConnector = require('lcu-connector');
const request = require('postman-request');
const jsonEdit = require("edit-json-file");

//global interval variable for starting and stopping polling
var interval;

//global variable for accessing LCU
let connector;

//global variable to store data in config.json
let id;
let interval_time=50;
let accept_timing='wait';

//global variable to store info about current client session
let LCU;

//global variable to store current timer on ready check. initialized to value larger than max timer
let prompt_timer = 15;

//create titlebar
new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#333333'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

$(document).ready(function () {
    $('#stop-btn').addClass('disabled');
    readConfig();
})

//read config file and set global id
readConfig = () => {
    let file = jsonEdit(__dirname+'/../config.json');
    id=file.data.pushed_id;
    interval_time=file.data.interval;
    accept_timing=file.data.timing;
    if(!id){
        $('#message').html('Please set your pushed ID in the config menu');
    }
    else{
        $('#message').html('After the game instance is found, feel free to minimize this window. You will be notified when your game is ready.');
    }
}

//call back to "check if in queue" request
readyCheck = (error, response, body) => {
    let info;
    try {
        info = JSON.parse(body);
    }
    catch (e) {
        console.warn(e);
    }
    console.log(prompt_timer);
    if (info.state === "InProgress") {      //id this is true, the ready check is available
        if (info.timer > prompt_timer) {
            prompt_timer = info.timer;
            if (prompt_timer === 10) {
                //send request to accept the queue
                var agentOptions;
                var agent;
                let pw = Base64.encode("riot:" + LCU.password);
                agentOptions = {
                    rejectUnauthorized: false   //needs to do this since LCU api is http
                };
                agent = new https.Agent(agentOptions);
                const acceptOptions = {
                    url: 'https://127.0.0.1:' + LCU.port + '/lol-matchmaking/v1/ready-check/accept',
                    headers: {
                        'User-Agent': 'postman-request',
                        'Accept': 'application/json',
                        'Authorization': 'Basic ' + pw,
                    },
                    agent: agent,
                };
                request.post(acceptOptions, acceptCallback);        //accept ready check 
                clearInterval(interval);    //stop polling for queue prompt

            }
        }
        else if (info.timer < prompt_timer) {
            //new queue prompt, so send notification to phone via firebase
            prompt_timer = info.timer;
            document.getElementById('message').innerHTML = "Match found! Notification sent.";
            $.ajax({
                type: 'POST',
                data: { "id": id, "event": "match found" },
                url: 'https://us-central1-lol-boosted.cloudfunctions.net/sendNotification',
                success: function (data) {
                },
                error: function (data) {
                    console.log("error in http request to firebase");
                }
            })
        }

    }
}

//callback to "accept ready check" request
acceptCallback = (err, response, body) => {
    if (err) {
        return console.log(err);
    }
    return console.log("accepted ready check");
}

$("#hook-btn").click(function () {
    //instantiate connector object and set event listeners
    connector = new LCUConnector();
    connector.on('disconnect', (data) => {
        $('#hook-btn').removeClass('disabled');
        console.log("lost connection with LCU");
        $('#stop-btn').addClass('disabled');
        $('#config-btn').addClass('disabled');
        document.getElementById('message').innerHTML = "Lost connection with game client.";
    });
    connector.on('connect', (data) => {
        //on connection to the game client, start polling for queue
        console.log(data);
        LCU = data;
        document.getElementById('message').innerHTML = "Successfully attached to game instance. Will now begin to poll for queue prompt.";
        let pw = Base64.encode("riot:" + data.password);
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
            agent: agent,
        }
        console.log(options);
        interval = setInterval(function () { request(options, readyCheck); }, interval_time);      //TODO make interval configurable
    });
    connector.start();
    $('#stop-btn').removeClass('disabled');
    $('#config-btn').addClass('disabled');
    $('#hook-btn').addClass('disabled');
    document.getElementById('message').innerHTML = "Looking for game instance...";
    BrowserWindow.getFocusedWindow().setSize(500, 265);
});

$('#config-btn').click(function () {        //show configuration options
    // BrowserWindow.getFocusedWindow().setSize(500, 340);
    // $('#message').html('<div class="input-field"><input id="pushed-id-field" class="white-text" type="text"><label for="pushed-id-field">Pushed ID</label><a onclick="confirm()" class="waves-effect red waves-light btn">save</a></div>');
    let main = BrowserWindow.getFocusedWindow();
    main.setEnabled(false);
    main.on('focus',()=>{
        readConfig();
    })
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
        frame: false
    })
    win.setMenu(null);
    win.on('closed', () => {
        win = null;
        main.setEnabled(true);
        main.focus();
    })
    win.loadURL(`file://${__dirname}/config.html`);
    
    // win.webContents.openDevTools();
})

$('#stop-btn').click(function () {
    connector.stop();       //stop polling for queue
    clearInterval(interval);
    document.getElementById('message').innerHTML = "Stopped looking for game instance.";
    $('#hook-btn').removeClass('disabled');
    $('#stop-btn').addClass('disabled');
    $('#config-btn').removeClass('disabled');
});

$('#help-btn').click(()=>{
    let main = BrowserWindow.getFocusedWindow();
    main.setEnabled(false);

    let win = new BrowserWindow({
        width: 700,
        height: 825,
        webPreferences: {
            nodeIntegration: true,
        },
        frame: false
    })
    win.setMenu(null);
    win.on('closed', () => {
        win = null;
        main.setEnabled(true);
        main.focus();
    })
    win.loadURL(`file://${__dirname}/setup.html`);

    // win.webContents.openDevTools();
})