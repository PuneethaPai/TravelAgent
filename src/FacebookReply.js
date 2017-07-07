const
    ClientAccessToken='80008143ef7e426e8ae929fa186012b3',
    apiaiApp = require('apiai')(ClientAccessToken),
    journeyList=require('./journeyListView.js'),
    request = require('request'),
    apiWebHook = require('./ApiWebHook.js');
    config = require('config');

let
    serverURL = process.env.serverURL || config.serverURL,
    listViewDetails = apiWebHook.listViewDetails,
    preffered_train=apiWebHook.preferedTrain,
    searchParameters=apiWebHook.searchParameters,
    showJourneyList = journeyList.showJourneyList,
    getSearchURL = journeyList.getSearchURL;

    config = require('config');

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
                                   "elements": showJourneyList(listViewDetails),
                                   "buttons": [
                                       {
                                           "title": "View More",
                                           "type": "web_url",
                                           "url": getSearchURL(searchParameters)
                                       }
                                   ]
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
                                     "title":preffered_train.duration,
                                     "subtitle":"Start:"+preffered_train.start+"\n"+"End:"+preffered_train.end+"\n"+"Fare:"+preffered_train.fare+"\n",
                                     "image_url":"https://invitationdigital-res-2.cloudinary.com/image/upload/f_auto,fl_strip_profile,w_628,c_crop/w_628,h_384,c_fill/trainline_up_to_43_off_tickets_with_advance_bookings_at_trainline_premium_offer_image.jpg",
                                     "buttons":[
                                       {
                                         "type":"web_url",
                                         "url":serverURL+"summary?q="+preffered_train.index,
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

function senderAction(event) {
    let sender = event.sender.id;
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: 'EAAPfT94PkckBAPqY1ZAFgtMecs7hRQnF4bgh7yu1xeBft4pKx7wVgwldZCangBx6PYPInwwTkL6ZBaL64gLCT7PBrwyqBllS2eYnv2eJBGRgMZAKnh1X8volYUaaCDPZCnLVLAcalF9EV96VLVlG8iGQuqZAQey8dqk0zDLyROMgZDZD'},
        method: 'POST',
        json: {
            recipient: {id: sender},
            "sender_action":"typing_on"
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}
module.exports = {
    sendMessage : sendMessage,
    senderAction:senderAction
};