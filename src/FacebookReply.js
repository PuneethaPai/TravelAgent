const
    request = require('request'),
    config = require('config'),
    userPreference = require('./UserPrefernce.js'),
    view = require('./View.js');

let
    serverURL = process.env.serverURL || config.serverURL,
    pageAccessToken = process.env.pageAccessToken || config.pageAccessToken,
    ClientAccessToken = process.env.clientAccessToken || config.clientAccessToken,
    apiaiApp = require('apiai')(ClientAccessToken),
    preffered_train = userPreference.preferedTrain,
    purposeSlideView = view.purposeSlideView,
    timePreferenceView = view.timePreferenceView,
    travelPreferenceView = view.travelPreferenceView,
    datePreferenceView = view.datePreferenceView,
    getSchedule = require('./GetTrainlineScheduleView.js').getSchedule;

function getFacebookFormattedReply(aiText, action) {
    if (action.indexOf("greetings.") > -1 || action.indexOf("purpose") > -1) {
        return {
            "text": aiText,
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": "What can I do?",
                    "payload": "What can I do?",
                },
                {
                    "content_type": "text",
                    "title": "Book a ticket for me",
                    "payload": "Book a ticket for me",
                }]
        }
    }
    if (action.indexOf("options") > -1) {
        return purposeSlideView;
    }
    if (aiText === 'Ask Date') {
        return datePreferenceView;
    }
    if (aiText === 'Ask Time') {
        return timePreferenceView;
    }
    if (aiText === "Schedule") {
        return getSchedule();
    }
    if (aiText === "Confirm") {
        return {
            attachment: {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title":preffered_train.start ,
                            "subtitle": "Duration : " + preffered_train.duration+ "\n" + "Total Fare: Rs. " + preffered_train.fare + "\n",
                            "image_url": "https://invitationdigital-res-2.cloudinary.com/image/upload/f_auto,fl_strip_profile,w_628,c_crop/w_628,h_384,c_fill/trainline_up_to_43_off_tickets_with_advance_bookings_at_trainline_premium_offer_image.jpg",
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": serverURL+"book",
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
    };
}
function sendMessage(sender, text) {
    console.log("Sender: " + sender + "; Mesage: " + text);
    let apiai = apiaiApp.textRequest(text, {
        sessionId: sender // use any arbitrary id
    });

    function preferenceQuickReply() {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: pageAccessToken},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: travelPreferenceView
            }
        }, (error, resp) => {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (resp.body.error) {
                console.log('Error: ', resp.body.error);
            }
            else {
                console.log("Success");
            }
        });
    }

    apiai.on('response', (response) => {
        let aiText = response.result.fulfillment.speech;
        let action = response.result.action;
        let customResponse = getFacebookFormattedReply(aiText, action);
        let options = {
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: pageAccessToken},
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
            else if (aiText === "Schedule") {
                preferenceQuickReply();
            }
        });
    });

    apiai.on('error', (error) => {
        console.log(error);
    });

    apiai.end();
}

function senderAction(sender, text) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: pageAccessToken},
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
        else {
            sendMessage(sender, text);
        }
    });
}

module.exports = {
    senderAction: senderAction,
};