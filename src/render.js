const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();
const Base64 = require('js-base64').Base64;
const request = require('postman-request');

$(document).ready(function(){
    $('#stop-btn').addClass('disabled');
    $('#suspend-btn').addClass('disabled');
})

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

connector.on('connect', (data) => {
    console.log(data);
    document.getElementById('message').innerHTML="Successfully attached to game instance. Will now begin to poll for queue prompt.";
    $('#hook-btn').addClass('disabled');
    let pw = Base64.encode("riot:"+data.password);
    console.log(pw);
    const options={
        url:'https://127.0.0.1:'+data.port+'/lol-matchmaking/v1/ready-check',
        headers: {
            'User-Agent': 'postman-request',
            'Accept':'application/json',
            'Authorization':'Basic '+pw,
        },
    }
    $('#suspend-btn').removeClass('disabled');
    console.log(options);
    setInterval(function(){ request(options, callback); }, 3000);
    // request(options, callback);
});

connector.on('disconnect',(data)=>{
    connector.stop();
    $('#hook-btn').removeClass('disabled');
    console.log("lost connection with LCU");
    $('#stop-btn').addClass('disabled');
    $('#suspend-btn').addClass('disabled');
    document.getElementById('message').innerHTML="Lost connection with game client.";
})

function callback(error, response, body){
    console.log(error);
    console.log(response);
    console.log(body);
    const info = JSON.parse(body);
    console.log(info);
    if(info.state==="InProgress"){
        document.getElementById('message').innerHTML="found a match";
    }
}

$("#hook-btn").click(function(){
    document.getElementById('message').innerHTML="Looking for game instance...";
    connector.start();
    $('#hook-btn').addClass('disabled');
    $('#stop-btn').removeClass('disabled');
});

$('#stop-btn').click(function(){
    connector.stop();
    document.getElementById('message').innerHTML="Stopped looking for game instance.";
    $('#hook-btn').removeClass('disabled');
    $('#stop-btn').addClass('disabled');
});

// console.log(connector);

// var windowTopBar = document.createElement('div')
// windowTopBar.style.width = "100%"
// windowTopBar.style.height = "32px"
// windowTopBar.style.backgroundColor = "#2b61d6"
// windowTopBar.style.position = "relative"
// windowTopBar.style.top = windowTopBar.style.left = 0
// windowTopBar.style.webkitAppRegion = "drag"
// document.body.prepend(windowTopBar);