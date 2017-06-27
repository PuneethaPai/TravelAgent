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

const apiaiApp = require('apiai')(ClientAccessToken);
function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;
  console.log("Sender: " + sender + "; Mesage: " + text);
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
var recent_schedule=[]
var global_source="London"
var global_destination="Manchester"
var global_date = "28-07-2017"
var global_seats=1

app.post('/ai', (req, res) => {
  let source = req.body.result.parameters['source'];
  global_source=source
  let destination = req.body.result.parameters['destination'];
  global_destination=destination
  let date = req.body.result.parameters['journey-date'];
  global_date=date
  let seat=parseInt(req.body.result.parameters['seats'], 10);
  global_seats=seat
  if (req.body.result.action === 'fetch_schedule' && source!="" && destination!="" && date!="") {
    let options = {
    url: 'https://et2-fasttrackapi.ttlnonprod.com/v1/Search',
    method: 'GET',
    qs:{
        'journeyRequest' : {
            'origin': '182',
            'destination': 'MAN',
            'outboundDate': date,
            'numberOfAdults' : 1
        }
    },
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
        let schedule="Please select the train you would like to book"+"\n\n"
        for(var i=0; i<list_len; i++){
          var count=i+1
          var train_data = journeys[i].Legs;
          var fare=journeys[i].Tickets[0].Fare
          let train = "#"+count+" start: "+train_data[0].OriginDepartureTime.toString()+"\n"+"   reach: "+train_data[0].DestinationArrivalTime.toString()+"\n"+"   Duration: "+train_data[0].Duration.toString()+"\n"+"   Fare: "+fare.toString()+"\n"
          train+="\n"
          schedule+=train
//          let train={
//            start:train_data[0].OriginDepartureTime.toString(),
//            reach:train_data[0].DestinationArrivalTime.toString(),
//            Duration:train_data[0].Duration.toString(),
//            Fare:fare.toString()
//          }
//          schedule.push(train)
        }
        console.log(schedule);
        recent_schedule=schedule
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
  if(req.body.result.action === 'book_ticket' && recent_schedule.length>0){
  let ordinal=parseInt(req.body.result.parameters['ordinal'], 10)-1
  let selected_start=recent_schedule[ordinal].start
  let selected_end=recent_schedule[ordinal].reach
  let selected_duration=recent_schedule[ordinal].Duration
  let selected_fare=parseInt(recent_schedule[ordinal].Fare, 10)*global_seats
  let summary="Journey Summary "+"\n"+"Train Starts From "+global_source+" at "+selected_start+"\n"+"Reaches "+global_destination+" by "+selected_end+"\n"+"Cost Of Each Ticket "+selected_fare+"\n"
  console.log(summary);
  return res.json({
                      speech:summary,
                      displayText: summary,
                      source: 'book_ticket'
                    });
  }else if(recent_schedule.length=0) {
          return res.json({
                    speech:"Sorry Incorrect Operation",
                    displayText: "Sorry Incorrect Operation",
                    source: 'book_ticket'
                  });
         }
  });