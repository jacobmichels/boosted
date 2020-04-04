const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();
const Base64 = require('js-base64').Base64;
const request = require('postman-request');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

connector.on('connect', (data) => {
    console.log(data);
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
    console.log(options);
    setInterval(function(){ request(options, callback); }, 3000);
    // request(options, callback);
});

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
    connector.start();
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