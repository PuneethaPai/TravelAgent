const config = require('config');

let serverURL = process.env.serverURL || config.serverURL;

function showJourneyList(ListViewData) {
    let
        journeys = ListViewData.journeyList,
        elementList = [];
    let date = new Date(ListViewData.date).toDateString();
    let banner = {
        "title": ListViewData.source + "  >>>  " + ListViewData.destination,
        "image_url": "https://s-media-cache-ak0.pinimg.com/originals/bd/05/c2/bd05c232baacfe8537c306b884445f22.jpg",
        "subtitle": date + "\n" + ListViewData.seats + " Passenger",
    };
    elementList.push(banner);
    for (let i = 0; i < 3; i++) {
        let totalFare = parseInt(journeys[i].fare, 10) * ListViewData.seats;
        url = serverURL + "book/?source=" + ListViewData.source + "&destination=" + ListViewData.destination + "&day=" + date + "&time=" + journeys[i].start + "&duration=" + journeys[i].duration + "&total_cost=" + totalFare + "&seat=" + ListViewData.seats;
        console.log(url);
        format = {
            "title": journeys[i].start,
            "subtitle": "Duration : " + journeys[i].duration.toString() + "\n" + "Total Fare: Rs. " + totalFare + "\n",
            "buttons": [
                {
                    "title": "Book",
                    "type": "web_url",
                    "url": url,
                }
            ]
        };
        elementList.push(format);
    }
    return elementList;
}
module.exports = {
    showJourneyList: showJourneyList,
};