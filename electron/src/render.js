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
let last_time = 15;

//create titlebar
new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#121212'),
    menu: null,
    icon: "../resources/icons/lol-icon.png"
});

$(document).ready(async function () {
    readConfig();
    $('#hook-btn').prop('disabled',false);
    $('#help-btn').prop('disabled',false);
    $('#config-btn').prop('disabled',false);
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
        $('#message').html('After the client instance is found, feel free to minimize this window. You will be notified when your game is ready.');
    }
}

//call back to "check if in queue" request
readyCheck = (error, response, body) => {
    let info;
    let current_time;
    try {
        info = JSON.parse(body);
    }
    catch (e) {
        console.warn(e);
    }
    console.log(last_time);
    if (info.state === "InProgress") {      //id this is true, the ready check is showing
        current_time = info.timer;
        if (current_time > last_time) {
            last_time = current_time;
            if(accept_timing==='asap'){
                if (current_time === 0) {      //accept game as soon as it's available
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
                }
            }
            else{
                if (current_time === 10) {      //10 seconds into ready check
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
                }
            }
            
        }
        else if (current_time < last_time) {
            //new queue prompt, so send notification to phone via firebase
            // alert('new match');
            last_time = current_time;
            document.getElementById('message').innerHTML = "Match found!";
            $.ajax({
                type: 'POST',
                data: { "id": id, "event": "match found" },
                url: 'https://us-central1-lol-boosted.cloudfunctions.net/sendNotification',
                success: function (data) {
                    let html = document.getElementById('message').innerHTML;
                    html+=' Notification Sent!';
                    document.getElementById('message').innerHTML=html;
                },
                error: function (data) {
                    console.log("error in http request to firebase");
                    let html = document.getElementById('message').innerHTML;
                    html+=' Notification failed to send...';
                    document.getElementById('message').innerHTML=html;
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
        $('#hook-btn').prop('disabled',false);
        console.log("lost connection with LCU");
        $('#stop-btn').attr('disabled',true);
        $('#config-btn').attr('disabled',true);
        clearInterval(interval);
        document.getElementById('message').innerHTML = "Lost connection with client.";
    });
    connector.on('connect', (data) => {
        //on connection to the game client, start polling for queue
        console.log(data);
        LCU = data;
        document.getElementById('message').innerHTML = "Successfully attached to client instance. Will now begin to poll for queue prompt.";
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
        interval = setInterval(function () { request(options, readyCheck); }, interval_time);
    });
    connector.start();
    $('#stop-btn').prop('disabled',false);
    $('#config-btn').prop('disabled',true);
    $('#hook-btn').prop('disabled',true);
    document.getElementById('message').innerHTML = "Looking for game instance...";
});

$('#config-btn').click(function () {        //show configuration options
    let main = BrowserWindow.getFocusedWindow();
    main.setEnabled(false);

    let win = new BrowserWindow({
        width: 460,
        height: 470,
        backgroundColor:'#121212',
        webPreferences: {
            nodeIntegration: true,
        },
        frame: false
    })
    win.setMenu(null);
    win.on('ready-to-show',()=>{
        win.show();
    })
    win.on('closed', () => {
        win = null;     //cannot use main window when config window is open
        main.setEnabled(true);
        main.focus();
        readConfig();   //update global variables when window is closed
    })
    win.loadURL(`file://${__dirname}/config.html`);
    
    // win.webContents.openDevTools();
})

$('#stop-btn').click(function () {
    connector.stop();       //stop polling for queue
    clearInterval(interval);
    document.getElementById('message').innerHTML = "Stopped looking for game instance.";
    $('#hook-btn').prop('disabled',false);
    $('#stop-btn').prop('disabled',true);
    $('#config-btn').prop('disabled',false);
});

$('#help-btn').click(()=>{
    let main = BrowserWindow.getFocusedWindow();
    main.setEnabled(false);

    let win = new BrowserWindow({
        width: 470,
        height: 770,
        backgroundColor:'#121212',
        webPreferences: {
            nodeIntegration: true,
        },
        frame: false
    })
    win.setMenu(null);
    win.on('ready-to-show',()=>{
        win.show();
    })
    win.on('closed', () => {
        win = null;
        main.setEnabled(true);
        main.focus();
    })
    win.loadURL(`file://${__dirname}/setup.html`);

    // win.webContents.openDevTools();
})