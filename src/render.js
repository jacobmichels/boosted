const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();
const Base64 = require('js-base64').Base64;
const request = require('postman-request');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

connector.on('connect', (data) => {
    console.log(data);
    let pw = Base64.encode("riot:"+data.password);
    console.log(pw);
    // console.log(data.password)
    //  {
    //    address: '127.0.0.1'
    //    port: 18633,
    //    username: 'riot',
    //    password: H9y4kOYVkmjWu_5mVIg1qQ,
    //    protocol: 'https'
    //  }
    
    // console.log(Base64.encode("riot:"+data.password));
    // const options = {
    //     url: 'https://127.0.0.1:'+data.port+'/lol-lobby/v2/lobby/matchmaking/search-state',
    //     headers: {
    //         "Accept": "application/json",
    //         'Authorization':'Basic '+ pw,
    //         'Host': '127.0.0.1:58760',
    //         'User-Agent': 'PostmanRuntime/7.24.0'
    //     }
    // };
    const options={
        url:'https://127.0.0.1:58760/lol-lobby/v2/lobby/matchmaking/search-state',
        headers: {
            'User-Agent': 'postman-request',
            'Accept':'application/json',
            'Authorization':'Basic cmlvdDp6QzQta0pWNjRnR2RoYnRDbTgwNGRB'
        },
    }
    console.log(options);
    request(options, callback);
    
    // while(true){
        
    // }

});

function callback(error, response, body){
    console.log("in callback");
    console.log(response);
    console.log(error);
    console.log(body);

    // const info = JSON.parse(body);
    // console.log(info);


    // console.log("got response");
    // console.log(body);
    // if (!error && response.statusCode == 200) {
    //     const info = JSON.parse(body);
    //     console.log(info);
    // }
}

connector.start();
// console.log(connector);