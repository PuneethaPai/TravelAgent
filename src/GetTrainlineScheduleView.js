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
        showJourneyList = journeyList.showJourneyList;

    let list_len = journey.schedule.length;
    let listViewList = [];
    listViewDetails.source = journey.source;
    listViewDetails.destination = journey.destination;
    listViewDetails.date = searchParameters.date;
    listViewDetails.seats =searchParameters.numberOfAdults;

    for (let i = 0; i < list_len; i++) {
        let listViewData = {};
        listViewData.start = journey.schedule[i].time.toString();
        listViewData.duration = journey.schedule[i].duration.toString();
        listViewData.fare = journey.schedule[i].cost.toString();
        listViewList.push(listViewData);
    }

    listViewDetails.journeyList = listViewList;

    console.log("Obtained Schedule:-");
    console.log(listViewDetails);
    return {
        attachment: {
            "type": "template",
            "payload": {
                "template_type": "list",
                "elements": showJourneyList(listViewDetails)
            }
        }
    };
}
module.exports = {
    fastrackSummaryDetails:fastrackSummaryDetails,
    listViewDetails:listViewDetails,
    getSchedule:getSchedule
};