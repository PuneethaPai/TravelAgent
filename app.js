'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  assets=require('./assets/stations.json'),
  express = require('express'),
  data=require('./data.js'),
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
app.get('/summary', function(req, res){
    let options = {
        uri : "https://m.buytickets.virgintrains.co.uk/buy/purchase_ticket_request",
        method : 'POST',
        formData : data.getPostData(fastrack_t
    }
    request(options, function(error, response, body){
        console.log(body);
        res.body = body;
        res.redirect('https://m.buytickets.virgintrains.co.uk/journeySummaryPage');
    })
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
//        message:{
//        attachment:{
//                       "type":"template",
//                       "payload":{
//                         "template_type":"generic",
//                         "elements":[
//                           {
//                             "title":"Do You Want to Book The Ticket",
//                             "subtitle":"The local area is due for record thunderstorms over the weekend.",
//                             "image_url":"https://www.thetrainline.com/m/public/00f6856c8fb412b329525bc1bcc2f98a.jpg",
//                             "buttons":[
//                               {
//                                 "type":"web_url",
//                                 "url":"https://53de080b.ngrok.io/summary",
//                                 "title":"Show Website"
//                               }
//                             ]
//                           }
//                         ]
//                       }
//                     }
//        }
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
var stations=require("./assets/stations.json")
var recent_schedule=[]
var global_source="London"
var global_destination="Manchester"
var global_date = "28-07-2017"
var global_seats=1
var fastrack_ticket_data ={}
app.post('/ai', (req, res) => {
  let source = req.body.result.parameters['source'];
  let destination = req.body.result.parameters['destination'];
  let date = req.body.result.parameters['journey-date'];
  let seat=parseInt(req.body.result.parameters['seats'], 10);
  if (req.body.result.action === 'fetch_schedule' && source!="" && destination!="" && date!="") {
    console.log(source)
    let source_code=stations[source.toUpperCase()];

    fastrack_ticket_data.origin_crs=source_code

    let destination_code=stations[destination.toUpperCase()]

    fastrack_ticket_data.destination_crs=destination_code

    console.log(destination_code)
    if(typeof destination_code == 'undefined'){
    console.log("destination_code")
    return res.json({
                     speech:"The Source is Incorrect",
                     displayText: "The Destination is Incorrect",
                     source: 'fetch_schedule'
                          });
    }
    if(!source_code){
    return res.json({
                    speech:"The Source is Incorrect",
                    displayText: "The Source is Incorrect",
                    source: 'fetch_schedule'
                          });
    }
    global_source=source;
    global_destination=destination;
    global_date=date;
    global_seats=seat;
    let options = {
    url: 'https://et2-fasttrackapi.ttlnonprod.com/v1/Search',
    method: 'GET',
    qs:{
        'journeyRequest' : {
            'origin': source_code,
            'destination': destination_code,
            'outboundDate': date,
            'numberOfAdults' : seat
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
        let journeys = json.OutboundJournies;
        let list_len=journeys.length;
        let schedule="Please select the train you would like to book"+"\n\n";
        let save_schedule=[];

        fastrack_ticket_data.arrival_date_time=journeys[0].ArrivalDateTime
        fastrack_ticket_data.departure_date_time=journeys[0].DepartureDateTime
        fastrack_ticket_data.total_fare=journeys[0].Tickets[0].Fare
        fastrack_ticket_data.ticket_type=journeys[0].Tickets[0].TicketType
        fastrack_ticket_data.route_code=journeys[0].Tickets[0].RouteCode
        console.log(fastrack_ticket_data)
        for(var i=0; i<list_len; i++){
          var count=i+1;
          var train_data = journeys[i].Legs;
          var fare=journeys[i].Tickets[0].Fare;
          let train = "#"+count+" start: "+train_data[0].OriginDepartureTime.toString()+"\n"+"    reach: "+train_data[0].DestinationArrivalTime.toString()+"\n"+"    Duration: "+train_data[0].Duration.toString()+"\n"+"    Fare: £"+fare.toString()+"\n";
          train+="\n";
          schedule+=train;
          let save_train={
            start:train_data[0].OriginDepartureTime.toString(),
            reach:train_data[0].DestinationArrivalTime.toString(),
            Duration:train_data[0].Duration.toString(),
            Fare:fare.toString()
          }
          save_schedule.push(save_train);
        }
        console.log(schedule);
        recent_schedule=save_schedule;
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


  ///Tarkakke Nilukaddu

  let ordinal=parseInt(req.body.result.parameters['ordinal'], 10)-1;
  if(req.body.result.action === 'book_ticket' && recent_schedule.length>0){
  if((ordinal+1)>recent_schedule.length){
  return res.json({
                        speech:"The Option Can not be Choosed",
                        displayText: "The Option Can not be Choosed",
                        source: 'book_ticket'
                      });
  }
 else{
   console.log(recent_schedule);
   console.log(ordinal);
   let selected_start=recent_schedule[ordinal]['start'];
   let selected_end=recent_schedule[ordinal].reach;
   let selected_duration=recent_schedule[ordinal].Duration;
   let selected_fare=parseInt(recent_schedule[ordinal].Fare, 10)*global_seats;
   let summary="Journey Summary "+"\n"+"Train Starts From "+global_source+" at "+selected_start+"\n"+"Reaches "+global_destination+" by "+selected_end+"\n"+"Journey Date "+global_date+"\n"+"Total Cost £"+selected_fare+"\n"+"Should I go Ahead With this and Confirm Your Ticket?\n";
   console.log(summary);
   return res.json({
                       speech:summary,
                       displayText: summary,
                       source: 'book_ticket'
                     });
   }
  }
  let preference=req.body.result.parameters['Preferences']
  if(req.body.result.action === 'apply_preferences' && preference!="" && recent_schedule.length>0){
  console.log("Ima here")
  var itin_length=recent_schedule.length
  if(preference=="earliest"){
  console.log("Ima here in Earliest")
     let random_ordinal=0
     let index=random_ordinal
     let selected_start=recent_schedule[index]['start'];
     let selected_end=recent_schedule[index].reach;
     let selected_duration=recent_schedule[index].Duration;
     let selected_fare=parseInt(recent_schedule[index].Fare, 10)*global_seats;
     let summary="Your Summary "+"\n"+"Train Starts From "+global_source+" at "+selected_start+"\n"+"Reaches "+global_destination+" by "+selected_end+"\n"+"Journey Date "+global_date+"\n"+"Total Cost £"+selected_fare+"\n"+"Should I go Ahead With this and Confirm Your Ticket?\n";
     console.log(summary);
     return res.json({
         speech:summary,
         displayText: summary,
         source: 'book_ticket'
     });
  }else if(preference=="cheapest"){
    console.log("Ima here in Cheapest")
    let min_cost=1000
    let cheapest=0
    for(var i=0; i<itin_length; i++){
        let train=recent_schedule[i]
        let cost=parseInt(train.Fare, 10)
        if(min_cost>cost){
                        min_cost=cost
                        cheapest=i
                  }
    }
    let index=cheapest
    console.log(cheapest);
    let selected_start=recent_schedule[index]['start'];
    let selected_end=recent_schedule[index].reach;
    let selected_duration=recent_schedule[index].Duration;
    let selected_fare=parseInt(recent_schedule[index].Fare, 10)*global_seats;
    let summary="Your "+"\n"+"Train Starts From "+global_source+" at "+selected_start+"\n"+"Reaches "+global_destination+" by "+selected_end+"\n"+"Journey Date "+global_date+"\n"+"Total Cost £"+selected_fare+"\n"+"Should I go Ahead With this and Confirm Your Ticket?\n";
    console.log(summary);
    return res.json({
       speech:summary,
       displayText: summary,
       source: 'book_ticket'
     });


  }else if(preference=="fastest"){
      console.log("I am here in Fastest")
      let min_dur=1000
      let earliest=0
      for(var i=0; i<itin_length; i++){
          let train=recent_schedule[i]
          var hr=recent_schedule[i].Duration.split(' ')[0].match(/\d/g)
          hr=hr.join("");
          var min=recent_schedule[i].Duration.split(' ')[1].match(/\d/g)
          min=min.join("");
          console.log(hr)
          console.log(min)
          var dur=parseInt(hr, 10)*60+parseInt(min, 10)
          if(min_dur>dur){
                min_dur=dur
                earliest=i
          }
      }
       let index=earliest
       let selected_start=recent_schedule[index]['start'];
       let selected_end=recent_schedule[index].reach;
       let selected_duration=recent_schedule[index].Duration;
       let selected_fare=parseInt(recent_schedule[index].Fare, 10)*global_seats;
       let summary="Your "+"\n"+"Train Starts From "+global_source+" at "+selected_start+"\n"+"Reaches "+global_destination+" by "+selected_end+"\n"+"Journey Date "+global_date+"\n"+"Total Cost £"+selected_fare+"\n"+"Should I go Ahead With this and Confirm Your Ticket?\n";
       console.log(summary);
       return res.json({
                             speech:summary,
                             displayText: summary,
                             source: 'book_ticket'
                           });
  }
  }
  });