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
        url:'https://127.0.0.1:'+data.port+'/lol-lobby/v2/lobby/matchmaking/search-state',
        headers: {
            'User-Agent': 'postman-request',
            'Accept':'application/json',
            'Authorization':'Basic '+pw,
        },
    }
    console.log(options);
    request(options, callback);
});

function callback(error, response, body){
    if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        console.log(info);
    }
}

connector.start();
// console.log(connector);