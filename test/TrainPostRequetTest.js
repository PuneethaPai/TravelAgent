data = require('../data.js')
const
    request = require('request'),
    express = require('express');

app = express()

app.listen(3000, function(){
    console.log('Listening To Port 3000');
});

app.get('/', function(req, res){
    let options = {
        uri : "https://m.buytickets.virgintrains.co.uk/buy/purchase_ticket_request",
        method : 'POST',
        formData : data.a
    }
    request(options, function(error, response, body){
        res.body = body;
        res.redirect('https://m.buytickets.virgintrains.co.uk/journeySummaryPage');
    })
});