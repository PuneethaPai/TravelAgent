const
    request = require('request'),
    stations = require("../assets/stations.json");

let recent_schedule = [],
    global_source = "London",
    global_destination = "Manchester",
    global_date = "28-07-2017",
    global_seats = 1,
    fastrackSummaryDetails = {},
    listViewDetails = {},
    preferedTrain={};

function apiWebHookHandler(req, res) {
    let i;
    let source = req.body.result.parameters['source'];
    let destination = req.body.result.parameters['destination'];
    let date = req.body.result.parameters['journey-date'];
    let seat = parseInt(req.body.result.parameters['seats'], 10);
    console.log("hello");
    if (req.body.result.action === 'fetch_schedule' && source !== "" && destination !== "" && date !== "") {
        console.log(source);

        let source_code = stations[source.toUpperCase()];
        let destination_code = stations[destination.toUpperCase()];

        // fastrackSummaryDetails.origin_crs = source_code;
        // fastrackSummaryDetails.destination_crs = destination_code;
        listViewDetails.source=source;
        listViewDetails.destination=destination;
        listViewDetails.seats=seat;

        console.log(destination_code);

        // Check For Incorrect Source Or Destination
        if (typeof destination_code === 'undefined') {
            console.log("destination_code");
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

///Not needed>
        global_source = source;
        global_destination = destination;
        global_date = date;
        global_seats = seat;
///Not needed<

        let options = {
            url: 'https://et2-fasttrackapi.ttlnonprod.com/v1/Search',
            method: 'GET',
            qs: {
                'journeyRequest': {
                    'origin': source_code,
                    'destination': destination_code,
                    'outboundDate': date,

                    'numberOfAdults': seat
                }
            },
            headers: {
                "Accept": "application/json",
                "TocIdentifier": "vtMobileWeb"
            }
        };
        request(options, (err, response) => {
            console.log(response.statusCode);
            if (!err && response.statusCode === 200) {
                let json = JSON.parse(response.body);
                let journeys = json.OutboundJournies;
                let list_len = journeys.length;
                let schedule = "Please select the train you would like to book" + "\n\n";
                let save_schedule = [];
                let summaryList = [];
                let listViewList = [];
                for (let i = 1; i < list_len; i++) {
                    let tripSummary = {};
                    let listViewData = {};
                    let count = i + 1;
                    let train_data = journeys[i].Legs;
                    let fare = journeys[i].Tickets[0].Total;
                    tripSummary.origin_crs = source_code;
                    tripSummary.destination_crs = destination_code;
                    tripSummary.arrival_date_time = journeys[i].ArrivalDateTime;
                    tripSummary.departure_date_time = journeys[i].DepartureDateTime;
                    tripSummary.seats=journeys[i].Tickets[0].Adults.Number;
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

                console.log(fastrackSummaryDetails);
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

    let preference = req.body.result.parameters['Preferences'];

    function PreferenceDetailExtract(index) {
        preferedTrain.start = listViewDetails.journeyList[index].start;
        preferedTrain.end = listViewDetails.journeyList[index].end;
        preferedTrain.duration = listViewDetails.journeyList[index].duration;
        preferedTrain.fare = parseInt(listViewDetails.journeyList[index].fare, 10) * global_seats;
        preferedTrain.index=index;
        console.log(preferedTrain);
        return res.json({
            speech: "Confirm",
            displayText: "Confirm",
            source: 'book_ticket'
        });
    }

    if (req.body.result.action === 'apply_preferences' && preference !== "" && listViewDetails.journeyList.length > 0) {
        let itin_length = listViewDetails.journeyList.length;

        console.log(itin_length);

        if (preference === "earliest") {
            console.log("Ima here in Earliest");
            let index = 0;
            return PreferenceDetailExtract(index);
        } else if (preference === "cheapest") {
            console.log("I'am here in Cheapest");
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
            console.log(cheapest);
            return PreferenceDetailExtract(cheapest);
        } else if (preference === "fastest") {
            console.log("I am here in Fastest");
            let min_dur = 1000;
            let fastest = 0;
            for (i = 0; i < itin_length; i++) {
                let train = listViewDetails.journeyList[i];

                let hr = listViewDetails.journeyList[i].duration.split(' ')[0].match(/\d/g);
                hr = hr.join("");
                let min = listViewDetails.journeyList[i].duration.split(' ')[1].match(/\d/g);
                min = min.join("");
                console.log(hr);
                console.log(min);

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
    preferedTrain:preferedTrain
};