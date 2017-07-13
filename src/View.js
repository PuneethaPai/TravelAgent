let purposeSlideView = {
    attachment: {
        "type": "template",
        "payload": {
            "template_type": "generic",
            "elements": [
                {
                    "title": "Plan My Journey",
                    "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxiSbi_xuqLYRbQj3wvC0Ndyn2zRpqTr90O1YzwkgFyypfRY13",
                    "subtitle": "Travel with us!",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Get Me On board",
                            "payload": "book me a ticket"
                        }
                    ]
                },
                {
                    "title": "Show Upcoming Trains to London",
                    "image_url": "https://us.123rf.com/450wm/jemastock/jemastock1510/jemastock151001176/47322629-london-concept-with-landmarks-icons-design.jpg?ver=6",
                    "subtitle": "London Bridge is falling Down ....falling Down...",
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Yes Go!",
                            "payload": "Book me a ticket today afternoon to London"
                        }
                    ]
                },{
                    "title": "About Virgin Trains",
                    "image_url": "http://www.2120580.cloudcommercepro.com/wp-content/uploads/2017/04/virgin.png",
                    "subtitle": "We’re on a mission to make every second you spend with us awesome",
                    "buttons": [
                        {
                            "type": "web_url",
                            "title": "Know More",
                            "url": "https://www.virgintrains.co.uk/about",
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