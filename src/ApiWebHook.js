const
    request = require('request'),
    stations = require("../assets/stations.json"),
    extractUserPreferenceTrain = require('./UserPrefernce.js').extractUserPreferedTrain,
    dayTimeMap = {
        "morning": '06-00',
        "afternoon": '12-00',
        "evening": '16-00',
        "night": '20-00'
    };

let
    fastrackSummaryDetails = {},
    listViewDetails = {},
    searchParameters = {};


function apiWebHookHandler(req, res) {

    function validate(stationName, Label) {
        if (!stations[stationName.toUpperCase()]) {
            return res.json({
                speech: "The " + Label + " is Incorrect",
                displayText: "The " + Label + " is Incorrect",
                source: 'fetch_schedule'
            });
        }
    }

    let
        parameters = req.body.result.parameters,
        journeyTime = dayTimeMap[parameters['time']],

        source = parameters['source'],
        destination = parameters['destination'],
        date = parameters['journey-date'],
        seat = parseInt(parameters['seats'], 10);

    if (req.body.result.action === 'fetch_schedule' && source !== "") {
        validate(source, "Source");
    }

    if (req.body.result.action === 'fetch_schedule' && destination !== "") {
        validate(destination, "Destination");
    }

    if (req.body.result.action === 'fetch_schedule' && source !== "" && destination !== "") {
        let source_code = stations[source.toUpperCase()];
        let destination_code = stations[destination.toUpperCase()];
        if (destination_code === source_code) {
            return res.json({
                speech: "Great I guess You Are Already There\nHave a great time",
                displayText: "... Great I guess You Are Already There\nHave a great time",
                source: 'fetch_schedule'
            });
        }
    }
    if (req.body.result.action === 'fetch_schedule' && source !== "" && destination !== "" && date !== "" && journeyTime === undefined) {
        return res.json({
            speech: "Ask Time",
            displayText: "Ask Time",
            source: 'fetch_schedule'
        });
    }
    if (req.body.result.action === 'fetch_schedule' && source !== "" && destination !== "" && date !== "" && journeyTime !== "") {
        let source_code = stations[source.toUpperCase()];
        let destination_code = stations[destination.toUpperCase()];
        listViewDetails.source = source;
        listViewDetails.destination = destination;
        listViewDetails.date = date;
        listViewDetails.seats = seat;

        searchParameters.origin = source_code;
        searchParameters.destination = destination_code;
        searchParameters.outboundDate = date;
        searchParameters.outboundTime = journeyTime;
        searchParameters.numberOfAdults = seat;
        console.log("Search Parameters:-");
        console.log(searchParameters);
        let options = {
            url: 'https://et2-fasttrackapi.ttlnonprod.com/v1/Search',
            method: 'GET',
            qs: {
                'journeyRequest': searchParameters
            },
            headers: {
                "Accept": "application/json",
                "TocIdentifier": "vtMobileWeb"
            }
        };
        request(options, (err, response) => {
            if (!err && response.statusCode === 200) {
                let json = JSON.parse(response.body);
                let journeys = json.OutboundJournies;
                let list_len = journeys.length;
                let summaryList = [];
                let listViewList = [];
                for (let i = 0; i < list_len; i++) {
                    let tripSummary = {};
                    let listViewData = {};
                    let train_data = journeys[i].Legs;
                    tripSummary.origin_crs = source_code;
                    tripSummary.destination_crs = destination_code;
                    tripSummary.arrival_date_time = journeys[i].ArrivalDateTime;
                    tripSummary.departure_date_time = journeys[i].DepartureDateTime;
                    tripSummary.seats = journeys[i].Tickets[0].Adults.Number;
                    tripSummary.total_fare = journeys[i].Tickets[0].Total;
                    tripSummary.ticket_type = journeys[i].Tickets[0].TicketType;
                    tripSummary.route_code = journeys[i].Tickets[0].RouteCode;

                    listViewData.start = train_data[0].OriginDepartureTime.toString();
                    listViewData.end = train_data[0].DestinationArrivalTime.toString();
                    listViewData.duration = train_data[0].Duration.toString();
                    listViewData.fare = journeys[i].Tickets[0].Fare.toString();

                    summaryList.push(tripSummary);
                    listViewList.push(listViewData);
                }
                listViewDetails.journeyList = listViewList;
                fastrackSummaryDetails.summaryList = summaryList;

                console.log("Obtained Schedule:-");
                console.log(listViewDetails);
                return res.json({
                    speech: "Schedule",
                    displayText: "Schedule",
                    source: 'fetch_schedule'
                });
            } else {
                return res.status(400).json({
                    status: {
                        code: 400,
                        errorType: 'I failed to look up the Schedule'
                    }
                });
            }
        })
    }

    let preference = parameters['Preferences'];

    if (req.body.result.action === 'apply_preferences' && preference !== "" && listViewDetails.journeyList.length > 0) {
        return res.json(extractUserPreferenceTrain(listViewDetails, preference, seat))
    }
}

module.exports = {
    fastrackSummaryDetails: fastrackSummaryDetails,
    listViewDetails: listViewDetails,
    apiWebHookHandler: apiWebHookHandler,
    searchParameters: searchParameters
};