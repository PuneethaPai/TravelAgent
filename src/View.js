let purposeSlideView = {
    attachment: {
        "type": "template",
        "payload": {
            "template_type": "generic",
            "elements": [
                {
                    "title": "Travel with Us",
                    "image_url": "https://mvp.tribesgds.com/dyn/UQ/OE/UQOE-wK-8g0/_/tIIyubfFgL0/Bqnr/trainline-logo.png",
                    "subtitle": "We\'ve got the best seat for you",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "book me a ticket",
                            "payload": "book me a ticket"
                        }
                    ]
                }
            ]
        }
    }
};

let timePreference = {
    "text": "Choose Departure Time",
    "quick_replies": [
        {
            "content_type": "text",
            "title": "Morning",
            "image_url": "https://maxcdn.icons8.com/Share/icon/Plants//plant_under_sun1600.png",
            "payload": "Morning",
        },
        {
            "content_type": "text",
            "title": "Afternoon",
            "image_url": "https://d30y9cdsu7xlg0.cloudfront.net/png/401715-200.png",
            "payload": "Afternoon",
        },
        {
            "content_type": "text",
            "title": "Evening",
            "image_url": "https://www.shareicon.net/data/512x512/2016/07/09/793459_sun_512x512.png",
            "payload": "Evening",
        },
        {
            "content_type": "text",
            "title": "Night",
            "image_url": "https://d30y9cdsu7xlg0.cloudfront.net/png/1028-200.png",
            "payload": "Night",
        }
    ]
};

module.exports = {
    purposeSlideView:purposeSlideView,
    timePreference:timePreference
}