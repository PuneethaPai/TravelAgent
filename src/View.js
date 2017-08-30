let purposeSlideView = {
    attachment: {
        "type": "template",
        "payload": {
            "template_type": "generic",
            "elements": [
                {
                    "title": "Plan My Journey",
                    "image_url": "https://foto.haberler.com/haber/2017/03/17/tren-rayina-tuzaklanan-120-kilogram-patlayici-imha-9384574_2447_o.jpg",
                    "subtitle": "Travel with us!",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Get Me On board!",
                            "payload": "book me a ticket"
                        }
                    ]
                },
                {
                    "title": "Show Upcoming Trains to Goa",
                    "image_url": "https://twosomelife.com/wp-content/uploads/2016/04/twosomelife_goa.jpg",
                    "subtitle": "A Perfect Holiday Destination !!",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Yes Go!",
                            "payload": "Book me a ticket today afternoon to Panjim"
                        }
                    ]
                }
            ]
        }
    }
};

let timePreferenceView = {
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

let datePreferenceView = {
    "text": "Choose Day Of Travel",
    "quick_replies": [
        {
            "content_type": "text",
            "title": "Today",
            "payload": "Today",
        },
        {
            "content_type": "text",
            "title": "Tomorrow",
            "payload": "Tomorrow",
        },
        {
            "content_type": "text",
            "title": "Next Monday",
            "payload": "Next Monday",
        },
        {
            "content_type": "text",
            "title": "Next Friday",
            "payload": "Next Friday",
        }
    ]
};

let travelPreferenceView = {
    "text": "Any Preference ?",
    "quick_replies": [
        {
            "content_type": "text",
            "title": "Find Cheapest",
            "image_url": "http://medias.development-institute.com/Site_dedie/2017/ICI/Picto_Low_Cost.png",
            "payload": "Get The Cheapest",
        },
        {
            "content_type": "text",
            "title": "Get The Fastest",
            "image_url": "https://maxcdn.icons8.com/Share/icon/Animals//running_rabbit_filled1600.png",
            "payload": "Get The Fastest",
        },
        {
            "content_type": "text",
            "title": "Show Earliest",
            "image_url": "https://d30y9cdsu7xlg0.cloudfront.net/png/446164-200.png",
            "payload": "Show Earliest",
        }
    ]
};
module.exports = {
    purposeSlideView: purposeSlideView,
    timePreferenceView: timePreferenceView,
    travelPreferenceView: travelPreferenceView,
    datePreferenceView: datePreferenceView
};