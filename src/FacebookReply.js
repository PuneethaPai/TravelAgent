const
    ClientAccessToken = '80008143ef7e426e8ae929fa186012b3',
    apiaiApp = require('apiai')(ClientAccessToken),
    journeyList = require('./journeyListView.js'),
    request = require('request'),
    config = require('config'),
    userPreference=require('./UserPrefernce.js'),
    apiWebHook = require('./ApiWebHook.js'),
    view = require('./View.js'),
    purposeSlideView = view.purposeSlideView,
    timePreferenceView = view.timePreferenceView,
    travelPreferenceView=view.travelPreferenceView;

let
    serverURL = process.env.serverURL || config.serverURL,
    listViewDetails = apiWebHook.listViewDetails,
    preffered_train = userPreference.preferedTrain,
    searchParameters = apiWebHook.searchParameters,
    showJourneyList = journeyList.showJourneyList,
    getSearchURL = journeyList.getSearchURL;

function getFacebookFormattedReply(response) {
    let aiText = response.result.fulfillment.speech;
    let action = response.result.action;
    console.log(response.result.parameters);
    if(action.indexOf("greetings.") > -1) {
        return {
            "text":aiText,
            "quick_replies":[
                {
                    "content_type": "text",
                    "title": "How may I help You?",
                    "payload": "How can i help You?",
                },
                {
                    "content_type": "text",
                    "title": "Book me a ticket",
                    "payload": "Book me a ticket ",
                }]
        }
    }
    if(action.indexOf("purpose") > -1) {
        return purposeSlideView;
    }
    if (aiText === 'Ask Time') {
        return timePreferenceView;
    }
    if (aiText === "Schedule") {
        return {
            attachment: {
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
        };
    }
    if (aiText === "Confirm") {
        return {
            attachment: {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": preffered_train.duration,
                            "subtitle": "Start:" + preffered_train.start + "\n" + "End:" + preffered_train.end + "\n" + "Total Fare: £" + preffered_train.fare + "\n",
                            "image_url": "https://invitationdigital-res-2.cloudinary.com/image/upload/f_auto,fl_strip_profile,w_628,c_crop/w_628,h_384,c_fill/trainline_up_to_43_off_tickets_with_advance_bookings_at_trainline_premium_offer_image.jpg",
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": serverURL + "summary?q=" + preffered_train.index,
                                    "title": "Book"
                                }
                            ]
                        }
                    ]
                }
            }
        };

    }
    return {
        text: aiText
    }
}

function sendMessage(sender, text) {
    console.log("Sender: " + sender + "; Mesage: " + text);
    let apiai = apiaiApp.textRequest(text, {
        sessionId: sender // use any arbitrary id
    });

    function preferenceQuickReply() {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: 'EAAPfT94PkckBAPqY1ZAFgtMecs7hRQnF4bgh7yu1xeBft4pKx7wVgwldZCangBx6PYPInwwTkL6ZBaL64gLCT7PBrwyqBllS2eYnv2eJBGRgMZAKnh1X8volYUaaCDPZCnLVLAcalF9EV96VLVlG8iGQuqZAQey8dqk0zDLyROMgZDZD'},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message:travelPreferenceView
            }
        }, (error, resp) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (resp.body.error) {
                console.log('Error: ', resp.body.error);
            }
            else{
                console.log("Success");
            }
        });
    }

    apiai.on('response', (response) => {
        let customResponse = getFacebookFormattedReply(response);
        let options = {
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: 'EAAPfT94PkckBAPqY1ZAFgtMecs7hRQnF4bgh7yu1xeBft4pKx7wVgwldZCangBx6PYPInwwTkL6ZBaL64gLCT7PBrwyqBllS2eYnv2eJBGRgMZAKnh1X8volYUaaCDPZCnLVLAcalF9EV96VLVlG8iGQuqZAQey8dqk0zDLyROMgZDZD'},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: customResponse
            }
        };
        request(options, (error, res) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (res.body.error) {
                console.log('Error: ', res.body.error);
            }
            else if(response.result.fulfillment.speech==="Schedule") {
                preferenceQuickReply();
            }
        });
    });

    apiai.on('error', (error) => {
        console.log(error);
    });

    apiai.end();
}

function senderAction(sender,text) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: 'EAAPfT94PkckBAPqY1ZAFgtMecs7hRQnF4bgh7yu1xeBft4pKx7wVgwldZCangBx6PYPInwwTkL6ZBaL64gLCT7PBrwyqBllS2eYnv2eJBGRgMZAKnh1X8volYUaaCDPZCnLVLAcalF9EV96VLVlG8iGQuqZAQey8dqk0zDLyROMgZDZD'},
        method: 'POST',
        json: {
            recipient: {id: sender},
            "sender_action": "typing_on"
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        else{
            sendMessage(sender,text);
        }
    });
}

module.exports = {
    senderAction: senderAction,
};