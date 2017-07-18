/**
 * Created by puneethp on 18/07/17.
 */
let
    fastrackSummaryDetails = {},
    listViewDetails = {};

function getSchedule() {
    const
        apiWebhook = require('./ApiWebHook.js'),
        journeyList = require('./journeyListView.js');

    let
        journey = apiWebhook.journey,
        searchParameters = apiWebhook.searchParameters,
        showJourneyList = journeyList.showJourneyList,
        getSearchURL = journeyList.getSearchURL;

    console.log(journey);
    let list_len = journey.summary.length;
    let summaryList = [];
    let listViewList = [];
    listViewDetails.source = journey.source;
    listViewDetails.destination = journey.destination;
    listViewDetails.date = searchParameters.outboundDate;
    listViewDetails.seats =searchParameters.numberOfAdults;

    for (let i = 0; i < list_len; i++) {
        let tripSummary = {};
        let listViewData = {};
        let train_data = journey.summary[i].Legs;
        tripSummary.origin_crs = searchParameters.origin;
        tripSummary.destination_crs = searchParameters.destination;
        tripSummary.arrival_date_time = journey.summary[i].ArrivalDateTime;
        tripSummary.departure_date_time = journey.summary[i].DepartureDateTime;
        tripSummary.seats = journey.summary[i].Tickets[0].Adults.Number;
        tripSummary.total_fare = journey.summary[i].Tickets[0].Total;
        tripSummary.ticket_type = journey.summary[i].Tickets[0].TicketType;
        tripSummary.route_code = journey.summary[i].Tickets[0].RouteCode;

        listViewData.start = train_data[0].OriginDepartureTime.toString();
        listViewData.end = train_data[0].DestinationArrivalTime.toString();
        listViewData.duration = train_data[0].Duration.toString();
        listViewData.fare = journey.summary[i].Tickets[0].Fare.toString();

        summaryList.push(tripSummary);
        listViewList.push(listViewData);

    }

    listViewDetails.journeyList = listViewList;
    fastrackSummaryDetails.summaryList = summaryList;

    console.log("Obtained Schedule:-");
    console.log(listViewDetails);
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
module.exports = {
    fastrackSummaryDetails:fastrackSummaryDetails,
    listViewDetails:listViewDetails,
    getSchedule:getSchedule
};