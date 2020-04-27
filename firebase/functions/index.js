const functions = require('firebase-functions');
const https = require('postman-request');
// require('dotenv').config()

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendNotification = functions.https.onRequest((request, response) => {
    // console.log("requests:");
    // console.log(request.body);
    // console.log(request.query);
    // response.send("good");

    let formdata;

    if(request.body.event==='test'){
        formdata = {
            "app_key": process.env.app_key,
            "app_secret": process.env.app_secret,
            "target_type": "pushed_id",
            "content": "This is a test notification from boosted. If you got this, everything should be working!",
            "pushed_id":request.body.id,
        }
    }
    else{
        formdata = {
            "app_key": process.env.app_key,
            "app_secret": process.env.app_secret,
            "target_type": "pushed_id",
            "content": "Your league game is ready!",
            "pushed_id":request.body.id,
        }
    }

    https.post({
        url: 'https://api.pushed.co/1/push',
        formData:formdata
    },(err,httpsRes,body)=>{
        if(err){
            console.error("error:");
            console.error(err);
            return;
        }
        else{
            console.log("notification sent");
            return;
        }
    })

    return response.send(request.body);
});
