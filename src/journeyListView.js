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
        let url = serverURL + "summary?q=";
        let totalFare = parseInt(journeys[i].fare, 10) * ListViewData.seats;
        format = {
            "title": journeys[i].duration.toString(),
            "subtitle": "Start:" + journeys[i].start + "\n" + "End:" + journeys[i].end + "\n" + "Total Fare: £" + totalFare + "\n",
            "buttons": [
                {
                    "title": "Book",
                    "type": "web_url",
                    "url": url + i,
                }
            ]
        };
        elementList.push(format);
    }
    return elementList;
}

function getSearchURL(searchParameters) {
    let searchURL = "https://et2-m-virgintrains.ttlnonprod.com/dataPassedIn?Origin=" +
        searchParameters.origin + "&Destination=" +
        searchParameters.destination + "&OutboundDate=" +
        searchParameters.outboundDate + "&OutboundTime=" +
        searchParameters.outboundTime + "&NumberOfAdults=" +
        searchParameters.numberOfAdults;
    console.log("Schedule sent with URL:-" + searchURL);
    return searchURL;
}
module.exports = {
    showJourneyList: showJourneyList,
    getSearchURL: getSearchURL
};