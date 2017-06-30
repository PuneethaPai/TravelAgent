'use strict'
const
    request = require('request'),
    express = require('express'),
    apiai = require('apiai');

let
    app = express(),
    apiApp = apiai('80008143ef7e426e8ae929fa186012b3');

let
    options = {
        uri : 'https://api.api.ai/v1/query',
        method : 'GET',
        headers : {
            "Authorization":"Bearer 80008143ef7e426e8ae929fa186012b3"
        },
        qs :{
            "lang":"en",
            "sessionId":"1234567890",
            "query":"I want to travel to manchester tonight"
//            "query":"yes"
        }
    }


request(options, function(error, response, body){
    console.log(body);
});