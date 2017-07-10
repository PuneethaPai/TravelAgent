const
    request = require('request'),
    moment = require('moment-timezone'),
    stations = require("../assets/stations.json");

let global_seats = 1,
    fastrackSummaryDetails = {},
    listViewDetails = {},
    preferedTrain = {},
    searchParameters = {};

function apiWebHookHandler(req, res) {
    let source = req.body.result.parameters['source'],
        destination = req.body.result.parameters['destination'],
        date = req.body.result.parameters['journey-date'],
        seat = parseInt(req.body.result.parameters['seats'], 10);

    if (req.body.result.action === 'fetch_schedule' && source !== "" && destination !== "" && date !== "") {
        let source_code = stations[source.toUpperCase()];
        let destination_code = stations[destination.toUpperCase()];

        listViewDetails.source = source;
        listViewDetails.destination = destination;
        listViewDetails.seats = seat;

        // Check For Incorrect Source Or Destination
        if (typeof destination_code === 'undefined') {
            return res.json({
                speech: "The Destination is Incorrect",
                displayText: "The Destination is Incorrect",
                source: 'fetch_schedule'
            });
        }

        if (!source_code) {
            return res.json({
                speech: "The Source is Incorrect",
                displayText: "The Source is Incorrect",
                source: 'fetch_schedule'
            });
        }

        if (destination_code === source_code) {
            return res.json({
                speech: "Great I guess You Are Already There\nHave a great time",
                displayText: "... Great I guess You Are Already There\nHave a great time",
                source: 'fetch_schedule'
            });
        }

        let now = moment(req.body.timestamp.toString());
        let journeyTime = now.clone().tz("Europe/London").format("hh-mm");
        searchParameters.origin = source_code;
        searchParameters.destination = destination_code;
        searchParameters.outboundDate = date;
        searchParameters.outboundTime = journeyTime;
        searchParameters.numberOfAdults = seat;
        console.log("Search Parameters:- " + searchParameters);
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

                console.log("Obtained Schedule:- " + listViewDetails);
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

    let preference = req.body.result.parameters['Preferences'];

    function PreferenceDetailExtract(index) {
        preferedTrain.start = listViewDetails.journeyList[index].start;
        preferedTrain.end = listViewDetails.journeyList[index].end;
        preferedTrain.duration = listViewDetails.journeyList[index].duration;
        preferedTrain.fare = parseInt(listViewDetails.journeyList[index].fare, 10) * global_seats;
        preferedTrain.index = index;
        console.log("User Prefered train:- " + preferedTrain);
        return res.json({
            speech: "Confirm",
            displayText: "Confirm",
            source: 'book_ticket'
        });
    }

    if (req.body.result.action === 'apply_preferences' && preference !== "" && listViewDetails.journeyList.length > 0) {
        let itin_length = listViewDetails.journeyList.length;

        if (preference === "earliest") {
            let index = 0;
            return PreferenceDetailExtract(index);
        } else if (preference === "cheapest") {
            let min_cost = 1000;
            let cheapest = 0;
            for (i = 0; i < itin_length; i++) {
                let train = listViewDetails.journeyList[i];
                let cost = parseInt(train.fare, 10);
                if (min_cost > cost) {
                    min_cost = cost;
                    cheapest = i
                }
            }
            return PreferenceDetailExtract(cheapest);
        } else if (preference === "fastest") {
            let min_dur = 1000;
            let fastest = 0;
            for (i = 0; i < itin_length; i++) {
                let train = listViewDetails.journeyList[i];

                let hr = train.duration.split(' ')[0].match(/\d/g);
                hr = hr.join("");
                let min = train.duration.split(' ')[1].match(/\d/g);
                min = min.join("");

                const dur = parseInt(hr, 10) * 60 + parseInt(min, 10);
                if (min_dur > dur) {
                    min_dur = dur;
                    fastest = i
                }
            }
            return PreferenceDetailExtract(fastest);
        }
    }
}
module.exports = {
    fastrackSummaryDetails: fastrackSummaryDetails,
    listViewDetails: listViewDetails,
    apiWebHookHandler: apiWebHookHandler,
    preferedTrain: preferedTrain,
    searchParameters: searchParameters
};