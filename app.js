'use strict';

const
  bodyParser = require('body-parser'),
  config = require('config'),
  express = require('express'),
  request = require('request'),
  data=require('./src/data.js'),
  journeyList=require('./src/journeyListView.js'),
  apiWebHook = require('./src/ApiWebHook.js');

const
    fastrackSummaryDetails = apiWebHook.fastrackSummaryDetails,
    listViewDetails = apiWebHook.listViewDetails,
    a = apiWebHook.a,
    apiWebHookHandler = apiWebHook.apiWebHookHandler;

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
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === ClientValidationToken) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});
app.get('/summary', function(req, res){
    let index=parseInt(req.query.q, 10);
    console.log(index);

    let html_data= "<form id='redir' action='https://et2-m-virgintrains.ttlnonprod.com/buy/purchase_ticket_request' method='POST'>"+
        "<textarea rows='15' cols='50' name='journey' style='display: none'>"+data.getPostData(fastrackSummaryDetails.summaryList[index]).toString()+
    "</textarea>"+
        "</form>"+
        "<script>document.getElementById('redir').submit()</script>";
    console.log(html_data);
    res.send(html_data);
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

app.post('/ai', apiWebHookHandler);

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
  let response_json={};
  let custonResponse={};
  if (aiText==="Schedule"){
      console.log("Fix Schedule List");
      console.log(listViewDetails.journeyList.length);
        custonResponse={attachment: {
                               "type": "template",
                               "payload": {
                                   "template_type": "list",
                                   "top_element_style": "compact",
                                   "elements": journeyList.showJourneyList(listViewDetails.journeyList)
                               }
                           }
                           }
  }
  else if(aiText==="Confirm"){
        custonResponse={
        attachment:{
                               "type":"template",
                               "payload":{
                                 "template_type":"generic",
                                 "elements":[
                                   {
                                     "title":"Do You Want to Book The Ticket",
                                     "subtitle":"The local area is due for record thunderstorms over the weekend.",
                                     "image_url":"https://www.thetrainline.com/m/public/00f6856c8fb412b329525bc1bcc2f98a.jpg",
                                     "buttons":[
                                       {
                                         "type":"web_url",
                                         "url":"https://53de080b.ngrok.io/summary",
                                         "title":"Book"
                                       }
                                     ]
                                   }
                                 ]
                               }
                             }
                }

        }
  else{
    custonResponse= {text:aiText }
  }
      request({
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token: 'EAAPfT94PkckBAPqY1ZAFgtMecs7hRQnF4bgh7yu1xeBft4pKx7wVgwldZCangBx6PYPInwwTkL6ZBaL64gLCT7PBrwyqBllS2eYnv2eJBGRgMZAKnh1X8volYUaaCDPZCnLVLAcalF9EV96VLVlG8iGQuqZAQey8dqk0zDLyROMgZDZD'},
          method: 'POST',
          json: {
              whitelisted_domains:["https://peterssendreceiveapp.ngrok.io"],
              recipient: {id: sender},
              message: custonResponse
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