'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  express = require('express'),
  request = require('request');

const app = express();
const ClientAccessToken='80008143ef7e426e8ae929fa186012b3'
const ClientValidationToken = config.get('validationToken');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', (req, res) => {
  res.send("The Server Is Hot");
})

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === ClientValidationToken) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});


// function sendMessage(event) {
//   let sender = event.sender.id;
//   let text = event.message.text;

//   request({
//     url: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: {access_token: 'EAAPfT94PkckBAPqY1ZAFgtMecs7hRQnF4bgh7yu1xeBft4pKx7wVgwldZCangBx6PYPInwwTkL6ZBaL64gLCT7PBrwyqBllS2eYnv2eJBGRgMZAKnh1X8volYUaaCDPZCnLVLAcalF9EV96VLVlG8iGQuqZAQey8dqk0zDLyROMgZDZD'},
//     method: 'POST',
//     json: {
//       recipient: {id: sender},
//       message: {text: text}
//     }
//   }, function (error, response) {
//     if (error) {
//         console.log('Error sending message: ', error);
//     } else if (response.body.error) {
//         console.log('Error: ', response.body.error);
//     }
//   });
// }

const apiaiApp = require('apiai')(ClientAccessToken);

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'tabby_cat' // use any arbitrary id
  });

  apiai.on('response', (response) => {
  let aiText = response.result.fulfillment.speech;

    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: 'EAAPfT94PkckBAPqY1ZAFgtMecs7hRQnF4bgh7yu1xeBft4pKx7wVgwldZCangBx6PYPInwwTkL6ZBaL64gLCT7PBrwyqBllS2eYnv2eJBGRgMZAKnh1X8volYUaaCDPZCnLVLAcalF9EV96VLVlG8iGQuqZAQey8dqk0zDLyROMgZDZD'},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: aiText}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
 });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();
}

app.post('/ai', (req, res) => {
  let source = req.body.result.parameters['source'];
  let destination = req.body.result.parameters['destination'];
  let date = req.body.result.parameters['journey-date'];
  console.log(date);
  console.log(source);
  if (req.body.result.action === 'fetch_schedule' && source!="" && destination!="" && date!="") {
    let options = {
    url: 'https://et2-fasttrackapi.ttlnonprod.com/v1/Search?journeyRequest.origin=EUS&journeyRequest.destination=MAN&journeyRequest.outboundDate=2017-06-23&journeyRequest.numberOfAdults=1',
    method: 'GET',
    headers: {
            "Accept": "application/json",
            "TocIdentifier": "vtMobileWeb"
    }};
    request(options, (err, response) => {
      console.log(response.statusCode);
      if (!err && response.statusCode == 200) {
        let json = JSON.parse(response.body);
        let journeys = json.OutboundJournies
        let list_len=journeys.length
        let schedule=""
        for(var i=0; i<list_len; i++){
          var train_data = journeys[i].Legs;
          var fare=journeys[i].Tickets[0].Fare
          let train="start: "+train_data[0].OriginDepartureTime.toString()+"\n"+"reach: "+train_data[0].DestinationArrivalTime.toString()+"\n"+"Duration: "+train_data[0].Duration.toString()+"\n"+"Fare: "+fare.toString()+"\n"
          train+="\n\n"
          schedule+=train
        }
        console.log(schedule);
        return res.json({
          speech:schedule,
          displayText: schedule,
          source: 'fetch_schedule'
        });
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'I failed to look up the Schedule'}});
      }})
  }
  });