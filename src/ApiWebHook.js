const
    request = require('request'),
    stations = require("../assets/stations.json");

var
    recent_schedule=[],
    global_source="London",
    global_destination="Manchester",
    global_date = "28-07-2017",
    global_seats=1,
    fastrackSummaryDetails ={},
    listViewDetails={};


function apiWebHookHandler(req, res){
    let source = req.body.result.parameters['source'];
    let destination = req.body.result.parameters['destination'];
    let date = req.body.result.parameters['journey-date'];
    let seat = parseInt(req.body.result.parameters['seats'], 10);

    if (req.body.result.action === 'fetch_schedule' && source !== "" && destination !== "" && date !== "") {
        console.log(source);

        let source_code = stations[source.toUpperCase()];
        let destination_code = stations[destination.toUpperCase()];

        // fastrackSummaryDetails.origin_crs = source_code;
        // fastrackSummaryDetails.destination_crs = destination_code;
        // listViewDetails.source=source;
        // listViewDetails.destination=destination;

        console.log(destination_code);

        // Check For Incorrect Source Or Destination
        if (typeof destination_code === 'undefined') {
            console.log("destination_code");
            return res.json({
                speech: "The Source is Incorrect",
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
                let listViewList=[];
                for (let i = 0; i < list_len; i++) {
                    let tripSummary = {};
                    let listViewData={};
                    let count = i + 1;
                    let train_data = journeys[i].Legs;
                    let fare = journeys[i].Tickets[0].Total;
                    tripSummary.origin_crs = source_code;
                    tripSummary.destination_crs = destination_code;
                    tripSummary.arrival_date_time = journeys[i].ArrivalDateTime;
                    tripSummary.departure_date_time = journeys[i].DepartureDateTime;
                    // for (let i = 0; i < journeys[i].Tickets.length; i++){
                    //
                    // }
                    tripSummary.total_fare = journeys[i].Tickets[0].Total;
                    tripSummary.ticket_type = journeys[i].Tickets[0].TicketType;
                    tripSummary.route_code = journeys[i].Tickets[0].RouteCode;

                    listViewData.start=train_data[0].OriginDepartureTime.toString();
                    listViewData.end=train_data[0].DestinationArrivalTime.toString();
                    listViewData.duration=train_data[0].Duration.toString();
                    listViewData.fare=journeys[i].Tickets[0].Fare.toString();
                    summaryList.push(tripSummary);
                    listViewList.push(listViewData);
                }
                listViewDetails.journeyList=listViewList;
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


    ///Tarkakke Nilukaddu

    let ordinal = parseInt(req.body.result.parameters['ordinal'], 10) - 1;
    if (req.body.result.action === 'book_ticket' && recent_schedule.length > 0) {
        if ((ordinal + 1) > recent_schedule.length) {
            return res.json({
                speech: "The Option Can not be Choosed",
                displayText: "The Option Can not be Choosed",
                source: 'book_ticket'
            });
        }
        else {
            console.log(recent_schedule);
            console.log(ordinal);
            let selected_start = recent_schedule[ordinal]['start'];
            let selected_end = recent_schedule[ordinal].reach;
            let selected_duration = recent_schedule[ordinal].Duration;
            let selected_fare = parseInt(recent_schedule[ordinal].Fare, 10) * global_seats;
            let summary = "Journey Summary " + "\n" + "Train Starts From " + global_source + " at " + selected_start + "\n" + "Reaches " + global_destination + " by " + selected_end + "\n" + "Journey Date " + global_date + "\n" + "Total Cost £" + selected_fare + "\n" + "Should I go Ahead With this and Confirm Your Ticket?\n";
            console.log(summary);
            return res.json({
                speech: summary,
                displayText: summary,
                source: 'book_ticket'
            });
        }
    }
    let preference = req.body.result.parameters['Preferences']
    if (req.body.result.action === 'apply_preferences' && preference != "" && recent_schedule.length > 0) {
        console.log("Ima here")
        var itin_length = recent_schedule.length
        if (preference == "earliest") {
            console.log("Ima here in Earliest")
            let random_ordinal = 0
            let index = random_ordinal
            let selected_start = recent_schedule[index]['start'];
            let selected_end = recent_schedule[index].reach;
            let selected_duration = recent_schedule[index].Duration;
            let selected_fare = parseInt(recent_schedule[index].Fare, 10) * global_seats;
            let summary = "Your Summary " + "\n" + "Train Starts From " + global_source + " at " + selected_start + "\n" + "Reaches " + global_destination + " by " + selected_end + "\n" + "Journey Date " + global_date + "\n" + "Total Cost £" + selected_fare + "\n" + "Should I go Ahead With this and Confirm Your Ticket?\n";
            console.log(summary);
            return res.json({
                speech: summary,
                displayText: summary,
                source: 'book_ticket'
            });
        } else if (preference == "cheapest") {
            console.log("Ima here in Cheapest")
            let min_cost = 1000
            let cheapest = 0
            for (var i = 0; i < itin_length; i++) {
                let train = recent_schedule[i]
                let cost = parseInt(train.Fare, 10)
                if (min_cost > cost) {
                    min_cost = cost
                    cheapest = i
                }
            }
            let index = cheapest
            console.log(cheapest);
            let selected_start = recent_schedule[index]['start'];
            let selected_end = recent_schedule[index].reach;
            let selected_duration = recent_schedule[index].Duration;
            let selected_fare = parseInt(recent_schedule[index].Fare, 10) * global_seats;
            let summary = "Your " + "\n" + "Train Starts From " + global_source + " at " + selected_start + "\n" + "Reaches " + global_destination + " by " + selected_end + "\n" + "Journey Date " + global_date + "\n" + "Total Cost £" + selected_fare + "\n" + "Should I go Ahead With this and Confirm Your Ticket?\n";
            console.log(summary);
            return res.json({
                speech: summary,
                displayText: summary,
                source: 'book_ticket'
            });


        } else if (preference == "fastest") {
            console.log("I am here in Fastest")
            let min_dur = 1000
            let earliest = 0
            for (var i = 0; i < itin_length; i++) {
                let train = recent_schedule[i]
                var hr = recent_schedule[i].Duration.split(' ')[0].match(/\d/g)
                hr = hr.join("");
                var min = recent_schedule[i].Duration.split(' ')[1].match(/\d/g)
                min = min.join("");
                console.log(hr)
                console.log(min)
                var dur = parseInt(hr, 10) * 60 + parseInt(min, 10)
                if (min_dur > dur) {
                    min_dur = dur
                    earliest = i
                }
            }
            let index = earliest
            let selected_start = recent_schedule[index]['start'];
            let selected_end = recent_schedule[index].reach;
            let selected_duration = recent_schedule[index].Duration;
            let selected_fare = parseInt(recent_schedule[index].Fare, 10) * global_seats;
            let summary = "Your " + "\n" + "Train Starts From " + global_source + " at " + selected_start + "\n" + "Reaches " + global_destination + " by " + selected_end + "\n" + "Journey Date " + global_date + "\n" + "Total Cost £" + selected_fare + "\n" + "Should I go Ahead With this and Confirm Your Ticket?\n";
            console.log(summary);
            return res.json({
                speech: summary,
                displayText: summary,
                source: 'book_ticket'
            });
        }
    }
};

module.exports = {
    fastrackSummaryDetails : fastrackSummaryDetails,
    listViewDetails : listViewDetails,
    apiWebHookHandler : apiWebHookHandler
}